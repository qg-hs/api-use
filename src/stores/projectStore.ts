import { create } from "zustand";
import {
  createProject,
  deleteProject,
  listProjects,
  updateProject
} from "../db";
import type { Project } from "../types";

type ProjectState = {
  projects: Project[];
  loading: boolean;
  refresh: () => Promise<void>;
  createOne: (input: Pick<Project, "name" | "description">) => Promise<Project>;
  updateOne: (id: string, input: Partial<Pick<Project, "name" | "description">>) => Promise<void>;
  removeOne: (id: string) => Promise<void>;
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,
  refresh: async () => {
    set({ loading: true });
    const projects = await listProjects();
    set({ projects, loading: false });
  },
  createOne: async (input) => {
    const project = await createProject(input);
    await get().refresh();
    return project;
  },
  updateOne: async (id, input) => {
    await updateProject(id, input);
    await get().refresh();
  },
  removeOne: async (id) => {
    await deleteProject(id);
    await get().refresh();
  }
}));
