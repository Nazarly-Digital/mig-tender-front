import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TokenUser, MeUser } from "@/shared/types/auth";

type SessionState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: TokenUser | null;
  meUser: MeUser | null;
  isAuthenticated: boolean;
};

type SessionActions = {
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: TokenUser) => void;
  setMeUser: (meUser: MeUser) => void;
  logout: () => void;
  reset: () => void;
};

const initialState: SessionState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  meUser: null,
  isAuthenticated: false,
};

export const useSessionStore = create<SessionState & SessionActions>()(
  persist(
    (set) => ({
      ...initialState,

      setTokens: (access, refresh) =>
        set({
          accessToken: access,
          refreshToken: refresh,
          isAuthenticated: true,
        }),

      setUser: (user) => set({ user }),

      setMeUser: (meUser) => set({ meUser }),

      logout: () => set({ ...initialState }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: "session-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        meUser: state.meUser,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
