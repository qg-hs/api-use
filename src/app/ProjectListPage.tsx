import {
  App,
  Avatar,
  Button,
  Card,
  Col,
  Dropdown,
  Empty,
  Input,
  Row,
  Skeleton,
  Typography,
  Upload
} from "antd";
import {
  ApiOutlined,
  ClockCircleOutlined,
  EllipsisOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  SettingOutlined,
  UploadOutlined,
  UserOutlined
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { exportProjectAsJson, importProjectFromJson } from "../importExport";
import { AboutModal } from "../components/AboutModal";
import { ProjectFormModal } from "../components/ProjectFormModal";
import { SettingsModal } from "../components/SettingsModal";
import { TitleBar } from "../components/TitleBar";
import { MobileMenu } from "../components/MobileMenu";
import { useProjectStore } from "../stores/projectStore";
import type { Project } from "../types";

export const ProjectListPage = () => {
  const navigate = useNavigate();
  const { message, modal } = App.useApp();
  const projects = useProjectStore((state) => state.projects);
  const loading = useProjectStore((state) => state.loading);
  const refresh = useProjectStore((state) => state.refresh);
  const createOne = useProjectStore((state) => state.createOne);
  const updateOne = useProjectStore((state) => state.updateOne);
  const removeOne = useProjectStore((state) => state.removeOne);
  const [keyword, setKeyword] = useState("");
  const [modalState, setModalState] = useState<{ open: boolean; mode: "create" | "edit"; current?: Project }>({
    open: false,
    mode: "create"
  });
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

  // 头像下拉菜单项
  const avatarMenuItems = [
    { key: "settings", icon: <SettingOutlined />, label: "设置", onClick: () => setSettingsOpen(true) },
    { key: "about", icon: <InfoCircleOutlined />, label: "关于", onClick: () => setAboutOpen(true) },
  ];

  useEffect(() => {
    refresh().catch(() => undefined);
  }, [refresh]);

  const filtered = useMemo(() => {
    return projects.filter((project) => {
      if (!keyword.trim()) return true;
      const text = `${project.name} ${project.description ?? ""}`.toLowerCase();
      return text.includes(keyword.trim().toLowerCase());
    });
  }, [keyword, projects]);

  // 导入处理函数
  const handleImport = async (file: File) => {
    try {
      const content = await file.text();
      const project = await importProjectFromJson(content);
      await refresh();
      message.success(`导入成功：${project.name}`);
    } catch (error) {
      message.error((error as Error).message);
    }
  };

  return (
    <div className="min-h-screen w-full">
      {/* 沉浸式标题栏 */}
      <TitleBar />

      <div className="px-3 py-3 sm:px-4 sm:py-4 lg:px-6">
      {/* Header */}
      <header className="grid grid-cols-1 gap-3 rounded-xl border border-[var(--border-default)] bg-gradient-topbar p-3 shadow-topbar md:grid-cols-[auto_1fr_auto] md:items-center md:px-4">
        <div className="inline-flex items-center gap-2 sm:gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-brand text-base text-accent-solid shadow-glow sm:h-9 sm:w-9 sm:text-lg">
            <ApiOutlined />
          </span>
          <span className="text-lg font-bold tracking-tight text-[var(--text-primary)] sm:text-xl">
            API-USE
          </span>
        </div>

        <Input
          allowClear
          className="w-full md:max-w-lg"
          prefix={<SearchOutlined />}
          placeholder="搜索项目..."
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />

        {/* 移动端 - 整合菜单 */}
        <div className="inline-flex items-center justify-end gap-2 md:hidden">
          <MobileMenu onImport={handleImport} />
          <Dropdown menu={{ items: avatarMenuItems }} trigger={["hover"]} placement="bottomRight">
            <Avatar 
              size={34} 
              icon={<UserOutlined />}
              className="!cursor-pointer !bg-accent !text-accent-solid !shadow-glow !transition-all !duration-150 hover:!scale-105"
            />
          </Dropdown>
        </div>

        {/* 桌面端 - 显示分开的按钮 */}
        <div className="hidden items-center justify-end gap-2 md:inline-flex md:gap-2.5 md:justify-self-end">
          <Upload
            showUploadList={false}
            accept=".json"
            beforeUpload={async (file) => {
              await handleImport(file);
              return false;
            }}
          >
            <Button 
              type="default" 
              icon={<UploadOutlined />}
              className="h-8 rounded-lg border-[var(--border-default)] bg-[var(--bg-surface)] px-2 text-sm font-semibold text-[var(--text-primary)] transition-all duration-150 hover:-translate-y-px sm:h-9 sm:px-3"
            >
              导入
            </Button>
          </Upload>
          <Dropdown menu={{ items: avatarMenuItems }} trigger={["hover"]} placement="bottomRight">
            <Avatar 
              size={34} 
              icon={<UserOutlined />}
              className="!cursor-pointer !bg-accent !text-accent-solid !shadow-glow !transition-all !duration-150 hover:!scale-105"
            />
          </Dropdown>
        </div>
      </header>

      {/* Page Title */}
      <section className="mb-4 mt-4 flex flex-col items-start justify-between gap-3 sm:mb-5 sm:mt-6 sm:gap-4 lg:flex-row lg:items-center">
        <div>
          <Typography.Title
            level={2}
            className="!mb-1 !text-2xl !font-bold !leading-tight !text-[var(--text-primary)] sm:!text-[1.25rem]"
          >
            项目管理
          </Typography.Title>
          <Typography.Text 
            className="!text-sm !leading-6 !text-[var(--text-secondary)] sm:!text-[0.85rem] sm:!leading-7"
          >
            管理您的 API 调试集与接口文档环境
          </Typography.Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalState({ open: true, mode: "create" })}
          className="!rounded-md !border-none !bg-gradient-btn-primary !text-base !font-semibold !text-white/85 !shadow-[var(--shadow-btn-primary)] !transition-all !duration-300 hover:!-translate-y-0.5"
        >
          创建新项目
        </Button>
      </section>

      {/* Project Cards Grid */}
      <Row gutter={[16, 16]}>
        {/* Create Card */}
        <Col xs={24} sm={12} md={12} lg={8} xl={6}>
          <Card 
            className="!h-full !min-h-[220px] !cursor-pointer !rounded-xl !border-2 !border-dashed !border-[var(--border-default)] !bg-[var(--bg-elevated)] !opacity-85 !shadow-[var(--shadow-md)] !transition-all !duration-300 hover:!-translate-y-0.5 hover:!opacity-100"
            onClick={() => setModalState({ open: true, mode: "create" })}
          >
            <div className="flex h-full min-h-[180px] flex-col items-center justify-center gap-3">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-[var(--border-default)] bg-[var(--accent-subtle-bg)] text-lg text-[var(--accent-subtle-text)] transition-all duration-300 hover:rotate-90 hover:scale-110 sm:h-14 sm:w-14 sm:text-xl">
                <PlusOutlined />
              </div>
              <span className="text-sm font-medium text-[var(--text-secondary)] sm:text-base">
                创建新项目
              </span>
            </div>
          </Card>
        </Col>

        {/* Loading Skeleton */}
        {loading && projects.length === 0 ? (
          <>
            {[1, 2, 3].map((i) => (
              <Col key={i} xs={24} sm={12} md={12} lg={8} xl={6}>
                <Card className="!h-full !rounded-xl !bg-[var(--bg-elevated)]">
                  <Skeleton active paragraph={{ rows: 3 }} />
                </Card>
              </Col>
            ))}
          </>
        ) : (
          /* Project Cards */
          filtered.map((record) => (
            <Col key={record.id} xs={24} sm={12} md={12} lg={8} xl={6}>
              <Card 
                className="!h-full !rounded-xl !border !border-[var(--border-default)] !bg-[var(--gradient-card)] !shadow-[var(--shadow-card)] !transition-all !duration-300 hover:!scale-[1.01] hover:!-translate-y-1"
                loading={loading}
              >
                {/* Card Header */}
                <div className="mb-3 flex items-center justify-between sm:mb-4">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--accent-subtle-bg)] text-[var(--accent-subtle-text)] transition-all duration-150 hover:scale-105 sm:h-11 sm:w-11">
                    <ApiOutlined />
                  </div>
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: "open",
                          label: "进入项目",
                          onClick: () => navigate(`/project/${record.id}`)
                        },
                        {
                          key: "edit",
                          label: "编辑",
                          onClick: () => setModalState({ open: true, mode: "edit", current: record })
                        },
                        {
                          key: "export",
                          label: "导出",
                          onClick: async () => {
                            const json = await exportProjectAsJson(record);
                            const blob = new Blob([json], { type: "application/json" });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `${record.name.replace(/\s+/g, "-")}.api-use.json`;
                            a.click();
                            URL.revokeObjectURL(url);
                          }
                        },
                        {
                          key: "delete",
                          danger: true,
                          label: "删除",
                          onClick: () => {
                            modal.confirm({
                              title: "确认删除项目？",
                              content: `项目 ${record.name} 及其所有接口会被删除。`,
                              okButtonProps: { danger: true },
                              onOk: async () => {
                                await removeOne(record.id);
                                message.success("已删除");
                              }
                            });
                          }
                        }
                      ]
                    }}
                  >
                    <Button 
                      type="text" 
                      icon={<EllipsisOutlined />}
                      className="!text-[var(--text-muted)] !transition-all !duration-150 hover:!scale-110"
                    />
                  </Dropdown>
                </div>

                {/* Card Title */}
                <button
                  type="button"
                  className="mb-2 mt-1 w-full cursor-pointer border-0 bg-transparent p-0 text-left text-lg font-semibold leading-tight text-[var(--text-primary)] transition-all duration-150 hover:opacity-80 sm:text-[1.28rem]"
                  onClick={() => navigate(`/project/${record.id}`)}
                >
                  {record.name}
                </button>

                {/* Card Description */}
                <Typography.Paragraph 
                  className="!mb-3 !min-h-[48px] !text-sm !leading-6 !text-[var(--text-secondary)] sm:!mb-4 sm:!text-[0.97rem] sm:!leading-7"
                  ellipsis={{ rows: 2 }}
                >
                  {record.description || "暂无描述"}
                </Typography.Paragraph>

                {/* Card Footer */}
                <div className="flex items-center justify-between border-t border-[var(--border-subtle)] pt-2 text-xs text-[var(--text-muted)] sm:pt-3 sm:text-[0.92rem]">
                  <span><ClockCircleOutlined /> {dayjs(record.updatedAt).format("YYYY-MM-DD")}</span>
                  <span className="rounded-full bg-[var(--accent-subtle-bg)] px-2 py-0.5 text-xs text-[var(--accent-subtle-text)] transition-all duration-150 sm:px-2.5">
                    项目
                  </span>
                </div>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Empty State */}
      {!loading && !filtered.length && (
        <div className="mt-7">
          <Empty description="没有匹配的项目" />
        </div>
      )}

      {/* Project Form Modal */}
      <ProjectFormModal
        open={modalState.open}
        title={modalState.mode === "create" ? "创建项目" : "编辑项目"}
        initialValues={{ name: modalState.current?.name ?? "", description: modalState.current?.description }}
        onCancel={() => setModalState({ open: false, mode: "create" })}
        onSubmit={async (values) => {
          if (modalState.mode === "create") {
            await createOne(values);
            message.success("项目已创建");
          } else if (modalState.current) {
            await updateOne(modalState.current.id, values);
            message.success("项目已更新");
          }
          setModalState({ open: false, mode: "create" });
        }}
      />
      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />
      </div>
    </div>
  );
};
