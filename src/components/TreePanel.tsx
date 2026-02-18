import {
  ApiOutlined,
  EllipsisOutlined,
  FolderAddOutlined,
  FolderOpenOutlined,
  PlusCircleOutlined,
  SearchOutlined
} from "@ant-design/icons";
import { Badge, Button, Dropdown, Input, Modal, Tree, message } from "antd";
import { useMemo, useState } from "react";
import type { HttpMethod, TreeNode } from "../types";
import { buildTreeData } from "../utils/tree";

type Props = {
  nodes: TreeNode[];
  selectedNodeId: string | null;
  methodMap: Record<string, HttpMethod | undefined>;
  onSelect: (nodeId: string | null) => void;
  onAdd: (type: TreeNode["type"], parentId: string | null, name: string) => Promise<string | null>;
  onRename: (nodeId: string, name: string) => Promise<void>;
  onDelete: (nodeId: string) => Promise<void>;
  onMove: (nodeId: string, direction: "up" | "down") => Promise<void>;
};

const methodColorMap: Record<HttpMethod, string> = {
  GET: "#22c55e",
  POST: "#3b82f6",
  PUT: "#f59e0b",
  DELETE: "#ef4444",
  PATCH: "#8b5cf6"
};


export const TreePanel = ({ nodes, selectedNodeId, methodMap, onSelect, onAdd, onRename, onDelete, onMove }: Props) => {
  const [keyword, setKeyword] = useState("");
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptValue, setPromptValue] = useState("");
  const [promptTarget, setPromptTarget] = useState<{ action: "rename" | "create"; type?: TreeNode["type"]; nodeId?: string; parentId?: string | null } | null>(null);

  const visibleNodes = useMemo(() => {
    if (!keyword.trim()) return nodes;

    const lower = keyword.trim().toLowerCase();
    const byId = new Map(nodes.map((node) => [node.id, node]));
    const visibleIds = new Set<string>();

    for (const node of nodes) {
      if (!node.name.toLowerCase().includes(lower)) continue;
      visibleIds.add(node.id);
      let parentId = node.parentId;
      while (parentId) {
        visibleIds.add(parentId);
        parentId = byId.get(parentId)?.parentId ?? null;
      }
    }

    return nodes.filter((node) => visibleIds.has(node.id));
  }, [keyword, nodes]);

  const treeData = useMemo(() => buildTreeData(visibleNodes), [visibleNodes]);

  return (
    <div className="flex h-full w-full flex-col gap-3">
      <Input
        allowClear
        value={keyword}
        onChange={(event) => setKeyword(event.target.value)}
        placeholder="搜索接口..."
        prefix={<SearchOutlined />}
      />

      <div className="flex items-center justify-between text-xs font-medium text-[var(--text-secondary)]">
        <span>接口目录</span>
        <span>{nodes.length}</span>
      </div>

      <div className="flex gap-2">
        <Button
          type="primary"
          size="small"
          icon={<FolderAddOutlined />}
          className="flex-1"
          onClick={() => {
            setPromptTarget({ action: "create", type: "folder", parentId: null });
            setPromptValue("新建文件夹");
            setPromptOpen(true);
          }}
        >
          新建文件夹
        </Button>
        <Button
          size="small"
          icon={<PlusCircleOutlined />}
          className="flex-1"
          onClick={() => {
            setPromptTarget({ action: "create", type: "api", parentId: null });
            setPromptValue("新建接口");
            setPromptOpen(true);
          }}
        >
          新建接口
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tree
          blockNode
          showLine={false}
          selectedKeys={selectedNodeId ? [selectedNodeId] : []}
          treeData={treeData}
          onSelect={(keys) => onSelect((keys[0] as string) ?? null)}
          titleRender={(node) => {
            const rawNode = nodes.find((item) => item.id === node.key);
            if (!rawNode) return String(node.title);

            const method = methodMap[rawNode.id];
            const methodColor = method ? methodColorMap[method] : undefined;

            return (
              <div className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 flex-1 items-center gap-1.5 text-sm">
                  {rawNode.type === "folder" ? <FolderOpenOutlined /> : <ApiOutlined />}
                  {rawNode.type === "api" && method && (
                    <Badge
                      color={methodColor}
                      text={<span className="text-xs font-medium" style={{ color: methodColor }}>{method}</span>}
                    />
                  )}
                  <span className="truncate">{String(node.title)}</span>
                </span>
                <Dropdown
                  trigger={["click"]}
                  menu={{
                    items: [
                      // 只有文件夹才能创建子项
                      ...(rawNode.type === "folder" ? [
                        {
                          key: "new-folder",
                          label: "新建子文件夹",
                          onClick: () => {
                            setPromptTarget({ action: "create", type: "folder", parentId: rawNode.id });
                            setPromptValue("新建文件夹");
                            setPromptOpen(true);
                          }
                        },
                        {
                          key: "new-api",
                          label: "新建子接口",
                          onClick: () => {
                            setPromptTarget({ action: "create", type: "api", parentId: rawNode.id });
                            setPromptValue("新建接口");
                            setPromptOpen(true);
                          }
                        },
                      ] : []),
                      {
                        key: "rename",
                        label: "重命名",
                        onClick: () => {
                          setPromptTarget({ action: "rename", nodeId: rawNode.id });
                          setPromptValue(rawNode.name);
                          setPromptOpen(true);
                        }
                      },
                      { key: "up", label: "上移", onClick: () => onMove(rawNode.id, "up") },
                      { key: "down", label: "下移", onClick: () => onMove(rawNode.id, "down") },
                      {
                        key: "delete",
                        label: "删除",
                        danger: true,
                        onClick: () => {
                          Modal.confirm({
                            title: `确认删除该${rawNode.type === "folder" ? "文件夹" : "接口"}？`,
                            content: rawNode.type === "folder" ? "删除文件夹会递归删除内部节点和接口详情。" : "删除接口会同时删除接口配置。",
                            okButtonProps: { danger: true },
                            onOk: async () => onDelete(rawNode.id)
                          });
                        }
                      }
                    ]
                  }}
                >
                  <Button size="small" type="text" icon={<EllipsisOutlined />} className="shrink-0" />
                </Dropdown>
              </div>
            );
          }}
        />
      </div>

      <Modal
        title={promptTarget?.action === "rename" ? "重命名" : "创建节点"}
        open={promptOpen}
        onCancel={() => setPromptOpen(false)}
        onOk={async () => {
          if (!promptTarget) return;
          if (!promptValue.trim()) {
            message.warning("名称不能为空");
            return;
          }
          if (promptTarget.action === "rename" && promptTarget.nodeId) {
            await onRename(promptTarget.nodeId, promptValue.trim());
          }
          if (promptTarget.action === "create" && promptTarget.type !== undefined) {
            await onAdd(promptTarget.type, promptTarget.parentId ?? null, promptValue.trim());
          }
          setPromptOpen(false);
        }}
      >
        <Input value={promptValue} onChange={(event) => setPromptValue(event.target.value)} />
      </Modal>
    </div>
  );
};
