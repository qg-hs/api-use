import { readFile } from "@tauri-apps/plugin-fs";
import type { Executor } from "./types";
import type { FormKV, RequestConfig, RunResult } from "../types";

const toSearchParams = (config: RequestConfig) => {
  const params = new URLSearchParams();
  for (const item of config.query) {
    if (!item.enabled || !item.key) continue;
    params.append(item.key, item.value ?? "");
  }
  return params;
};

/** 判断表单数据中是否包含 file 类型行 */
const hasFileEntry = (entries: FormKV[]): boolean =>
  entries.some(
    (row) => row.enabled && row.key && row.valueType === "file" && row.value,
  );

const resolveBody = async (
  config: RequestConfig,
): Promise<BodyInit | undefined> => {
  if (config.method === "GET") {
    return undefined;
  }

  if (config.body.type === "none") {
    return undefined;
  }

  if (config.body.type === "json") {
    // 前端 TextArea 传来的已经是 JSON 字符串，直接使用；对象才需要序列化
    const v = config.body.value;
    return typeof v === "string" ? v : JSON.stringify(v ?? {});
  }

  if (config.body.type === "form") {
    const entries: FormKV[] = Array.isArray(config.body.value)
      ? (config.body.value as FormKV[])
      : [];

    // 存在 file 类型时用 FormData（浏览器自动设置 multipart boundary）
    if (hasFileEntry(entries)) {
      const formData = new FormData();
      for (const row of entries) {
        if (!row.enabled || !row.key) continue;
        if (row.valueType === "file" && row.value) {
          try {
            const bytes = await readFile(row.value);
            const fileName = row.value.split("/").pop() ?? "file";
            const blob = new Blob([bytes]);
            formData.append(row.key, blob, fileName);
          } catch {
            // 文件读取失败时跳过该字段
          }
        } else {
          formData.append(row.key, row.value ?? "");
        }
      }
      return formData;
    }

    // 纯 text 字段用 URLSearchParams
    const params = new URLSearchParams();
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
    const timeout = setTimeout(
      () => controller.abort(),
      config.timeoutMs ?? 15000,
    );
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

      const body = await resolveBody(config);

      // form 且无 file 时设置 urlencoded；有 file 时 FormData 自动设置 Content-Type
      if (config.body.type === "form" && !(body instanceof FormData)) {
        headers.set("Content-Type", "application/x-www-form-urlencoded");
      }

      const resp = await fetch(url.toString(), {
        method: config.method,
        headers,
        body,
        signal: controller.signal,
      });

      const respBody = await resp.text();
      const headersMap: Record<string, string> = {};
      resp.headers.forEach((value, key) => {
        headersMap[key] = value;
      });

      return {
        status: resp.status,
        durationMs: Math.round(performance.now() - start),
        headers: headersMap,
        body: respBody,
        error: null,
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
          : `请求失败：${message}`,
      };
    } finally {
      clearTimeout(timeout);
    }
  },
};
