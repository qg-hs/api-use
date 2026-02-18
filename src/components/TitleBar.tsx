import { useEffect, useRef, useState } from "react";

/** 是否运行在 Tauri 环境中 */
const isTauri = (): boolean =>
  typeof window !== "undefined" && "__TAURI_INTERNALS__" in window;

/** 检测当前平台是否为 macOS */
const isMacOS = (): boolean => {
  // @ts-expect-error -- navigator.userAgentData 非标准
  const platform = navigator.userAgentData?.platform ?? navigator.platform ?? "";
  return /mac/i.test(platform);
};

type TauriWindow = Awaited<
  ReturnType<typeof import("@tauri-apps/api/window").getCurrentWindow>
>;

/**
 * 沉浸式自定义标题栏
 * - macOS: 左侧留空给系统交通灯，仅提供拖拽区域
 * - Windows: 右侧渲染最小化/最大化/关闭按钮
 * - Web 端: 不渲染
 */
export const TitleBar = () => {
  const [isMac] = useState(isMacOS);
  const [isMaximized, setIsMaximized] = useState(false);
  const appWindowRef = useRef<TauriWindow | null>(null);

  useEffect(() => {
    if (!isTauri()) return;

    let unlisten: (() => void) | undefined;

    (async () => {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      const win = getCurrentWindow();
      appWindowRef.current = win;

      const fn = await win.onResized(async () => {
        try {
          setIsMaximized(await win.isMaximized());
        } catch {
          // ignore
        }
      });
      unlisten = fn;
    })();

    return () => {
      unlisten?.();
    };
  }, []);

  // 非 Tauri 环境不渲染
  if (!isTauri()) return null;

  /** Tauri 原生拖拽 —— mousedown 时调用 startDragging */
  const handleDragStart = (e: React.MouseEvent) => {
    // 仅左键触发
    if (e.button !== 0) return;
    appWindowRef.current?.startDragging();
  };

  const handleMinimize = () => appWindowRef.current?.minimize();
  const handleToggleMaximize = () => appWindowRef.current?.toggleMaximize();
  const handleClose = () => appWindowRef.current?.close();

  return (
    <div className="titlebar" onMouseDown={handleDragStart}>
      {/* macOS: 左侧交通灯占位 */}
      {isMac && <div className="titlebar-traffic-light-spacer" />}

      {/* 中间弹性拖拽区域 */}
      <div className="titlebar-drag-fill" />

      {/* Windows: 窗口控制按钮 */}
      {!isMac && (
        <div
          className="titlebar-controls"
          onMouseDown={(e) => e.stopPropagation()} /* 阻止按钮区触发拖拽 */
        >
          <button
            className="titlebar-btn"
            onClick={handleMinimize}
            aria-label="最小化"
          >
            <svg width="10" height="1" viewBox="0 0 10 1">
              <rect width="10" height="1" fill="currentColor" />
            </svg>
          </button>

          <button
            className="titlebar-btn"
            onClick={handleToggleMaximize}
            aria-label={isMaximized ? "还原" : "最大化"}
          >
            {isMaximized ? (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <path
                  d="M2 0v2H0v8h8V8h2V0H2zm6 8H1V3h7v5zM9 7V1H3v1h5v5h1z"
                  fill="currentColor"
                />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 10 10">
                <rect
                  x="0" y="0" width="10" height="10"
                  fill="none" stroke="currentColor" strokeWidth="1"
                />
              </svg>
            )}
          </button>

          <button
            className="titlebar-btn titlebar-btn-close"
            onClick={handleClose}
            aria-label="关闭"
          >
            <svg width="10" height="10" viewBox="0 0 10 10">
              <path
                d="M1 0L0 1l4 4-4 4 1 1 4-4 4 4 1-1-4-4 4-4-1-1-4 4z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
};
