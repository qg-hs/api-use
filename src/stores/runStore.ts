import { create } from "zustand";
import { executor } from "../executor";
import type { RequestConfig, RunResult } from "../types";

type RunState = {
  loading: boolean;
  result: RunResult | null;
  run: (config: RequestConfig) => Promise<void>;
  clear: () => void;
};

export const useRunStore = create<RunState>((set) => ({
  loading: false,
  result: null,
  run: async (config) => {
    set({ loading: true });
    try {
      const result = await executor.execute(config);
      set({ result, loading: false });
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      set({
        result: {
          status: null,
          durationMs: 0,
          headers: {},
          body: "",
          error: `执行失败: ${msg}`,
        },
        loading: false,
      });
    }
  },
  clear: () => set({ result: null }),
}));
