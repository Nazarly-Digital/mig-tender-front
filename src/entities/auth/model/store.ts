import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { TokenUser } from "@/shared/types/auth";

type SessionState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: TokenUser | null;
  isAuthenticated: boolean;
};

type SessionActions = {
  setTokens: (access: string, refresh: string) => void;
  setUser: (user: TokenUser) => void;
  logout: () => void;
  reset: () => void;
};

const initialState: SessionState = {
  accessToken: null,
  refreshToken: null,
  user: null,
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

      logout: () => set({ ...initialState }),

      reset: () => set({ ...initialState }),
    }),
    {
      name: "session-storage",
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
