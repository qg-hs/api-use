import type { RequestConfig, RunResult } from "../types";

export type Executor = {
  execute: (config: RequestConfig) => Promise<RunResult>;
};
