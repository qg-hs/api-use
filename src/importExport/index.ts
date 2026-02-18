import { nanoid } from "nanoid";
import { db, listApiItemsByProject, listNodesByProject } from "../db";
import type { ApiItem, ExportPayload, Project, TreeNode } from "../types";

export const exportProjectAsJson = async (project: Project): Promise<string> => {
  const [nodes, apiItems] = await Promise.all([
    listNodesByProject(project.id),
    listApiItemsByProject(project.id)
  ]);

  const payload: ExportPayload = {
    version: 1,
    exportedAt: Date.now(),
    project,
    nodes,
    apiItems
  };

  return JSON.stringify(payload, null, 2);
};

const isPayload = (input: unknown): input is ExportPayload => {
  if (!input || typeof input !== "object") return false;
  const value = input as Partial<ExportPayload>;
  return value.version === 1 && !!value.project && Array.isArray(value.nodes) && Array.isArray(value.apiItems);
};

export const importProjectFromJson = async (json: string) => {
  const parsed: unknown = JSON.parse(json);
  if (!isPayload(parsed)) {
    throw new Error("导入文件格式不正确，无法识别为 API-USE v1。");
  }

  const now = Date.now();
  const oldProjectId = parsed.project.id;
  const newProjectId = nanoid();
  const nodeIdMap = new Map<string, string>();

  const project: Project = {
    ...parsed.project,
    id: newProjectId,
    name: `${parsed.project.name}（导入）`,
    createdAt: now,
    updatedAt: now
  };

  const sourceNodes = parsed.nodes.filter((node) => node.projectId === oldProjectId);
  for (const node of sourceNodes) {
    nodeIdMap.set(node.id, nanoid());
  }

  const rebuiltNodes: TreeNode[] = sourceNodes.map((node) => ({
    ...node,
    id: nodeIdMap.get(node.id) ?? nanoid(),
    projectId: newProjectId,
    parentId: node.parentId ? (nodeIdMap.get(node.parentId) ?? null) : null,
    createdAt: now,
    updatedAt: now
  }));

  const apiItems: ApiItem[] = parsed.apiItems
    .filter((item) => item.projectId === oldProjectId)
    .map((item) => ({
      ...item,
      id: nanoid(),
      projectId: newProjectId,
      nodeId: nodeIdMap.get(item.nodeId) ?? item.nodeId,
      updatedAt: now
    }));

  await db.transaction("rw", db.projects, db.nodes, db.apiItems, async () => {
    await db.projects.add(project);
    await db.nodes.bulkAdd(rebuiltNodes);
    await db.apiItems.bulkAdd(apiItems);
  });

  return project;
};
