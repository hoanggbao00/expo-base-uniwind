# Sentry Addon (Expo SDK 54 + Expo Router)

> Có thể chạy script setup để tự động cấu hình:
```bash
bun --cwd addons/sentry run setup
```
hoặc từ root:
```bash
bun addons:sentry
```

Addon này cung cấp:
- Base Package: [@sentry/react-native](https://docs.sentry.io/platforms/react-native/)
- Tracing Integrations:
  - Tracing
  - Replay
  - Expo Router Tracing
- Tự động upload source map khi build

Tài liệu tham khảo:
- Quick Start (React Native): [Docs](https://docs.sentry.io/platforms/react-native/)
- Manual Setup: [Docs](https://docs.sentry.io/platforms/react-native/manual-setup/)
- Manual setup (Expo): [Docs](https://docs.sentry.io/platforms/react-native/manual-setup/expo/)
- Expo Router instrumentation: [Docs](https://docs.sentry.io/platforms/react-native/tracing/instrumentation/expo-router/)

## 1) Chuẩn bị (env + Sentry)

### 1.1) Environment (Dev + Prod)
```bash
SENTRY_AUTH_TOKEN="sntry_auth_token_here" # Get from https://[org_name].sentry.io/settings/auth-tokens/
EXPO_PUBLIC_SENTRY_DSN="dsn_url"
EXPO_PUBLIC_SENTRY_PROJECT="project_slug"
EXPO_PUBLIC_SENTRY_ORG="organization"
```

### 1.2) Setup trên Sentry

- **Tạo Organization**: [Sentry Organizations](https://sentry.io/settings/organizations/)
- **Tạo Project (React Native)**: [Create a Project](https://sentry.io/projects/new/)
- **Lấy DSN**: Project → Settings → Client Keys (DSN)
- **Tạo Auth Token** để upload sourcemaps/artifacts: [Auth Tokens](https://sentry.io/settings/account/api/auth-tokens/)

## 2) Tích hợp

### 2.1) Thêm dependency vào Native
```json
{
  "@addons/sentry": "workspace:*",
  "@sentry/react-native": "catalog:"
}
```
sau đó chạy
```bash
bun install
```

### 2.2) Config [app.config.ts](/apps/native/app.config.ts)
> Bước này sẽ tự động upload source map lên sentry sau khi build, release version sẽ lấy theo `version` trong `apps/native/package.json`.

```ts
import { withSentryConfig } from "@addons/sentry/config";

const config = {/*app config */}

export default withSentryConfig(config); // <- Wrap config with this

// Override default config
// export default withSentryConfig(config, {override_config});
```

### 2.3) Add to [Metro Config](/apps/native/metro.config.js)
> Bước này unique Debug IDs được gắn với source maps nào
[References](https://docs.sentry.io/platforms/react-native/manual-setup/expo/#add-sentry-metro-plugin)
```js
// const { getDefaultConfig } = require("expo/metro-config");
const { getSentryExpoConfig } = require("@sentry/react-native/metro");

// const config = getDefaultConfig(projectRoot);
const config = getSentryExpoConfig(projectRoot);

export default config;
```

### 2.3) Setup [Root Layout](/apps/native/src/app/_layout.tsx)
> Bước này init Sentry tracking

```tsx
import { initSentry, SentryWrap } from "@addons/sentry/runtime";

try {
  initSentry();
  devLog.info("✅ [Sentry] Initialized");
} catch (error) {
  devLog.error("❌ [Sentry] Failed to initialize", error);
}

const Layout = () => {/*Layout Component*/}

export default SentryWrap(Layout);
```

## 3) Test
```tsx
<PressableOpacity
  onPress={() => {
    throw new Error("Test Sentry");
  }}
>
  <Text center>Test Sentry</Text>
</PressableOpacity>
```
