# expo-base-uniwind (monorepo)

Monorepo Expo (SDK 55) + Expo Router, opinionated về DX và conventions:

- **Expo Router** (file-based routing)
- **Uniwind** (Tailwind-style utilities cho React Native)
- **React Query** cho server state
- **Ultracite/Biome** cho format + lint
- **Lefthook** cho git hooks

Repo này dùng **Bun workspaces**:

- `apps/native`: app Expo chính
- `addons/*`: các addon/package dùng chung (ví dụ `addons/sentry`)

## Tech stack

- Expo SDK: `~55.x`
- React / React Native: `19.2.0` / `0.83.6`
- Routing: Expo Router
- Styling: Uniwind + Tailwind v4
- State: Zustand + MMKV (persist)
- Data fetching/caching: `@tanstack/react-query`
- Code quality: Ultracite (Biome)

## Requirements

### General

- **Bun** (package manager / runtime)
- **Git**
- **Android Studio** (nếu build/run Android native)
- **Xcode** (nếu build/run iOS native)

### Android (install qua Android Studio)

Khuyến nghị dùng **Android Studio** làm “single entry point”: cài IDE → mở **SDK Manager** và cài các mục bên dưới (flow này cũng cài **platform-tools** gồm `adb`).

| Component | Notes |
| --- | --- |
| **JDK 17** | Required cho Gradle / RN Android builds. Có thể dùng JDK đi kèm Android Studio. |
| **Android SDK Platform 36** | Match với `compileSdkVersion: 36` trong `apps/native/app.config.ts` (`expo-build-properties`). |
| **Android SDK Build-Tools 36.0.0** | Match `buildToolsVersion: 36.0.0`. |
| **Android SDK Platform-Tools** | Bao gồm `adb`. |
| **NDK** | Project pin `28.0.12674087` (chỉ cần nếu build native code). |

## Getting started (từ root)

### 1) Install dependencies

```bash
bun install
```

### 2) Setup environment variables

Env files nằm trong `apps/native/`:

- `apps/native/.env.development.local` (dev)
- `apps/native/.env.production.local` (release/prod)

Tạo file env từ sample:

```bash
cp apps/native/.env.example apps/native/.env.development.local
```
```bash
cp apps/native/.env.example apps/native/.env.production.local
```

### 3) Run app

Start Metro / Expo dev server:

```bash
bun start
```

Run Android (dev client):

```bash
bun android
```

Run iOS:

```bash
bun ios
```

## Environment variables

Template values: `apps/native/.env.example`.

| Variable | Required | Description |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | optional | Base URL cho API. |
| `SENTRY_AUTH_TOKEN` | optional | Token upload sourcemaps (nếu dùng Sentry addon). |
| `EXPO_PUBLIC_SENTRY_DSN` | optional | DSN cho Sentry. |
| `EXPO_PUBLIC_SENTRY_PROJECT` | optional | Sentry project slug. |
| `EXPO_PUBLIC_SENTRY_ORG` | optional | Sentry org slug. |

## Monorepo structure

- `apps/`
  - `native/` (Expo app)
    - `app.config.ts` (Expo config, build props)
    - `src/` (import alias `@/*`)
      - `app/` (routes – Expo Router)
      - `components/` (UI components)
      - `components/tw/` (Uniwind-wrapped primitives)
      - `hooks/`, `i18n/`, `providers/`, `state/`, `styles/`, `utils/`, `lib/`, `assets/`, ...
    - `scripts/build-android.sh` (local Android release build)
- `addons/`
  - `sentry/` (Sentry addon cho Expo SDK 55 + Expo Router)

## Scripts (từ root)

Scripts được expose ở root `package.json` và sẽ chạy trong `apps/native`:

| Command | Description |
| --- | --- |
| `bun start` | Start Expo dev server (`apps/native`: `expo start`). |
| `bun android` | Run Android (`apps/native`: `expo run:android`). |
| `bun ios` | Run iOS (`apps/native`: `expo run:ios`). |
| `bun prebuild:android` | Generate Android native project (`expo prebuild --platform android`). |
| `bun prebuild:ios` | Generate iOS native project (`expo prebuild --platform ios`). |
| `bun build:apk` | Build **release APK** (local) qua `apps/native/scripts/build-android.sh`. |
| `bun build:aab` | Build **release AAB** (local) qua `apps/native/scripts/build-android.sh`. |
| `bun typecheck` | Typecheck TypeScript (trong `apps/native`). |
| `bun check` | Run Ultracite checks (root). |
| `bun fix` | Auto-fix formatting/lint via Ultracite (root). |
| `bun prepare` | Install git hooks (`lefthook install`). |

### Android release build notes

- **Keystore/signing**: update trong `apps/native/scripts/build-android.sh` trước khi build APK/AAB.
- Script build sẽ set `NODE_ENV=production` và ưu tiên load `apps/native/.env.production.local` (fallback sang `apps/native/.env.local` nếu có).

## Addons

- **Sentry**: xem hướng dẫn tại `addons/sentry/README.md` (env + config `app.config.ts` + init trong root layout).
