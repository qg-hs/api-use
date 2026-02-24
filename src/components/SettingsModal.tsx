import { CheckOutlined } from "@ant-design/icons";
import { Modal } from "antd";
import { useThemeStore } from "../stores/themeStore";

type Props = {
  open: boolean;
  onClose: () => void;
};

const THEME_OPTIONS = [
  { key: "dark-purple", label: "暗夜紫罗兰", color: "#a855f7", emoji: "🟣" },
  { key: "dark-cyan", label: "赛博青", color: "#22d3ee", emoji: "🔵" },
  { key: "dark-orange", label: "暗夜橙", color: "#fb923c", emoji: "🟠" },
  { key: "dark-emerald", label: "森林绿", color: "#34d399", emoji: "🟢" },
  { key: "dark-rose", label: "玫瑰粉", color: "#fb7185", emoji: "🌸" },
  { key: "light-purple", label: "浅色紫罗兰", color: "#9333ea", emoji: "☀️" },
  { key: "light-cyan", label: "浅色青", color: "#0891b2", emoji: "💙" },
  { key: "light-orange", label: "浅色橙", color: "#ea580c", emoji: "🧡" },
  { key: "light-emerald", label: "浅色绿", color: "#059669", emoji: "💚" },
  { key: "light-rose", label: "浅色粉", color: "#e11d48", emoji: "💗" },
] as const;

export const SettingsModal = ({ open, onClose }: Props) => {
  const themeName = useThemeStore((s) => s.themeName);
  const setThemeName = useThemeStore((s) => s.setThemeName);

  return (
    <Modal
      open={open}
      onCancel={onClose}
      centered
      footer={null}
      title="设置"
      width={520}
      className="settings-modal"
      styles={{
        body: { padding: "16px 0 0" },
      }}
    >
      {/* 主题切换 */}
      <div className="mb-4">
        <div className="mb-3 text-sm font-medium text-[var(--text-secondary)]">
          🎨 主题切换
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {THEME_OPTIONS.map((theme) => {
            const isActive = themeName === theme.key;
            return (
              <button
                key={theme.key}
                onClick={() => setThemeName(theme.key as any)}
                className={`
                  relative flex items-center gap-2 rounded-lg border px-3 py-2.5
                  text-left text-xs transition-all duration-150
                  hover:-translate-y-px hover:shadow-md
                  ${isActive
                    ? "border-[var(--accent)] bg-[var(--accent)]/10 shadow-sm"
                    : "border-[var(--border-default)] bg-[var(--bg-surface)] hover:border-[var(--accent)]"
                  }
                `}
                style={{ cursor: "pointer" }}
              >
                <span
                  className="h-3.5 w-3.5 shrink-0 rounded-full shadow-sm"
                  style={{ background: theme.color }}
                />
                <span className="truncate text-[var(--text-primary)]">
                  {theme.label}
                </span>
                {isActive && (
                  <CheckOutlined
                    className="absolute right-1.5 top-1.5 text-[10px]"
                    style={{ color: theme.color }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 字体切换（预留） */}
      <div className="mb-2">
        <div className="mb-2 text-sm font-medium text-[var(--text-secondary)]">
          🔤 字体切换
        </div>
        <div className="rounded-lg border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 text-center text-xs text-[var(--text-tertiary)]">
          即将推出
        </div>
      </div>
    </Modal>
  );
};
