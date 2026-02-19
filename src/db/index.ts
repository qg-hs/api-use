import Dexie, { type Table } from "dexie";
import { nanoid } from "nanoid";
import type {
  ApiItem,
  Environment,
  Project,
  ProjectSettings,
  TreeNode,
} from "../types";

class ApiUseDB extends Dexie {
  projects!: Table<Project, string>;
  nodes!: Table<TreeNode, string>;
  apiItems!: Table<ApiItem, string>;
  environments!: Table<Environment, string>;
  projectSettings!: Table<ProjectSettings, string>;

  constructor() {
    super("api-use-db");
    this.version(1).stores({
      projects: "id, updatedAt",
      nodes: "id, projectId, parentId, sortOrder",
      apiItems: "id, projectId, nodeId, updatedAt",
    });
    this.version(2).stores({
      projects: "id, updatedAt",
      nodes: "id, projectId, parentId, sortOrder",
      apiItems: "id, projectId, nodeId, updatedAt",
      environments: "id, projectId",
      projectSettings: "id, projectId",
    });
  }
}

export const db = new ApiUseDB();

export const listProjects = async () => {
  return db.projects.orderBy("updatedAt").reverse().toArray();
};

export const createProject = async (
  input: Pick<Project, "name" | "description">,
) => {
  const now = Date.now();
  const project: Project = {
    id: nanoid(),
    name: input.name,
    description: input.description,
    createdAt: now,
    updatedAt: now,
  };
  await db.projects.add(project);
  return project;
};

export const updateProject = async (
  id: string,
  input: Partial<Pick<Project, "name" | "description">>,
) => {
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
  await db.transaction(
    "rw",
    [db.projects, db.nodes, db.apiItems, db.environments, db.projectSettings],
    async () => {
      await db.projects.delete(id);
      const ids = await db.nodes.where("projectId").equals(id).primaryKeys();
      await db.nodes.bulkDelete(ids);
      const apiIds = await db.apiItems
        .where("projectId")
        .equals(id)
        .primaryKeys();
      await db.apiItems.bulkDelete(apiIds);
      // 清理环境和项目设置
      const envIds = await db.environments
        .where("projectId")
        .equals(id)
        .primaryKeys();
      await db.environments.bulkDelete(envIds);
      const settingsIds = await db.projectSettings
        .where("projectId")
        .equals(id)
        .primaryKeys();
      await db.projectSettings.bulkDelete(settingsIds);
    },
  );
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
    updatedAt: now,
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
        updatedAt: now,
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
    const apiRecords = await db.apiItems
      .where("nodeId")
      .anyOf(toDelete)
      .primaryKeys();
    await db.apiItems.bulkDelete(apiRecords);
  });
};

export const swapNodeOrder = async (a: TreeNode, b: TreeNode) => {
  await db.transaction("rw", db.nodes, async () => {
    await db.nodes.update(a.id, {
      sortOrder: b.sortOrder,
      updatedAt: Date.now(),
    });
    await db.nodes.update(b.id, {
      sortOrder: a.sortOrder,
      updatedAt: Date.now(),
    });
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

/**
 * 深拷贝一棵节点树（含所有子节点与关联 apiItem），生成全新 ID
 */
export const cloneNodeTree = async (
  sourceNodeId: string,
  targetParentId: string | null,
  targetProjectId: string,
  baseSortOrder: number,
): Promise<TreeNode> => {
  const now = Date.now();
  const allNodes = await db.nodes.toArray();
  const allApis = await db.apiItems.toArray();

  // 收集源节点及所有后代
  const collectAll = (id: string): TreeNode[] => {
    const node = allNodes.find((n) => n.id === id);
    if (!node) return [];
    const children = allNodes
      .filter((n) => n.parentId === id)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return [node, ...children.flatMap((c) => collectAll(c.id))];
  };

  const sourceNodes = collectAll(sourceNodeId);
  if (!sourceNodes.length) throw new Error("源节点不存在");

  // 旧 ID -> 新 ID 映射
  const idMap = new Map<string, string>();
  for (const n of sourceNodes) {
    idMap.set(n.id, nanoid());
  }

  const newNodes: TreeNode[] = [];
  const newApis: ApiItem[] = [];

  for (const n of sourceNodes) {
    const newId = idMap.get(n.id)!;
    const isRoot = n.id === sourceNodeId;
    const newParentId = isRoot
      ? targetParentId
      : (idMap.get(n.parentId!) ?? targetParentId);

    newNodes.push({
      id: newId,
      projectId: targetProjectId,
      parentId: newParentId,
      type: n.type,
      name: isRoot ? `${n.name} (副本)` : n.name,
      sortOrder: isRoot ? baseSortOrder : n.sortOrder,
      createdAt: now,
      updatedAt: now,
    });

    // 复制关联的 apiItem
    if (n.type === "api") {
      const srcApi = allApis.find((a) => a.nodeId === n.id);
      if (srcApi) {
        newApis.push({
          ...srcApi,
          id: nanoid(),
          projectId: targetProjectId,
          nodeId: newId,
          name: isRoot ? `${srcApi.name} (副本)` : srcApi.name,
          updatedAt: now,
        });
      }
    }
  }

  await db.transaction("rw", db.nodes, db.apiItems, async () => {
    await db.nodes.bulkAdd(newNodes);
    if (newApis.length) await db.apiItems.bulkAdd(newApis);
  });

  return newNodes[0];
};

/**
 * 移动节点到新的父节点下（拖拽）
 * @param targetIndex 在目标父节点的子节点列表中的插入位置（0-based）
 */
export const moveNodeToParent = async (
  nodeId: string,
  newParentId: string | null,
  targetIndex: number,
) => {
  const now = Date.now();
  const allNodes = await db.nodes.toArray();

  // 不能把文件夹拖到自己或自己的后代中
  if (newParentId) {
    let checkId: string | null = newParentId;
    while (checkId) {
      if (checkId === nodeId)
        throw new Error("不能将节点移动到自身或其子节点下");
      const parent = allNodes.find((n) => n.id === checkId);
      checkId = parent?.parentId ?? null;
    }
  }

  // 获取目标父节点下的现有子节点（排除正在移动的节点）
  const siblings = allNodes
    .filter((n) => n.parentId === newParentId && n.id !== nodeId)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  // 插入到指定位置
  siblings.splice(targetIndex, 0, allNodes.find((n) => n.id === nodeId)!);

  await db.transaction("rw", db.nodes, async () => {
    for (let i = 0; i < siblings.length; i++) {
      await db.nodes.update(siblings[i].id, {
        parentId:
          siblings[i].id === nodeId ? newParentId : siblings[i].parentId,
        sortOrder: i + 1,
        updatedAt: now,
      });
    }
  });
};

// ==================== 环境变量 CRUD ====================

export const listEnvironments = async (
  projectId: string,
): Promise<Environment[]> => {
  return db.environments.where("projectId").equals(projectId).toArray();
};

export const createEnvironment = async (
  projectId: string,
  name: string,
): Promise<Environment> => {
  const now = Date.now();
  const env: Environment = {
    id: nanoid(),
    projectId,
    name,
    variables: [],
    createdAt: now,
    updatedAt: now,
  };
  await db.environments.add(env);
  return env;
};

export const updateEnvironment = async (
  env: Environment,
): Promise<Environment> => {
  const next = { ...env, updatedAt: Date.now() };
  await db.environments.put(next);
  return next;
};

export const deleteEnvironment = async (envId: string): Promise<void> => {
  await db.environments.delete(envId);
};

// ==================== 项目设置 CRUD ====================

export const getProjectSettings = async (
  projectId: string,
): Promise<ProjectSettings> => {
  const existing = await db.projectSettings
    .where("projectId")
    .equals(projectId)
    .first();
  if (existing) return existing;
  // 不存在时自动创建默认设置
  const settings: ProjectSettings = {
    id: nanoid(),
    projectId,
    globalHeaders: [],
    activeEnvId: null,
    updatedAt: Date.now(),
  };
  await db.projectSettings.add(settings);
  return settings;
};

export const saveProjectSettings = async (
  settings: ProjectSettings,
): Promise<ProjectSettings> => {
  const next = { ...settings, updatedAt: Date.now() };
  await db.projectSettings.put(next);
  return next;
};
