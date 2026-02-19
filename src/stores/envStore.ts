import { create } from "zustand";
import {
  listEnvironments,
  createEnvironment,
  updateEnvironment,
  deleteEnvironment,
  getProjectSettings,
  saveProjectSettings,
} from "../db";
import type { Environment, KV, ProjectSettings } from "../types";

type EnvState = {
  /** 当前项目的所有环境 */
  environments: Environment[];
  /** 当前项目设置（全局 Header + 激活环境） */
  settings: ProjectSettings | null;
  /** 当前激活的环境对象（派生） */
  activeEnv: Environment | null;

  // 初始化
  load: (projectId: string) => Promise<void>;

  // 环境 CRUD
  addEnv: (projectId: string, name: string) => Promise<Environment>;
  removeEnv: (envId: string) => Promise<void>;
  saveEnv: (env: Environment) => Promise<void>;

  // 切换激活环境
  setActiveEnv: (envId: string | null) => Promise<void>;

  // 全局 Header
  setGlobalHeaders: (headers: KV[]) => Promise<void>;

  /** 将 {{key}} 替换为激活环境中的变量值 */
  resolveVariables: (text: string) => string;
};

export const useEnvStore = create<EnvState>((set, get) => ({
  environments: [],
  settings: null,
  activeEnv: null,

  load: async (projectId) => {
    const [envs, settings] = await Promise.all([
      listEnvironments(projectId),
      getProjectSettings(projectId),
    ]);
    const activeEnv = settings.activeEnvId
      ? (envs.find((e) => e.id === settings.activeEnvId) ?? null)
      : null;
    set({ environments: envs, settings, activeEnv });
  },

  addEnv: async (projectId, name) => {
    const env = await createEnvironment(projectId, name);
    const envs = [...get().environments, env];
    set({ environments: envs });
    return env;
  },

  removeEnv: async (envId) => {
    await deleteEnvironment(envId);
    const envs = get().environments.filter((e) => e.id !== envId);
    const settings = get().settings;
    // 如果删的正好是激活环境，清空激活
    if (settings && settings.activeEnvId === envId) {
      const next = { ...settings, activeEnvId: null };
      await saveProjectSettings(next);
      set({ environments: envs, settings: next, activeEnv: null });
    } else {
      set({ environments: envs });
    }
  },

  saveEnv: async (env) => {
    const updated = await updateEnvironment(env);
    const envs = get().environments.map((e) =>
      e.id === updated.id ? updated : e,
    );
    const activeEnv =
      get().settings?.activeEnvId === updated.id ? updated : get().activeEnv;
    set({ environments: envs, activeEnv });
  },

  setActiveEnv: async (envId) => {
    const settings = get().settings;
    if (!settings) return;
    const next = { ...settings, activeEnvId: envId };
    const saved = await saveProjectSettings(next);
    const activeEnv = envId
      ? (get().environments.find((e) => e.id === envId) ?? null)
      : null;
    set({ settings: saved, activeEnv });
  },

  setGlobalHeaders: async (headers) => {
    const settings = get().settings;
    if (!settings) return;
    const next = { ...settings, globalHeaders: headers };
    const saved = await saveProjectSettings(next);
    set({ settings: saved });
  },

  resolveVariables: (text) => {
    const activeEnv = get().activeEnv;
    if (!activeEnv || !activeEnv.variables.length) return text;
    return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
      const variable = activeEnv.variables.find(
        (v) => v.enabled && v.key === key,
      );
      return variable ? variable.value : match;
    });
  },
}));
