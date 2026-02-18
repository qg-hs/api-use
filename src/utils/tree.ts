import type { TreeDataNode } from "antd";
import type { TreeNode } from "../types";

export const buildTreeData = (nodes: TreeNode[]): TreeDataNode[] => {
  const sorted = [...nodes].sort((a, b) => a.sortOrder - b.sortOrder);
  const byParent = new Map<string | null, TreeNode[]>();

  for (const node of sorted) {
    const arr = byParent.get(node.parentId) ?? [];
    arr.push(node);
    byParent.set(node.parentId, arr);
  }

  const create = (parentId: string | null): TreeDataNode[] => {
    return (byParent.get(parentId) ?? []).map((node) => ({
      key: node.id,
      title: node.name,
      isLeaf: node.type === "api",
      children: create(node.id)
    }));
  };

  return create(null);
};

export const nextSortOrder = (nodes: TreeNode[], parentId: string | null): number => {
  const siblings = nodes.filter((node) => node.parentId === parentId);
  if (!siblings.length) {
    return 1;
  }
  return Math.max(...siblings.map((node) => node.sortOrder)) + 1;
};
