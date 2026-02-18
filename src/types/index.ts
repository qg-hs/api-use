export type NodeType = "folder" | "api";
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export type BodyType =
  | "none"
  | "form"
  | "json"
  | "text"
  | "html"
  | "javascript";

export type KV = {
  key: string;
  value: string;
  enabled: boolean;
};

export type Project = {
  id: string;
  name: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
};

export type TreeNode = {
  id: string;
  projectId: string;
  parentId: string | null;
  type: NodeType;
  name: string;
  sortOrder: number;
  createdAt: number;
  updatedAt: number;
};

export type ApiItem = {
  id: string;
  projectId: string;
  nodeId: string;
  name: string;
  method: HttpMethod;
  url: string;
  auth: { type: "none" | "bearer"; token?: string };
  headers: KV[];
  query: KV[];
  body: {
    type: BodyType;
    value: unknown;
  };
  updatedAt: number;
};

export type RunResult = {
  status: number | null;
  durationMs: number;
  headers: Record<string, string>;
  body: string;
  error: string | null;
};

export type RequestConfig = {
  method: HttpMethod;
  url: string;
  auth: { type: "none" | "bearer"; token?: string };
  headers: KV[];
  query: KV[];
  body: { type: BodyType; value: unknown };
  timeoutMs?: number;
};

export type ExportPayload = {
  version: 1;
  exportedAt: number;
  project: Project;
  nodes: TreeNode[];
  apiItems: ApiItem[];
};
