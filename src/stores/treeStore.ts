import { create } from "zustand";
import {
  createNodeWithApi,
  deleteNode,
  listNodesByProject,
  renameNode,
  swapNodeOrder
} from "../db";
import type { TreeNode } from "../types";
import { nextSortOrder } from "../utils/tree";

type TreeState = {
  nodes: TreeNode[];
  selectedNodeId: string | null;
  refresh: (projectId: string) => Promise<void>;
  selectNode: (nodeId: string | null) => void;
  addNode: (input: {
    projectId: string;
    parentId: string | null;
    type: TreeNode["type"];
    name: string;
  }) => Promise<TreeNode>;
  renameNode: (nodeId: string, name: string, projectId: string) => Promise<void>;
  removeNode: (nodeId: string, projectId: string) => Promise<void>;
  moveNode: (nodeId: string, direction: "up" | "down", projectId: string) => Promise<void>;
};

export const useTreeStore = create<TreeState>((set, get) => ({
  nodes: [],
  selectedNodeId: null,
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

    const swapTarget = direction === "up" ? siblings[index - 1] : siblings[index + 1];
    if (!swapTarget) return;

    await swapNodeOrder(current, swapTarget);
    await get().refresh(projectId);
  }
}));
