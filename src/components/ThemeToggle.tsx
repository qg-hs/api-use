import { MoonOutlined, SunOutlined } from "@ant-design/icons";
import { Button } from "antd";
import { useThemeStore } from "../stores/themeStore";

export const ThemeToggle = () => {
  const mode = useThemeStore((state) => state.mode);
  const toggle = useThemeStore((state) => state.toggle);

  return (
    <Button
      type="default"
      size="small"
      onClick={toggle}
      className="!border-[var(--border-default)] !bg-[var(--bg-surface)] !px-3 !text-[13px] !text-[var(--text-primary)] hover:!border-[var(--accent)] hover:!text-[var(--accent)]"
      icon={mode === "dark" ? <SunOutlined /> : <MoonOutlined />}
      shape="circle"
    />
  );
};
