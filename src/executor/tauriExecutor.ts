import { invoke } from "@tauri-apps/api/core";
import type { Executor } from "./types";
import type { RequestConfig, RunResult } from "../types";

export const tauriExecutor: Executor = {
  async execute(config: RequestConfig): Promise<RunResult> {
    return invoke<RunResult>("execute_request", { payload: config });
  }
};
