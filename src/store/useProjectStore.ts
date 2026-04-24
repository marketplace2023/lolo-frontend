import { create } from "zustand";
import { persist } from "zustand/middleware";

interface IProject {
  id: string;
  codigo: string;
  descripcion: string;
  moneda?: { simbolo: string; nombre: string };
  costoIndirecto?: { administracion: number; utilidad: number; financiamiento: number };
}

interface IProjectState {
  activeProject: IProject | null;
  setActiveProject: (project: IProject | null) => void;
}

export const useProjectStore = create<IProjectState>()(
  persist(
    (set) => ({
      activeProject: null,
      setActiveProject: (project) => set({ activeProject: project }),
    }),
    { name: "lulo-project" }
  )
);
