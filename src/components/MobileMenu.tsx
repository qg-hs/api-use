import { BgColorsOutlined, MoonOutlined, SunOutlined, UploadOutlined, SettingOutlined } from "@ant-design/icons";
import { Button, Dropdown, Upload, Divider } from "antd";
import type { MenuProps } from "antd";
import { useThemeStore } from "../stores/themeStore";

interface MobileMenuProps {
  onImport: (file: File) => Promise<void>;
}

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

export const MobileMenu = ({ onImport }: MobileMenuProps) => {
  const mode = useThemeStore((state) => state.mode);
  const themeName = useThemeStore((state) => state.themeName);
  const toggle = useThemeStore((state) => state.toggle);
  const setThemeName = useThemeStore((state) => state.setThemeName);

  const menuItems: MenuProps["items"] = [
    // 深浅色切换
    {
      key: "mode-toggle",
      label: mode === "dark" ? "切换到浅色模式" : "切换到暗色模式",
      icon: mode === "dark" ? <SunOutlined /> : <MoonOutlined />,
      onClick: toggle,
    },
    {
      type: "divider",
    },
    // 主题选择
    {
      key: "themes",
      label: "选择主题",
      icon: <BgColorsOutlined />,
      children: THEME_OPTIONS.map((theme) => ({
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
    },
    {
      type: "divider",
    },
    // 导入项目
    {
      key: "import",
      label: (
        <Upload
          showUploadList={false}
          accept=".json"
          beforeUpload={async (file) => {
            await onImport(file);
            return false;
          }}
        >
          <span>导入项目</span>
        </Upload>
      ),
      icon: <UploadOutlined />,
    },
  ];

  return (
    <Dropdown
      menu={{ items: menuItems, selectedKeys: [themeName] }}
      trigger={["click"]}
      placement="bottomRight"
    >
      <Button
        type="default"
        icon={<SettingOutlined />}
        className="h-8 rounded-lg border-[var(--border-default)] bg-[var(--bg-surface)] px-2 text-sm font-semibold text-[var(--text-primary)] transition-all duration-150 hover:-translate-y-px sm:h-9"
      >
        <span className="hidden xs:inline">菜单</span>
      </Button>
    </Dropdown>
  );
};
