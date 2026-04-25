import type { ExpoConfig } from "expo/config";
import { withSentry } from "@sentry/react-native/expo";

type PluginProps = Parameters<typeof withSentry>[1];
type SentryExpoConfigPluginProps = Omit<NonNullable<PluginProps>, "authToken">;

/**
 * A plugin for the Expo config to automatically push source maps to Sentry.
 *
 * NOTE: This file must not import any runtime from `expo` / `expo-router` / `@sentry/react-native`
 * (SDK main entry) because it is loaded by Expo's Node process while evaluating `app.config.*`.
 */
export const withSentryConfig = (config: ExpoConfig, pluginProps?: SentryExpoConfigPluginProps) =>
  withSentry(config, {
    url: "https://sentry.io/",
    project: process.env.EXPO_PUBLIC_SENTRY_PROJECT,
    organization: process.env.EXPO_PUBLIC_SENTRY_ORG,
    ...pluginProps,
  });
