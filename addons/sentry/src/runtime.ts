/** biome-ignore-all lint/suspicious/noConsole: Allow console logging in development */
import { isRunningInExpoGo } from "expo";
import { useNavigationContainerRef } from "expo-router";
import * as React from "react";
import { useEffect } from "react";

// IMPORTANT: avoid `import * as Sentry` at the top level.
// Node 24+ can break while resolving `@sentry/react-native` main entry in non-bundled contexts
// (Expo config evaluation, plain node smoke tests, etc). Metro is fine, but this keeps Node safe.
type SentryModule = typeof import("@sentry/react-native");

const getSentry = (): SentryModule => require("@sentry/react-native") as SentryModule;

let navIntegration: ReturnType<SentryModule["reactNavigationIntegration"]> | undefined;
const getNavIntegration = () => {
  if (navIntegration) {
    return navIntegration;
  }

  navIntegration = getSentry().reactNavigationIntegration({
    enableTimeToInitialDisplay: !isRunningInExpoGo(),
    routeChangeTimeoutMs: 1000,
  });
  return navIntegration;
};

/**
 * Initialize Sentry with the given DSN.
 * @param dsn - The Sentry DSN
 * @see https://docs.sentry.io/platforms/react-native/manual-setup/expo/
 */
export const initSentry = () => {
  if (globalThis.__addonsSentryInitialized) {
    return;
  }

  const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;
  if (!dsn) {
    throw new Error("[Addons:Sentry/Runtime] EXPO_PUBLIC_SENTRY_DSN is not set");
  }

  const Sentry = getSentry();
  Sentry.init({
    dsn,
    sendDefaultPii: true,
    tracesSampleRate: 0.2,
    profilesSampleRate: 0,
    enableTombstone: true,
    replaysOnErrorSampleRate: 1.0,
    replaysSessionSampleRate: 0.1,
    integrations: [Sentry.mobileReplayIntegration(), getNavIntegration()],
    environment: __DEV__ ? "development" : "production",
  });

  globalThis.__addonsSentryInitialized = true;
};

declare global {
  // eslint-disable-next-line no-var
  var __addonsSentryInitialized: boolean | undefined;
}

/**
 * Wrap the Root layout component with Sentry.
 * @param Component Root layout component (app/_layout.tsx)
 */
export const SentryWrap = <P extends Record<string, unknown>>(Component: React.ComponentType<P>) => {
  // biome-ignore lint/correctness/noNestedComponentDefinitions: This is a stable HOC wrapper, not a render-time definition.
  const Wrapped: React.FC<P> = (props) => {
    const ref = useNavigationContainerRef();

    // https://docs.sentry.io/platforms/react-native/tracing/instrumentation/expo-router/
    useEffect(() => {
      if (ref) {
        getNavIntegration().registerNavigationContainer(ref);
      }
    }, [ref]);

    return React.createElement(Component, props);
  };

  Wrapped.displayName = `SentryWrap(${Component.displayName ?? Component.name ?? "Component"})`;

  return getSentry().wrap(Wrapped);
};
