import {
  ApiOutlined,
  CopyOutlined,
  EllipsisOutlined,
  FolderAddOutlined,
  FolderOpenOutlined,
  PlusCircleOutlined,
  SearchOutlined,
  SnippetsOutlined
} from "@ant-design/icons";
import { Badge, Button, Dropdown, Input, Modal, Tree, message } from "antd";
import type { TreeProps } from "antd";
import { useMemo, useState } from "react";
import type { HttpMethod, TreeNode } from "../types";
import { buildTreeData } from "../utils/tree";

type Props = {
  nodes: TreeNode[];
  selectedNodeId: string | null;
  methodMap: Record<string, HttpMethod | undefined>;
  /** 剪贴板中是否有内容 */
  hasClipboard?: boolean;
  onSelect: (nodeId: string | null) => void;
  onAdd: (type: TreeNode["type"], parentId: string | null, name: string) => Promise<string | null>;
  onRename: (nodeId: string, name: string) => Promise<void>;
  onDelete: (nodeId: string) => Promise<void>;
  onMove: (nodeId: string, direction: "up" | "down") => Promise<void>;
  /** 复制节点 */
  onCopy?: (nodeId: string) => void;
  /** 粘贴到指定父节点下 */
  onPaste?: (parentId: string | null) => Promise<void>;
  /** 拖拽移动节点：nodeId 移到 newParentId 下的 index 位置 */
  onDrop?: (nodeId: string, newParentId: string | null, index: number) => Promise<void>;
};

const methodColorMap: Record<HttpMethod, string> = {
  GET: "#22c55e",
  POST: "#3b82f6",
  PUT: "#f59e0b",
  DELETE: "#ef4444",
  PATCH: "#8b5cf6"
};


export const TreePanel = ({
  nodes, selectedNodeId, methodMap, hasClipboard,
  onSelect, onAdd, onRename, onDelete, onMove,
  onCopy, onPaste, onDrop
}: Props) => {
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

  /** Antd Tree 拖拽回调 */
  const handleDrop: TreeProps["onDrop"] = async (info) => {
    if (!onDrop) return;

    const dragNodeId = info.dragNode.key as string;
    const dropNodeId = info.node.key as string;
    const dropNode = nodes.find((n) => n.id === dropNodeId);
    if (!dropNode) return;

    try {
      if (info.dropToGap) {
        // 拖拽到节点之间（同级排序）
        const newParentId = dropNode.parentId;
        const siblings = nodes
          .filter((n) => n.parentId === newParentId && n.id !== dragNodeId)
          .sort((a, b) => a.sortOrder - b.sortOrder);
        const dropIndex = siblings.findIndex((n) => n.id === dropNodeId);
        // dropPosition: -1=上方, 1=下方
        const targetIndex = info.dropPosition > dropIndex ? dropIndex + 1 : dropIndex;
        await onDrop(dragNodeId, newParentId, Math.max(0, targetIndex));
      } else {
        // 拖拽到节点上（放进文件夹）
        if (dropNode.type !== "folder") {
          message.warning("只能拖拽到文件夹中");
          return;
        }
        const childrenCount = nodes.filter((n) => n.parentId === dropNodeId).length;
        await onDrop(dragNodeId, dropNodeId, childrenCount);
      }
    } catch (error) {
      message.error((error as Error).message);
    }
  };

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

      <div className="flex-1 overflow-y-auto pt-[6px]">
        <Tree
          blockNode
          showLine={false}
          draggable={{ icon: false }} /* 启用拖拽，隐藏拖拽图标 */
          selectedKeys={selectedNodeId ? [selectedNodeId] : []}
          treeData={treeData}
          onSelect={(keys) => onSelect((keys[0] as string) ?? null)}
          onDrop={handleDrop}
          allowDrop={({ dropNode, dropPosition }) => {
            const target = nodes.find((n) => n.id === dropNode.key);
            // 只允许拖入文件夹内部，或拖到任意节点的间隙
            if (dropPosition === 0 && target?.type !== "folder") return false;
            return true;
          }}
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
                        key: "copy",
                        icon: <CopyOutlined />,
                        label: "复制",
                        onClick: () => {
                          onCopy?.(rawNode.id);
                          message.success("已复制");
                        }
                      },
                      // 只有文件夹或根目录才能粘贴
                      ...(hasClipboard && rawNode.type === "folder" ? [
                        {
                          key: "paste",
                          icon: <SnippetsOutlined />,
                          label: "粘贴到此文件夹",
                          onClick: async () => {
                            try {
                              await onPaste?.(rawNode.id);
                              message.success("已粘贴");
                            } catch (error) {
                              message.error((error as Error).message);
                            }
                          }
                        }
                      ] : []),
                      { type: "divider" as const },
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
                      { type: "divider" as const },
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
