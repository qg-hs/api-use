import Dexie, { type Table } from "dexie";
import { nanoid } from "nanoid";
import type { ApiItem, Project, TreeNode } from "../types";

class ApiUseDB extends Dexie {
  projects!: Table<Project, string>;
  nodes!: Table<TreeNode, string>;
  apiItems!: Table<ApiItem, string>;

  constructor() {
    super("api-use-db");
    this.version(1).stores({
      projects: "id, updatedAt",
      nodes: "id, projectId, parentId, sortOrder",
      apiItems: "id, projectId, nodeId, updatedAt"
    });
  }
}

export const db = new ApiUseDB();

export const listProjects = async () => {
  return db.projects.orderBy("updatedAt").reverse().toArray();
};

export const createProject = async (input: Pick<Project, "name" | "description">) => {
  const now = Date.now();
  const project: Project = {
    id: nanoid(),
    name: input.name,
    description: input.description,
    createdAt: now,
    updatedAt: now
  };
  await db.projects.add(project);
  return project;
};

export const updateProject = async (id: string, input: Partial<Pick<Project, "name" | "description">>) => {
  await db.projects.update(id, { ...input, updatedAt: Date.now() });
};

const collectNodeIds = (allNodes: TreeNode[], parentId: string): string[] => {
  const directChildren = allNodes.filter((node) => node.parentId === parentId);
  const ids = [parentId];
  for (const child of directChildren) {
    ids.push(...collectNodeIds(allNodes, child.id));
  }
  return ids;
};

export const deleteProject = async (id: string) => {
  await db.transaction("rw", db.projects, db.nodes, db.apiItems, async () => {
    await db.projects.delete(id);
    const ids = await db.nodes.where("projectId").equals(id).primaryKeys();
    await db.nodes.bulkDelete(ids);
    const apiIds = await db.apiItems.where("projectId").equals(id).primaryKeys();
    await db.apiItems.bulkDelete(apiIds);
  });
};

export const listNodesByProject = async (projectId: string) => {
  return db.nodes.where("projectId").equals(projectId).sortBy("sortOrder");
};

export const listApiItemsByProject = async (projectId: string) => {
  return db.apiItems.where("projectId").equals(projectId).toArray();
};

export const createNodeWithApi = async (input: {
  projectId: string;
  parentId: string | null;
  type: TreeNode["type"];
  name: string;
  sortOrder: number;
}) => {
  const now = Date.now();
  const node: TreeNode = {
    id: nanoid(),
    projectId: input.projectId,
    parentId: input.parentId,
    type: input.type,
    name: input.name,
    sortOrder: input.sortOrder,
    createdAt: now,
    updatedAt: now
  };

  await db.transaction("rw", db.nodes, db.apiItems, async () => {
    await db.nodes.add(node);
    if (node.type === "api") {
      const api: ApiItem = {
        id: nanoid(),
        projectId: input.projectId,
        nodeId: node.id,
        name: node.name,
        method: "GET",
        url: "",
        auth: { type: "none" },
        headers: [],
        query: [],
        body: { type: "none", value: "" },
        updatedAt: now
      };
      await db.apiItems.add(api);
    }
  });

  return node;
};

export const renameNode = async (nodeId: string, name: string) => {
  const now = Date.now();
  await db.transaction("rw", db.nodes, db.apiItems, async () => {
    await db.nodes.update(nodeId, { name, updatedAt: now });
    const api = await db.apiItems.where("nodeId").equals(nodeId).first();
    if (api) {
      await db.apiItems.update(api.id, { name, updatedAt: now });
    }
  });
};

export const deleteNode = async (nodeId: string) => {
  await db.transaction("rw", db.nodes, db.apiItems, async () => {
    const allNodes = await db.nodes.toArray();
    const toDelete = collectNodeIds(allNodes, nodeId);
    await db.nodes.bulkDelete(toDelete);
    const apiRecords = await db.apiItems.where("nodeId").anyOf(toDelete).primaryKeys();
    await db.apiItems.bulkDelete(apiRecords);
  });
};

export const swapNodeOrder = async (a: TreeNode, b: TreeNode) => {
  await db.transaction("rw", db.nodes, async () => {
    await db.nodes.update(a.id, { sortOrder: b.sortOrder, updatedAt: Date.now() });
    await db.nodes.update(b.id, { sortOrder: a.sortOrder, updatedAt: Date.now() });
  });
};

export const getApiItemByNodeId = async (nodeId: string) => {
  return db.apiItems.where("nodeId").equals(nodeId).first();
};

export const saveApiItem = async (apiItem: ApiItem) => {
  const next: ApiItem = { ...apiItem, updatedAt: Date.now() };
  await db.apiItems.put(next);
  await db.nodes.update(apiItem.nodeId, { updatedAt: Date.now() });
  await db.projects.update(apiItem.projectId, { updatedAt: Date.now() });
  return next;
};
