import { GithubOutlined, SyncOutlined } from "@ant-design/icons";
import { Button, Modal, Spin, Tag } from "antd";
import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

// 构建时由 Vite define 注入
declare const __APP_VERSION__: string;

const APP_INFO = {
  name: "API-USE",
  version: typeof __APP_VERSION__ !== "undefined" ? __APP_VERSION__ : "1.0.0",
  description: "轻量级 API 接口管理与调试工具，支持多项目、环境变量、请求导入导出。",
  author: "qg-hs",
  github: "https://github.com/qg-hs/api-use",
  icon: "/icon.png",
};

export const AboutModal = ({ open, onClose }: Props) => {
  const [checking, setChecking] = useState(false);
  const [updateResult, setUpdateResult] = useState<string | null>(null);

  const handleCheckUpdate = async () => {
    setChecking(true);
    setUpdateResult(null);
    try {
      // TODO: 对接 GitHub releases API
      // const res = await fetch("https://api.github.com/repos/{owner}/{repo}/releases/latest");
      // const data = await res.json();
      // 暂时模拟
      await new Promise((r) => setTimeout(r, 1500));
      setUpdateResult("当前已是最新版本 🎉");
    } catch {
      setUpdateResult("检测失败，请检查网络连接");
    } finally {
      setChecking(false);
    }
  };

  return (
    <Modal
      open={open}
      onCancel={() => {
        onClose();
        setUpdateResult(null);
      }}
      centered
      footer={null}
      title={null}
      width={420}
      className="about-modal"
      styles={{
        body: { padding: "24px 24px 20px" },
      }}
    >
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div className="mb-4 flex h-20 w-20 items-center justify-center overflow-hidden rounded-2xl bg-gradient-brand shadow-glow sm:h-24 sm:w-24">
          <img
            src={APP_INFO.icon}
            alt={APP_INFO.name}
            className="h-full w-full object-contain p-2"
            draggable={false}
          />
        </div>

        {/* Name + Version */}
        <h2 className="mb-1 text-xl font-bold text-[var(--text-primary)] sm:text-2xl">
          {APP_INFO.name}
        </h2>
        <Tag
          color="var(--accent)"
          className="!mb-3 !rounded-full !border-none !px-3 !text-xs !font-medium"
          style={{ color: "var(--bg-base)" }}
        >
          v{APP_INFO.version}
        </Tag>

        {/* Description */}
        <p className="mb-4 max-w-[300px] text-sm leading-6 text-[var(--text-secondary)]">
          {APP_INFO.description}
        </p>

        {/* Author */}
        <div className="mb-5 flex items-center gap-2 text-sm text-[var(--text-tertiary)]">
          <span>作者：</span>
          <a
            href={APP_INFO.github}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[var(--accent)] no-underline transition-opacity hover:opacity-80"
          >
            <GithubOutlined />
            {APP_INFO.author}
          </a>
        </div>

        {/* Check Update */}
        <Button
          type="primary"
          icon={checking ? <Spin indicator={<SyncOutlined spin />} size="small" /> : <SyncOutlined />}
          loading={false}
          disabled={checking}
          onClick={handleCheckUpdate}
          className="!h-9 !rounded-lg !bg-gradient-btn-primary !px-6 !text-sm !shadow-none hover:!opacity-90"
        >
          {checking ? "检测中..." : "检测更新"}
        </Button>

        {/* Update Result */}
        {updateResult && (
          <div className="mt-3 text-xs text-[var(--text-secondary)]">
            {updateResult}
          </div>
        )}
      </div>
    </Modal>
  );
};
