import type { ThemeConfig } from "antd";

/**
 * 主题配色映射表
 * 根据不同的主题返回对应的 Ant Design token 配置
 */
export const getThemeTokens = (
  themeName: string,
  isDark: boolean,
): ThemeConfig["token"] => {
  // 暗色主题配置
  const darkThemes: Record<string, ThemeConfig["token"]> = {
    "dark-purple": {
      colorPrimary: "#a855f7",
      colorInfo: "#a855f7",
      colorSuccess: "#34d399",
      colorWarning: "#fbbf24",
      colorError: "#f87171",
      colorBgBase: "#0f0a1e",
      colorBgContainer: "#1a1428",
      colorBgElevated: "#241c35",
      colorBgLayout: "#0f0a1e",
      colorBgSpotlight: "#241c35",
      colorBorder: "#2d2440",
      colorBorderSecondary: "#221a33",
      colorText: "#f3f0ff",
      colorTextSecondary: "#c4b5fd",
      colorTextTertiary: "#9580d4",
      colorTextQuaternary: "#6b5494",
      colorFill: "rgba(168, 85, 247, 0.12)",
      colorFillSecondary: "rgba(168, 85, 247, 0.08)",
      colorFillTertiary: "rgba(168, 85, 247, 0.04)",
      colorFillQuaternary: "rgba(168, 85, 247, 0.02)",
    },
    "dark-cyan": {
      colorPrimary: "#22d3ee",
      colorInfo: "#22d3ee",
      colorSuccess: "#34d399",
      colorWarning: "#fbbf24",
      colorError: "#f87171",
      colorBgBase: "#0a1420",
      colorBgContainer: "#0f1c2e",
      colorBgElevated: "#1a2838",
      colorBgLayout: "#0a1420",
      colorBgSpotlight: "#1a2838",
      colorBorder: "#1e3a52",
      colorBorderSecondary: "#162d42",
      colorText: "#ecfeff",
      colorTextSecondary: "#a5f3fc",
      colorTextTertiary: "#67e8f9",
      colorTextQuaternary: "#22d3ee",
      colorFill: "rgba(34, 211, 238, 0.12)",
      colorFillSecondary: "rgba(34, 211, 238, 0.08)",
      colorFillTertiary: "rgba(34, 211, 238, 0.04)",
      colorFillQuaternary: "rgba(34, 211, 238, 0.02)",
    },
    "dark-orange": {
      colorPrimary: "#fb923c",
      colorInfo: "#fb923c",
      colorSuccess: "#34d399",
      colorWarning: "#facc15",
      colorError: "#f87171",
      colorBgBase: "#1a1107",
      colorBgContainer: "#1f1810",
      colorBgElevated: "#2b231a",
      colorBgLayout: "#1a1107",
      colorBgSpotlight: "#2b231a",
      colorBorder: "#3d3020",
      colorBorderSecondary: "#2e2418",
      colorText: "#fff7ed",
      colorTextSecondary: "#fed7aa",
      colorTextTertiary: "#fdba74",
      colorTextQuaternary: "#fb923c",
      colorFill: "rgba(251, 146, 60, 0.12)",
      colorFillSecondary: "rgba(251, 146, 60, 0.08)",
      colorFillTertiary: "rgba(251, 146, 60, 0.04)",
      colorFillQuaternary: "rgba(251, 146, 60, 0.02)",
    },
    "dark-emerald": {
      colorPrimary: "#34d399",
      colorInfo: "#34d399",
      colorSuccess: "#34d399",
      colorWarning: "#fbbf24",
      colorError: "#f87171",
      colorBgBase: "#071812",
      colorBgContainer: "#0f1f1a",
      colorBgElevated: "#1a2d27",
      colorBgLayout: "#071812",
      colorBgSpotlight: "#1a2d27",
      colorBorder: "#1e3d32",
      colorBorderSecondary: "#162d24",
      colorText: "#ecfdf5",
      colorTextSecondary: "#a7f3d0",
      colorTextTertiary: "#6ee7b7",
      colorTextQuaternary: "#34d399",
      colorFill: "rgba(52, 211, 153, 0.12)",
      colorFillSecondary: "rgba(52, 211, 153, 0.08)",
      colorFillTertiary: "rgba(52, 211, 153, 0.04)",
      colorFillQuaternary: "rgba(52, 211, 153, 0.02)",
    },
    "dark-rose": {
      colorPrimary: "#fb7185",
      colorInfo: "#fb7185",
      colorSuccess: "#34d399",
      colorWarning: "#fbbf24",
      colorError: "#f87171",
      colorBgBase: "#1a0c14",
      colorBgContainer: "#1f121c",
      colorBgElevated: "#2b1d27",
      colorBgLayout: "#1a0c14",
      colorBgSpotlight: "#2b1d27",
      colorBorder: "#3d2832",
      colorBorderSecondary: "#2e1e26",
      colorText: "#fff1f2",
      colorTextSecondary: "#fecdd3",
      colorTextTertiary: "#fda4af",
      colorTextQuaternary: "#fb7185",
      colorFill: "rgba(251, 113, 133, 0.12)",
      colorFillSecondary: "rgba(251, 113, 133, 0.08)",
      colorFillTertiary: "rgba(251, 113, 133, 0.04)",
      colorFillQuaternary: "rgba(251, 113, 133, 0.02)",
    },
  };

  // 浅色主题配置
  const lightThemes: Record<string, ThemeConfig["token"]> = {
    "light-purple": {
      colorPrimary: "#9333ea",
      colorInfo: "#9333ea",
      colorSuccess: "#059669",
      colorWarning: "#d97706",
      colorError: "#dc2626",
      colorBgBase: "#faf9fb",
      colorBgContainer: "#ffffff",
      colorBgElevated: "#ffffff",
      colorBgLayout: "#faf9fb",
      colorBgSpotlight: "#f5f3f7",
      colorBorder: "#e5dff2",
      colorBorderSecondary: "#f0ebf8",
      colorText: "#1a1428",
      colorTextSecondary: "#6b5494",
      colorTextTertiary: "#a78bbd",
      colorTextQuaternary: "#cbd5e1",
      colorFill: "rgba(147, 51, 234, 0.08)",
      colorFillSecondary: "rgba(147, 51, 234, 0.04)",
      colorFillTertiary: "rgba(147, 51, 234, 0.02)",
      colorFillQuaternary: "rgba(147, 51, 234, 0.01)",
    },
    "light-cyan": {
      colorPrimary: "#0891b2",
      colorInfo: "#0891b2",
      colorSuccess: "#059669",
      colorWarning: "#d97706",
      colorError: "#dc2626",
      colorBgBase: "#f0fdff",
      colorBgContainer: "#ffffff",
      colorBgElevated: "#ffffff",
      colorBgLayout: "#f0fdff",
      colorBgSpotlight: "#e6fbff",
      colorBorder: "#a5f3fc",
      colorBorderSecondary: "#cffafe",
      colorText: "#0a1420",
      colorTextSecondary: "#155e75",
      colorTextTertiary: "#67e8f9",
      colorTextQuaternary: "#a5f3fc",
      colorFill: "rgba(6, 182, 212, 0.08)",
      colorFillSecondary: "rgba(6, 182, 212, 0.04)",
      colorFillTertiary: "rgba(6, 182, 212, 0.02)",
      colorFillQuaternary: "rgba(6, 182, 212, 0.01)",
    },
    "light-orange": {
      colorPrimary: "#ea580c",
      colorInfo: "#ea580c",
      colorSuccess: "#059669",
      colorWarning: "#eab308",
      colorError: "#dc2626",
      colorBgBase: "#fffbf5",
      colorBgContainer: "#ffffff",
      colorBgElevated: "#ffffff",
      colorBgLayout: "#fffbf5",
      colorBgSpotlight: "#fff7ed",
      colorBorder: "#fed7aa",
      colorBorderSecondary: "#ffedd5",
      colorText: "#1a1107",
      colorTextSecondary: "#9a3412",
      colorTextTertiary: "#fb923c",
      colorTextQuaternary: "#fed7aa",
      colorFill: "rgba(249, 115, 22, 0.08)",
      colorFillSecondary: "rgba(249, 115, 22, 0.04)",
      colorFillTertiary: "rgba(249, 115, 22, 0.02)",
      colorFillQuaternary: "rgba(249, 115, 22, 0.01)",
    },
    "light-emerald": {
      colorPrimary: "#059669",
      colorInfo: "#059669",
      colorSuccess: "#059669",
      colorWarning: "#d97706",
      colorError: "#dc2626",
      colorBgBase: "#f0fdf9",
      colorBgContainer: "#ffffff",
      colorBgElevated: "#ffffff",
      colorBgLayout: "#f0fdf9",
      colorBgSpotlight: "#ecfdf5",
      colorBorder: "#a7f3d0",
      colorBorderSecondary: "#d1fae5",
      colorText: "#071812",
      colorTextSecondary: "#065f46",
      colorTextTertiary: "#6ee7b7",
      colorTextQuaternary: "#a7f3d0",
      colorFill: "rgba(16, 185, 129, 0.08)",
      colorFillSecondary: "rgba(16, 185, 129, 0.04)",
      colorFillTertiary: "rgba(16, 185, 129, 0.02)",
      colorFillQuaternary: "rgba(16, 185, 129, 0.01)",
    },
    "light-rose": {
      colorPrimary: "#e11d48",
      colorInfo: "#e11d48",
      colorSuccess: "#059669",
      colorWarning: "#d97706",
      colorError: "#dc2626",
      colorBgBase: "#fff5f7",
      colorBgContainer: "#ffffff",
      colorBgElevated: "#ffffff",
      colorBgLayout: "#fff5f7",
      colorBgSpotlight: "#fff1f2",
      colorBorder: "#fecdd3",
      colorBorderSecondary: "#ffe4e6",
      colorText: "#1a0c14",
      colorTextSecondary: "#9f1239",
      colorTextTertiary: "#fb7185",
      colorTextQuaternary: "#fecdd3",
      colorFill: "rgba(244, 63, 94, 0.08)",
      colorFillSecondary: "rgba(244, 63, 94, 0.04)",
      colorFillTertiary: "rgba(244, 63, 94, 0.02)",
      colorFillQuaternary: "rgba(244, 63, 94, 0.01)",
    },
  };

  // 通用样式配置
  const commonTokens: Partial<ThemeConfig["token"]> = {
    borderRadius: 8,
    borderRadiusLG: 12,
    borderRadiusSM: 6,
    fontFamily:
      "MiSans, PingFang SC, HarmonyOS Sans SC, Microsoft YaHei, Segoe UI, sans-serif",
    fontSize: 14,
    lineHeight: 1.5715,
    controlHeight: 36,
    controlHeightLG: 40,
    controlHeightSM: 28,
  };

  if (isDark) {
    const selectedTheme = darkThemes[themeName] || darkThemes["dark-purple"];
    return { ...selectedTheme, ...commonTokens };
  }

  const selectedTheme = lightThemes[themeName] || lightThemes["light-purple"];
  return { ...selectedTheme, ...commonTokens };
};

/**
 * 获取组件级别的主题配置
 */
export const getComponentsConfig = (
  themeName: string,
  isDark: boolean,
): ThemeConfig["components"] => {
  // 根据主题获取主色
  const primaryColor = isDark
    ? themeName === "dark-cyan"
      ? "#22d3ee"
      : themeName === "dark-orange"
        ? "#fb923c"
        : themeName === "dark-emerald"
          ? "#34d399"
          : themeName === "dark-rose"
            ? "#fb7185"
            : "#a855f7"
    : "#9333ea";

  const primaryShadow = isDark
    ? `0 8px 24px ${primaryColor}66`
    : `0 8px 20px ${primaryColor}4d`;

  return {
    Button: {
      controlHeight: 36,
      controlHeightLG: 40,
      controlHeightSM: 28,
      fontWeight: 500,
      primaryShadow,
    },
    Card: {
      paddingLG: 18,
      borderRadiusLG: 12,
      boxShadowTertiary: isDark
        ? "0 4px 24px rgba(0, 0, 0, 0.4)"
        : "0 4px 20px rgba(15, 23, 42, 0.06)",
    },
    Tabs: {
      titleFontSize: 14,
      cardPadding: "8px 12px",
      horizontalMargin: "0 0 0 0",
    },
    Input: {
      controlHeight: 36,
      borderRadius: 8,
      activeBorderColor: primaryColor,
      hoverBorderColor: primaryColor,
      activeShadow: `0 0 0 2px ${primaryColor}26`,
    },
    Select: {
      controlHeight: 36,
      borderRadius: 8,
      optionActiveBg: `${primaryColor}26`,
      optionSelectedBg: `${primaryColor}3d`,
    },
    Table: {
      headerBg: isDark ? "#1a2236" : "#f5f3f7",
      headerColor: isDark ? "#c4b5fd" : "#6b5494",
      rowHoverBg: `${primaryColor}14`,
      borderColor: isDark ? "#2d2440" : "#e5dff2",
    },
    Modal: {
      paddingLG: 18,
      contentBg: isDark ? "#1a1428" : "#ffffff",
      headerBg: isDark ? "#1a1428" : "#ffffff",
      borderRadiusLG: 12,
      boxShadow: isDark
        ? "0 12px 48px rgba(0, 0, 0, 0.6)"
        : "0 12px 48px rgba(26, 20, 40, 0.15)",
    },
    Dropdown: {
      controlItemBgHover: `${primaryColor}1f`,
      borderRadiusLG: 8,
      boxShadowSecondary: isDark
        ? "0 8px 32px rgba(0, 0, 0, 0.5)"
        : "0 8px 32px rgba(26, 20, 40, 0.12)",
    },
    Tree: {
      nodeHoverBg: `${primaryColor}14`,
      nodeSelectedBg: `${primaryColor}3d`,
      titleHeight: 28,
    },
    Switch: {
      trackHeight: 20,
      trackMinWidth: 40,
    },
    Empty: {
      colorTextDisabled: isDark ? "#9580d4" : "#a78bbd",
    },
    Message: {
      contentBg: isDark ? "#241c35" : "#ffffff",
      borderRadiusLG: 8,
    },
  };
};
