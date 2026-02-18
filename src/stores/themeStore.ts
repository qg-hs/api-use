import { create } from "zustand";

type ThemeMode = "dark" | "light";
type ThemeName =
  | "dark-purple"
  | "dark-cyan"
  | "dark-orange"
  | "dark-emerald"
  | "dark-rose"
  | "light-purple"
  | "light-cyan"
  | "light-orange"
  | "light-emerald"
  | "light-rose";

type ThemeState = {
  mode: ThemeMode;
  themeName: ThemeName;
  initialized: boolean;
  init: () => void;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
  setThemeName: (name: ThemeName) => void;
};

const STORAGE_KEY_MODE = "api-use-theme-mode";
const STORAGE_KEY_NAME = "api-use-theme-name";

const applyTheme = (themeName: ThemeName) => {
  if (typeof document === "undefined") return;

  // 临时禁用过渡,防止闪烁
  const root = document.documentElement;
  root.classList.add("theme-transitioning");

  // 应用主题
  root.dataset.theme = themeName;

  // 强制重绘后移除禁用类
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      root.classList.remove("theme-transitioning");
    });
  });
};

const resolveInitialMode = (): ThemeMode => {
  if (typeof window === "undefined") return "dark";

  const cached = window.localStorage.getItem(STORAGE_KEY_MODE);
  if (cached === "dark" || cached === "light") return cached;

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const resolveInitialThemeName = (mode: ThemeMode): ThemeName => {
  if (typeof window === "undefined") return "dark-purple";

  const cached = window.localStorage.getItem(STORAGE_KEY_NAME);
  if (cached && (cached.startsWith("dark-") || cached.startsWith("light-"))) {
    return cached as ThemeName;
  }

  return mode === "dark" ? "dark-purple" : "light-purple";
};

export const useThemeStore = create<ThemeState>((set, get) => ({
  mode: "dark",
  themeName: "dark-purple",
  initialized: false,
  init: () => {
    if (get().initialized) return;
    const mode = resolveInitialMode();
    const themeName = resolveInitialThemeName(mode);
    applyTheme(themeName);
    set({ mode, themeName, initialized: true });
  },
  setMode: (mode) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY_MODE, mode);
    }
    const themeName = mode === "dark" ? "dark-purple" : "light-purple";
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY_NAME, themeName);
    }
    applyTheme(themeName);
    set({ mode, themeName, initialized: true });
  },
  setThemeName: (themeName) => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY_NAME, themeName);
    }
    const mode = themeName.startsWith("light") ? "light" : "dark";
    if (typeof window !== "undefined") {
      window.localStorage.setItem(STORAGE_KEY_MODE, mode);
    }
    applyTheme(themeName);
    set({ mode, themeName, initialized: true });
  },
  toggle: () => {
    const next = get().mode === "dark" ? "light" : "dark";
    get().setMode(next);
  },
}));
