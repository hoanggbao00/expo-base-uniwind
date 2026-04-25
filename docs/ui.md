# Giao diện (UI) — tài liệu ngắn

> Tài liệu liệt kê các resource cần dùng khi xây dựng UI

**Cách dùng nhanh:**

- Component / Layer: [components.md](/.agents/skills/expo-55-uniwind/references/components.md)
- Màu & Theme: [colors-and-theming.md](/.agents/skills/expo-55-uniwind/references/colors-and-theming.md)
- Bố cục & Safe Area: [sizing-and-layout.md](/.agents/skills/expo-55-uniwind/references/sizing-and-layout.md)
- Store & Persist Store: [stores-and-state.md](/.agents/skills/expo-55-uniwind/references/stores-and-state.md)
- Ngôn ngữ: [i18n.md](/.agents/skills/expo-55-uniwind/references/i18n.md)
- Format & Lint: [biome-conventions.md](/.agents/skills/expo-55-uniwind/references/biome-conventions.md)
- Animation: [animation.mdc](/.cursor/rules/animations.mdc)

| File | Mô tả |
|-----|--------|
| [`SKILL.md`](/.agents/skills/expo-55-uniwind/SKILL.md) | Tổng quan stack; cấu trúc thư mục dưới `apps/native/`; liên kết tới từng `references/*.md`; quy tắc chung (`@/`, `cn()`, `devLog`, …) |
| [`components.md`](/.agents/skills/expo-55-uniwind/references/components.md) | Định nghĩa các Native Component để có thể nhận Tailwind Classname ở cả Android và iOS; Có: `View`, `SafeAreaView`, `KeyboardAvoidingView`, `Text`, `Link`, `Pressable`, `PressableScale`, `PressableOpacity`, `ScrollView`, `Icon`,... |
| [`colors-and-theming.md`](/.agents/skills/expo-55-uniwind/references/colors-and-theming.md) | Token màu `colors.css` + `colors.type.ts`, ưu tiên `className` trước khi dùng hook `useThemeColor`; màu icon qua `Icon` + className `text-*` |
| [`sizing-and-layout.md`](/.agents/skills/expo-55-uniwind/references/sizing-and-layout.md) | Layout bằng utility Tailwind; safe area (`pt-safe`, …); Width, Height, Sizing với `wpx(n)` để tự scale theo màn hình  |
| [`references/stores-and-state.md`](/.agents/skills/expo-55-uniwind/references/stores-and-state.md) | Zustand, persist MMKV, mẫu `preferences-store` (type, hydration, get/update ngoài React), adapter storage |
| [`i18n.md`](/.agents/skills/expo-55-uniwind/references/i18n.md) | i18next; custom hook cho type-safe `useAppTranslation()` |
| [`animation`](/.cursor/rules/animations.mdc) | Rules khi nào dùng `react-native-ease` khi nào dùng `react-native-reanimated` |
