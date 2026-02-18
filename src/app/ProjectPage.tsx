import {
  ApiOutlined,
  ArrowLeftOutlined,
  ExportOutlined,
  ImportOutlined,
  MenuOutlined,
  UserOutlined
} from "@ant-design/icons";
import { App, Avatar, Button, Drawer, Grid, Upload } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { listApiItemsByProject, listProjects } from "../db";
import { RequestEditor } from "../components/RequestEditor";
import { ThemeToggle } from "../components/ThemeToggle";
import { TreePanel } from "../components/TreePanel";
import { exportProjectAsJson, importProjectFromJson } from "../importExport";
import { useApiStore } from "../stores/apiStore";
import { useProjectStore } from "../stores/projectStore";
import { useTreeStore } from "../stores/treeStore";
import type { HttpMethod } from "../types";

const { useBreakpoint } = Grid;

export const ProjectPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { xs: isMobile } = Grid.useBreakpoint();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const refreshProjects = useProjectStore((state) => state.refresh);
  const projects = useProjectStore((state) => state.projects);

  const currentApi = useApiStore((state) => state.current);
  const loadByNodeId = useApiStore((state) => state.loadByNodeId);

  const nodes = useTreeStore((state) => state.nodes);
  const selectedNodeId = useTreeStore((state) => state.selectedNodeId);
  const refreshNodes = useTreeStore((state) => state.refresh);
  const selectNode = useTreeStore((state) => state.selectNode);
  const addNode = useTreeStore((state) => state.addNode);
  const renameNode = useTreeStore((state) => state.renameNode);
  const removeNode = useTreeStore((state) => state.removeNode);
  const moveNode = useTreeStore((state) => state.moveNode);

  const [methodMap, setMethodMap] = useState<Record<string, HttpMethod | undefined>>({});

  useEffect(() => {
    refreshProjects().catch(() => undefined);
    refreshNodes(projectId).catch(() => undefined);
  }, [projectId, refreshNodes, refreshProjects]);

  useEffect(() => {
    loadByNodeId(selectedNodeId).catch(() => undefined);
  }, [loadByNodeId, selectedNodeId]);

  useEffect(() => {
    listApiItemsByProject(projectId)
      .then((items) => {
        const next: Record<string, HttpMethod | undefined> = {};
        for (const item of items) {
          next[item.nodeId] = item.method;
        }
        setMethodMap(next);
      })
      .catch(() => undefined);
  }, [projectId, nodes.length]);

  useEffect(() => {
    if (!currentApi) return;
    setMethodMap((prev) => ({ ...prev, [currentApi.nodeId]: currentApi.method }));
  }, [currentApi]);

  const currentProject = useMemo(() => projects.find((item) => item.id === projectId), [projectId, projects]);

  useEffect(() => {
    if (!currentProject) {
      listProjects()
        .then((all) => {
          if (!all.length) navigate("/");
        })
        .catch(() => undefined);
    }
  }, [currentProject, navigate]);

  const treePanelContent = (
    <TreePanel
      nodes={nodes}
      selectedNodeId={selectedNodeId}
      methodMap={methodMap}
      onSelect={(nodeId) => {
        selectNode(nodeId);
        if (isMobile) setDrawerOpen(false);
      }}
      onAdd={async (type, parentId, name) => {
        const node = await addNode({ projectId, parentId, type, name: name || (type === "api" ? "新接口" : "新文件夹") });
        await refreshNodes(projectId);
        return node.id;
      }}
      onRename={async (nodeId, name) => renameNode(nodeId, name, projectId)}
      onDelete={async (nodeId) => removeNode(nodeId, projectId)}
      onMove={async (nodeId, direction) => moveNode(nodeId, direction, projectId)}
    />
  );

  return (
    <div className="flex h-screen w-full flex-col overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* Header */}
      <header className="flex h-12 w-full shrink-0 items-center justify-between border-b border-[var(--border-default)] bg-gradient-topbar px-3 shadow-topbar">
        <div className="flex min-w-0 flex-1 items-center gap-2">
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerOpen(true)}
              className="!flex !h-7 !w-7 !min-w-[28px] !items-center !justify-center !p-0 !text-[var(--text-primary)] hover:!bg-[var(--bg-hover)]"
            />
          )}

          <div className="flex items-center gap-1.5">
            <span className="flex h-7 w-7 min-w-[28px] items-center justify-center rounded-md bg-gradient-brand text-[13px] text-accent-solid shadow-glow">
              <ApiOutlined />
            </span>
            {!isMobile && (
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                API-USE
              </span>
            )}
          </div>

          {!isMobile && (
            <>
              <div className="mx-0.5 h-3.5 w-px bg-[var(--border-default)]" />
              
              <Link 
                to="/"
                className="group flex items-center gap-1 text-[13px] text-[var(--text-secondary)] no-underline transition-opacity hover:opacity-80"
              >
                <ArrowLeftOutlined className="text-xs" />
                <span>项目列表</span>
              </Link>
              
              <div className="mx-0.5 h-3.5 w-px bg-[var(--border-default)]" />

              <span className="truncate text-[13px] font-medium text-[var(--text-primary)]">
                / {currentProject?.name ?? "项目详情"}
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          <Upload
            showUploadList={false}
            accept=".json"
            beforeUpload={async (file) => {
              try {
                const content = await file.text();
                await importProjectFromJson(content);
                message.success("导入成功");
                await refreshProjects();
              } catch (error) {
                message.error((error as Error).message);
              }
              return false;
            }}
          >
            <Button 
              icon={<ImportOutlined />}
              size="small"
              className="!flex !h-7 !items-center !rounded-md !border-[var(--border-default)] !bg-[var(--bg-surface)] !px-3 !text-[13px] !text-[var(--text-primary)] hover:!border-[var(--accent)] hover:!text-[var(--accent)]"
            >
              {!isMobile && "导入"}
            </Button>
          </Upload>

          <Button
            type="primary"
            icon={<ExportOutlined />}
            size="small"
            className="!flex !h-7 !items-center !rounded-md !bg-gradient-btn-primary !px-3 !text-[13px] !shadow-none hover:!opacity-90"
            onClick={async () => {
              if (!currentProject) return;
              const json = await exportProjectAsJson(currentProject);
              const blob = new Blob([json], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `${currentProject.name.replace(/\s+/g, "-")}.api-use.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            {!isMobile && "导出"}
          </Button>

          <Avatar 
            size={28} 
            icon={<UserOutlined />}
            className="!cursor-pointer !bg-accent !text-[13px] !text-accent-solid !shadow-glow hover:!opacity-90"
          />
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {isMobile ? (
          <Drawer
            title="接口目录"
            placement="left"
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            width={280}
            styles={{ 
              body: { 
                padding: 0,
                background: 'var(--bg-elevated)'
              },
              header: {
                background: 'var(--bg-elevated)',
                borderBottom: '1px solid var(--border-default)',
                color: 'var(--text-primary)'
              },
              mask: { 
                background: 'rgba(0, 0, 0, 0.45)' 
              }
            }}
            classNames={{
              content: '!bg-[var(--bg-elevated)]'
            }}
          >
            <div className="h-full bg-[var(--bg-elevated)] p-3">
              {treePanelContent}
            </div>
          </Drawer>
        ) : (
          <aside className="w-[260px] shrink-0 border-r border-[var(--border-default)] bg-[var(--bg-elevated)] transition-all duration-300 ease-in-out lg:w-[300px]">
            <div className="h-full w-full overflow-y-auto overflow-x-hidden p-3 pt-4">
              {treePanelContent}
            </div>
          </aside>
        )}

        <main className="min-w-0 flex-1 overflow-auto bg-[var(--bg-base)]">
          <RequestEditor projectId={projectId} />
        </main>
      </div>
    </div>
  );
};
