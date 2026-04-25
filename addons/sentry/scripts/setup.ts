/** biome-ignore-all lint/suspicious/noConsole: CLI script */
import * as path from "node:path";

declare const Bun: {
  file: (filePath: string) => { text: () => Promise<string> };
  write: (filePath: string, content: string) => Promise<unknown>;
  spawn: (
    cmd: string[],
    opts: { cwd?: string; stdout?: "pipe" | "inherit"; stderr?: "pipe" | "inherit" }
  ) => {
    stdout: ReadableStream;
    stderr: ReadableStream;
    exited: Promise<number>;
  };
};

type StepResult = "ok" | "skip" | "warn" | "fail";

const color = {
  dim: (s: string) => `\x1b[2m${s}\x1b[0m`,
  red: (s: string) => `\x1b[31m${s}\x1b[0m`,
  green: (s: string) => `\x1b[32m${s}\x1b[0m`,
  yellow: (s: string) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s: string) => `\x1b[36m${s}\x1b[0m`,
  bold: (s: string) => `\x1b[1m${s}\x1b[0m`,
};

const badge = (r: StepResult) => {
  switch (r) {
    case "ok":
      return color.green("OK");
    case "skip":
      return color.cyan("SKIP");
    case "warn":
      return color.yellow("WARN");
    case "fail":
      return color.red("FAIL");
    default:
      return color.yellow("WARN");
  }
};

const logStep = (name: string, result: StepResult, details?: string) => {
  const line = `${color.bold("[Sentry Setup]")} ${badge(result)} ${name}`;
  console.log(details ? `${line}\n${color.dim(`  ${details}`)}` : line);
};

const fileExists = async (filePath: string) => {
  try {
    await Bun.file(filePath).text();
    return true;
  } catch {
    return false;
  }
};

const findProjectRoot = async (startDir: string) => {
  let dir = startDir;
  for (let i = 0; i < 10; i++) {
    const probe = path.join(dir, "apps/native/package.json");
    if (await fileExists(probe)) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) {
      break;
    }
    dir = parent;
  }

  throw new Error(
    `Could not find repo root from ${startDir}. Expected to find apps/native/package.json in this directory or parents.`
  );
};

const runGitStatusPorcelain = async (cwd: string) => {
  const proc = Bun.spawn(["git", "status", "--porcelain"], {
    cwd,
    stdout: "pipe",
    stderr: "pipe",
  });
  const out = await new Response(proc.stdout).text();
  const err = await new Response(proc.stderr).text();
  const exitCode = await proc.exited;

  if (exitCode !== 0) {
    throw new Error(`git status failed (exit ${exitCode}). ${err.trim()}`);
  }

  return out;
};

const askContinueIfDirty = async (projectRoot: string) => {
  const porcelain = await runGitStatusPorcelain(projectRoot);
  if (!porcelain.trim()) {
    logStep("git status", "ok", "working tree clean");
    return true;
  }

  logStep("git status", "warn", `working tree not clean:\n${porcelain.trimEnd()}`);

  process.stdout.write(color.bold("Continue? (Y/n) "));

  const answer = await new Promise<string>((resolve) => {
    if (!process.stdin.isTTY) {
      resolve("n");
      return;
    }

    process.stdin.setEncoding("utf8");
    process.stdin.once("data", (chunk) => resolve(String(chunk)));
  });
  process.stdin.pause();

  const normalized = answer.trim().toLowerCase();
  if (normalized === "" || normalized === "y" || normalized === "yes") {
    logStep("confirm", "ok", "continuing on dirty working tree");
    return true;
  }

  logStep("confirm", "skip", "aborted by user");
  return false;
};

const runBunInstallInNative = async (nativeRoot: string) => {
  logStep("bun install", "ok", `running in ${nativeRoot}`);
  const proc = Bun.spawn(["bun", "install"], {
    cwd: nativeRoot,
    stdout: "inherit",
    stderr: "inherit",
  });
  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    logStep("bun install", "fail", `bun install failed (exit ${exitCode})`);
    throw new Error(`bun install failed (exit ${exitCode})`);
  }
  logStep("bun install", "ok", "dependencies installed");
};

const printEnvReminder = () => {
  const docsUrl = "https://docs.sentry.io/platforms/react-native/manual-setup/expo/#prerequisites";
  console.log("");
  logStep(
    "Reminder",
    "warn",
    [
      "Add these to apps/native env files (DO NOT COMMIT auth token):",
      '- SENTRY_AUTH_TOKEN="sntry_auth_token_here"',
      '- EXPO_PUBLIC_SENTRY_DSN="dsn_url"',
      '- EXPO_PUBLIC_SENTRY_PROJECT="project_slug"',
      '- EXPO_PUBLIC_SENTRY_ORG="organization"',
      "",
      "Suggested files:",
      "- apps/native/.env.local",
      "- apps/native/.env.development.local",
      "- apps/native/.env.production.local",
      "",
      `Docs: ${docsUrl}`,
    ].join("\n")
  );
};

const readText = async (filePath: string) => Bun.file(filePath).text();
const writeText = async (filePath: string, text: string) => {
  await Bun.write(filePath, text);
};

const formatJson = (value: unknown) => `${JSON.stringify(value, null, 2)}\n`;

const RX_EXPORT_DEFAULT_CONFIG = /\bexport\s+default\s+config\s*;\s*$/m;
const RX_EXPORT_DEFAULT_LAYOUT = /\bexport\s+default\s+Layout\s*;\s*$/m;
const RX_IMPORT_LINE = /^\s*import\s.+from\s.+;\s*$/;
const RX_SPLASH_PREVENT = /SplashScreen\.preventAutoHideAsync\(\);\s*\n/m;
const RX_GET_DEFAULT_CONFIG = /^const\s+\{\s*getDefaultConfig\s*\}\s*=\s*require\("expo\/metro-config"\);\s*$/m;
const RX_AFTER_COMMENTED_DEFAULT = /(\n\/\/ const \{ getDefaultConfig \} = require\("expo\/metro-config"\);\n)/;
const RX_CONFIG_CREATION = /^const\s+config\s*=\s*getDefaultConfig\(projectRoot\);\s*$/m;

const patchFile = async (filePath: string, patch: (oldText: string) => string) => {
  const oldText = await readText(filePath);
  const newText = patch(oldText);
  if (newText === oldText) {
    return { changed: false };
  }
  await writeText(filePath, newText);
  return { changed: true };
};

const ensureDependency = async (packageJsonPath: string, depName: string, depVersion: string) => {
  const raw = await readText(packageJsonPath);
  const parsed = JSON.parse(raw) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };

  parsed.dependencies ??= {};
  const current = parsed.dependencies[depName];
  if (current === depVersion) {
    return { changed: false, status: "skip" as const, details: `${depName} already set to ${depVersion}` };
  }

  parsed.dependencies[depName] = depVersion;
  const sorted = Object.fromEntries(Object.entries(parsed.dependencies).sort(([a], [b]) => a.localeCompare(b)));
  parsed.dependencies = sorted;

  await writeText(packageJsonPath, formatJson(parsed));
  return {
    changed: true,
    status: "ok" as const,
    details: current ? `updated ${depName}: ${current} -> ${depVersion}` : `added ${depName}: ${depVersion}`,
  };
};

const setupNativePackageJson = async (nativeRoot: string) => {
  const packageJsonPath = path.join(nativeRoot, "package.json");
  try {
    const r1 = await ensureDependency(packageJsonPath, "@addons/sentry", "workspace:*");
    const r2 = await ensureDependency(packageJsonPath, "@sentry/react-native", "catalog:");
    const changed = r1.changed || r2.changed;

    const details = [r1.details, r2.details].filter(Boolean).join("\n");
    logStep("apps/native/package.json", changed ? "ok" : "skip", details || "no changes");
    return changed;
  } catch (e) {
    logStep("apps/native/package.json", "fail", String(e));
    throw e;
  }
};

const setupAppConfig = async (nativeRoot: string) => {
  const appConfigPath = path.join(nativeRoot, "app.config.ts");
  const importLine = 'import { withSentryConfig } from "@addons/sentry/config";';
  try {
    const r = await patchFile(appConfigPath, (oldText) => {
      let text = oldText;

      if (!text.includes(importLine)) {
        const lines = text.split("\n");
        const insertAt = 0;
        lines.splice(insertAt, 0, importLine);
        text = lines.join("\n");
      }

      // Replace export default config; -> export default withSentryConfig(config);
      text = text.replace(RX_EXPORT_DEFAULT_CONFIG, "export default withSentryConfig(config);");

      return text;
    });

    if (!r.changed) {
      const current = await readText(appConfigPath);
      if (current.includes("withSentryConfig(config)")) {
        logStep("apps/native/app.config.ts", "skip", "already wrapped with withSentryConfig(config)");
      } else {
        logStep(
          "apps/native/app.config.ts",
          "warn",
          "no changes applied (unexpected file shape). Please compare with addons/sentry/README.md §2.2"
        );
      }
      return false;
    }

    logStep("apps/native/app.config.ts", "ok", `added ${importLine} and wrapped export default`);
    return true;
  } catch (e) {
    logStep("apps/native/app.config.ts", "fail", String(e));
    throw e;
  }
};

const setupMetroConfig = async (nativeRoot: string) => {
  const metroPath = path.join(nativeRoot, "metro.config.js");
  const sentryRequire = 'const { getSentryExpoConfig } = require("@sentry/react-native/metro");';
  try {
    const r = await patchFile(metroPath, (oldText) => {
      let text = oldText;

      // Comment the default config import (line differs by project)
      text = text.replace(RX_GET_DEFAULT_CONFIG, '// const { getDefaultConfig } = require("expo/metro-config");');

      if (!text.includes(sentryRequire)) {
        text = text.replace(RX_AFTER_COMMENTED_DEFAULT, `$1${sentryRequire}\n`);
      }

      // Replace config creation
      text = text.replace(
        RX_CONFIG_CREATION,
        "// const config = getDefaultConfig(projectRoot);\nconst config = getSentryExpoConfig(projectRoot);"
      );

      return text;
    });

    if (!r.changed) {
      const current = await readText(metroPath);
      if (current.includes("getSentryExpoConfig(projectRoot)")) {
        logStep("apps/native/metro.config.js", "skip", "already using getSentryExpoConfig(projectRoot)");
      } else {
        logStep(
          "apps/native/metro.config.js",
          "warn",
          "no changes applied (unexpected file shape). Please compare with addons/sentry/README.md §2.3"
        );
      }
      return false;
    }

    logStep("apps/native/metro.config.js", "ok", "commented getDefaultConfig + added getSentryExpoConfig");
    return true;
  } catch (e) {
    logStep("apps/native/metro.config.js", "fail", String(e));
    throw e;
  }
};

const setupRootLayout = async (nativeRoot: string) => {
  const layoutPath = path.join(nativeRoot, "src/app/_layout.tsx");
  const importLine = 'import { initSentry, SentryWrap } from "@addons/sentry/runtime";';
  const devLogImport = 'import { devLog } from "@/utils/dev-log";';

  const insertImportAfterLastImport = (source: string, lineToInsert: string) => {
    if (source.includes(lineToInsert)) {
      return source;
    }

    const lines = source.split("\n");
    let lastImportIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (RX_IMPORT_LINE.test(lines[i] ?? "")) {
        lastImportIdx = i;
      }
    }
    lines.splice(lastImportIdx + 1, 0, lineToInsert);
    return lines.join("\n");
  };

  try {
    const r = await patchFile(layoutPath, (oldText) => {
      let text = oldText;

      text = insertImportAfterLastImport(text, importLine);
      text = insertImportAfterLastImport(text, devLogImport);

      if (!text.includes("initSentry()")) {
        // Place init block after SplashScreen.preventAutoHideAsync();
        text = text.replace(
          RX_SPLASH_PREVENT,
          `SplashScreen.preventAutoHideAsync();\n\ntry {\n  initSentry();\n  devLog.info("✅ [Sentry] Initialized");\n} catch (error) {\n  devLog.error("❌ [Sentry] Failed to initialize", error);\n}\n`
        );
      }

      // export default Layout; -> export default SentryWrap(Layout);
      text = text.replace(RX_EXPORT_DEFAULT_LAYOUT, "export default SentryWrap(Layout);");

      return text;
    });

    if (!r.changed) {
      const current = await readText(layoutPath);
      if (current.includes("export default SentryWrap(Layout)")) {
        logStep("apps/native/src/app/_layout.tsx", "skip", "already wrapped with SentryWrap(Layout)");
      } else {
        logStep(
          "apps/native/src/app/_layout.tsx",
          "warn",
          "no changes applied (unexpected file shape). Please compare with addons/sentry/README.md §2.3"
        );
      }
      return false;
    }

    logStep("apps/native/src/app/_layout.tsx", "ok", "added initSentry() + wrapped export default with SentryWrap");
    return true;
  } catch (e) {
    logStep("apps/native/src/app/_layout.tsx", "fail", String(e));
    throw e;
  }
};

const main = async () => {
  const projectRoot = await findProjectRoot(process.cwd());
  const nativeRoot = path.join(projectRoot, "apps/native");

  console.log(color.dim(`Project root: ${projectRoot}`));
  console.log(color.dim(`Native root:   ${nativeRoot}`));

  const shouldContinue = await askContinueIfDirty(projectRoot);
  if (!shouldContinue) {
    process.exit(0);
  }

  await setupNativePackageJson(nativeRoot);
  await setupAppConfig(nativeRoot);
  await setupMetroConfig(nativeRoot);
  await setupRootLayout(nativeRoot);

  await runBunInstallInNative(nativeRoot);
  logStep("Done", "ok", "Sentry addon setup completed.");
  printEnvReminder();
};

main().catch((e) => {
  console.error(color.red(`[Sentry Setup] Unhandled error: ${String(e)}`));
  process.stdin.pause();
  process.exit(1);
});
