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

// Role helpers — check both `role` field (from login) and `is_*` flags (from /auth/me/)
export function isUserAdmin(user: TokenUser | null): boolean {
  return user?.role === 'admin' || user?.is_admin === true;
}
export function isUserDeveloper(user: TokenUser | null): boolean {
  return user?.role === 'developer' || user?.is_developer === true;
}
export function isUserBroker(user: TokenUser | null): boolean {
  return user?.role === 'broker' || user?.is_broker === true;
}

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
