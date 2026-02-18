import { create } from "zustand";
import {
  cloneNodeTree,
  createNodeWithApi,
  deleteNode,
  listNodesByProject,
  moveNodeToParent,
  renameNode,
  swapNodeOrder,
} from "../db";
import type { TreeNode } from "../types";
import { nextSortOrder } from "../utils/tree";

type TreeState = {
  nodes: TreeNode[];
  selectedNodeId: string | null;
  /** 剪贴板：存储被复制节点的 ID */
  clipboardNodeId: string | null;
  refresh: (projectId: string) => Promise<void>;
  selectNode: (nodeId: string | null) => void;
  addNode: (input: {
    projectId: string;
    parentId: string | null;
    type: TreeNode["type"];
    name: string;
  }) => Promise<TreeNode>;
  renameNode: (
    nodeId: string,
    name: string,
    projectId: string,
  ) => Promise<void>;
  removeNode: (nodeId: string, projectId: string) => Promise<void>;
  moveNode: (
    nodeId: string,
    direction: "up" | "down",
    projectId: string,
  ) => Promise<void>;
  /** 复制节点到剪贴板 */
  copyNode: (nodeId: string) => void;
  /** 粘贴剪贴板节点到目标父节点下 */
  pasteNode: (parentId: string | null, projectId: string) => Promise<void>;
  /** 拖拽移动节点到新的父节点 */
  moveToParent: (
    nodeId: string,
    newParentId: string | null,
    targetIndex: number,
    projectId: string,
  ) => Promise<void>;
};

export const useTreeStore = create<TreeState>((set, get) => ({
  nodes: [],
  selectedNodeId: null,
  clipboardNodeId: null,
  refresh: async (projectId) => {
    const nodes = await listNodesByProject(projectId);
    set({ nodes });
    const selectedNodeId = get().selectedNodeId;
    if (!selectedNodeId || !nodes.some((node) => node.id === selectedNodeId)) {
      const firstApi = nodes.find((node) => node.type === "api");
      set({ selectedNodeId: firstApi?.id ?? null });
    }
  },
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),
  addNode: async (input) => {
    const sortOrder = nextSortOrder(get().nodes, input.parentId);
    const node = await createNodeWithApi({ ...input, sortOrder });
    await get().refresh(input.projectId);
    if (node.type === "api") {
      set({ selectedNodeId: node.id });
    }
    return node;
  },
  renameNode: async (nodeId, name, projectId) => {
    await renameNode(nodeId, name);
    await get().refresh(projectId);
  },
  removeNode: async (nodeId, projectId) => {
    await deleteNode(nodeId);
    if (get().selectedNodeId === nodeId) {
      set({ selectedNodeId: null });
    }
    // 如果删除的正好是剪贴板里的节点，清空剪贴板
    if (get().clipboardNodeId === nodeId) {
      set({ clipboardNodeId: null });
    }
    await get().refresh(projectId);
  },
  moveNode: async (nodeId, direction, projectId) => {
    const current = get().nodes.find((node) => node.id === nodeId);
    if (!current) return;

    const siblings = get()
      .nodes.filter((node) => node.parentId === current.parentId)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    const index = siblings.findIndex((item) => item.id === nodeId);
    if (index < 0) return;

    const swapTarget =
      direction === "up" ? siblings[index - 1] : siblings[index + 1];
    if (!swapTarget) return;

    await swapNodeOrder(current, swapTarget);
    await get().refresh(projectId);
  },
  copyNode: (nodeId) => {
    set({ clipboardNodeId: nodeId });
  },
  pasteNode: async (parentId, projectId) => {
    const sourceId = get().clipboardNodeId;
    if (!sourceId) return;
    const sortOrder = nextSortOrder(get().nodes, parentId);
    const newNode = await cloneNodeTree(
      sourceId,
      parentId,
      projectId,
      sortOrder,
    );
    await get().refresh(projectId);
    if (newNode.type === "api") {
      set({ selectedNodeId: newNode.id });
    }
  },
  moveToParent: async (nodeId, newParentId, targetIndex, projectId) => {
    await moveNodeToParent(nodeId, newParentId, targetIndex);
    await get().refresh(projectId);
  },
}));
