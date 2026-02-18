import { create } from "zustand";
import { getApiItemByNodeId, saveApiItem, renameNode } from "../db";
import type { ApiItem } from "../types";

type ApiState = {
  current: ApiItem | null;
  loadByNodeId: (nodeId: string | null) => Promise<void>;
  patchCurrent: (patch: Partial<ApiItem>) => void;
  saveCurrent: () => Promise<void>;
};

export const useApiStore = create<ApiState>((set, get) => ({
  current: null,
  loadByNodeId: async (nodeId) => {
    if (!nodeId) {
      set({ current: null });
      return;
    }
    const item = await getApiItemByNodeId(nodeId);
    set({ current: item ?? null });
  },
  patchCurrent: (patch) => {
    const current = get().current;
    if (!current) return;
    set({ current: { ...current, ...patch } });
  },
  saveCurrent: async () => {
    const current = get().current;
    if (!current) return;
    const next = await saveApiItem(current);
    // 同步更新树节点名称
    await renameNode(current.nodeId, current.name);
    set({ current: next });
  },
}));
