import { create } from "zustand";
import { persist } from "zustand/middleware";

interface IUser {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  companyId: string | null;
}

interface IAuthState {
  token: string | null;
  user: IUser | null;
  setAuth: (token: string, user: IUser) => void;
  logout: () => void;
}

export const useAuthStore = create<IAuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: "lulo-auth" }
  )
);
