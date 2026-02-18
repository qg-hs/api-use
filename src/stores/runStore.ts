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
    const result = await executor.execute(config);
    set({ result, loading: false });
  },
  clear: () => set({ result: null })
}));
