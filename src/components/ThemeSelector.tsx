import { BgColorsOutlined } from "@ant-design/icons";
import { Button, Dropdown } from "antd";
import { useThemeStore } from "../stores/themeStore";

const THEME_OPTIONS = [
  // 暗色主题
  { key: "dark-purple", label: "🟣 暗夜紫罗兰", color: "#a855f7" },
  { key: "dark-cyan", label: "🔵 赛博青", color: "#22d3ee" },
  { key: "dark-orange", label: "🟠 暗夜橙", color: "#fb923c" },
  { key: "dark-emerald", label: "🟢 森林绿", color: "#34d399" },
  { key: "dark-rose", label: "🌸 玫瑰粉", color: "#fb7185" },
  // 浅色主题
  { key: "light-purple", label: "☀️ 浅色紫罗兰", color: "#9333ea" },
  { key: "light-cyan", label: "💙 浅色青", color: "#0891b2" },
  { key: "light-orange", label: "🧡 浅色橙", color: "#ea580c" },
  { key: "light-emerald", label: "💚 浅色绿", color: "#059669" },
  { key: "light-rose", label: "💗 浅色粉", color: "#e11d48" },
];

export const ThemeSelector = () => {
  const themeName = useThemeStore((state) => state.themeName);
  const setThemeName = useThemeStore((state) => state.setThemeName);



  return (
    <Dropdown
      menu={{
        items: THEME_OPTIONS.map((theme) => ({
          key: theme.key,
          label: (
            <div className="flex items-center gap-2">
              <div 
                className="h-3 w-3 rounded-full"
                style={{ background: theme.color }}
              />
              <span>{theme.label}</span>
            </div>
          ),
          onClick: () => setThemeName(theme.key as any),
        })),
        selectedKeys: [themeName],
      }}
      trigger={["click"]}
    >
      <Button
        type="default"
        icon={<BgColorsOutlined />}
        className="h-8 rounded-lg border-[var(--border-default)] bg-[var(--bg-surface)] px-2 text-sm font-semibold text-[var(--text-primary)] transition-all duration-150 hover:-translate-y-px sm:h-9 sm:px-3"
      >
        主题
      </Button>
    </Dropdown>
  );
};
