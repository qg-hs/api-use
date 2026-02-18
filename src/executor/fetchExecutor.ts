import type { Executor } from "./types";
import type { RequestConfig, RunResult } from "../types";

const toSearchParams = (config: RequestConfig) => {
  const params = new URLSearchParams();
  for (const item of config.query) {
    if (!item.enabled || !item.key) continue;
    params.append(item.key, item.value ?? "");
  }
  return params;
};

const resolveBody = (config: RequestConfig) => {
  if (config.method === "GET") {
    return undefined;
  }

  if (config.body.type === "none") {
    return undefined;
  }

  if (config.body.type === "json") {
    return JSON.stringify(config.body.value ?? {});
  }

  if (config.body.type === "form") {
    const params = new URLSearchParams();
    const entries = Array.isArray(config.body.value) ? config.body.value : [];
    for (const row of entries) {
      if (!row.enabled || !row.key) continue;
      params.append(row.key, row.value ?? "");
    }
    return params.toString();
  }

  return String(config.body.value ?? "");
};

export const fetchExecutor: Executor = {
  async execute(config: RequestConfig): Promise<RunResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.timeoutMs ?? 15000);
    const start = performance.now();

    try {
      const url = new URL(config.url);
      const query = toSearchParams(config);
      query.forEach((value, key) => url.searchParams.append(key, value));

      const headers = new Headers();
      for (const item of config.headers) {
        if (!item.enabled || !item.key) continue;
        headers.set(item.key, item.value ?? "");
      }

      if (config.auth.type === "bearer" && config.auth.token) {
        headers.set("Authorization", `Bearer ${config.auth.token}`);
      }

      if (config.body.type === "json") {
        headers.set("Content-Type", "application/json");
      }
      if (config.body.type === "form") {
        headers.set("Content-Type", "application/x-www-form-urlencoded");
      }

      const resp = await fetch(url.toString(), {
        method: config.method,
        headers,
        body: resolveBody(config),
        signal: controller.signal
      });

      const body = await resp.text();
      const headersMap: Record<string, string> = {};
      resp.headers.forEach((value, key) => {
        headersMap[key] = value;
      });

      return {
        status: resp.status,
        durationMs: Math.round(performance.now() - start),
        headers: headersMap,
        body,
        error: null
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      const isCors = /failed to fetch|networkerror|cors/i.test(message);
      return {
        status: null,
        durationMs: Math.round(performance.now() - start),
        headers: {},
        body: "",
        error: isCors
          ? `请求失败：可能是 CORS 限制或网络不可达。原始错误: ${message}`
          : `请求失败：${message}`
      };
    } finally {
      clearTimeout(timeout);
    }
  }
};
