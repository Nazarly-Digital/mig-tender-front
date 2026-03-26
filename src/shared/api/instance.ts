import axios from "axios";
import toast from "react-hot-toast";
import type { RefreshResponse } from "@/shared/types/auth";
import { useSessionStore } from "@/entities/auth/model/store";

function extractErrorMessage(error: unknown): string | null {
  const data = (error as { response?: { data?: Record<string, unknown> } })
    ?.response?.data;
  if (!data || typeof data !== "object") return null;
  if (typeof data.error === "string") return data.error;
  if (typeof data.detail === "string") return data.detail;
  if (typeof data.message === "string") return data.message;
  // Handle field-level errors like { "email": ["This field is required."] }
  const firstField = Object.values(data).find(
    (v) => Array.isArray(v) && typeof v[0] === "string",
  ) as string[] | undefined;
  if (firstField) return firstField[0];
  return null;
}

export const apiInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiInstance.interceptors.request.use((config) => {
  const { accessToken } = useSessionStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// Response interceptor — handle 401 with token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
};

apiInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Show backend error as toast (skip 401 — handled below)
    if (error.response && error.response.status !== 401) {
      const msg = extractErrorMessage(error);
      if (msg) toast.error(msg);
    }

    if (error.response?.status !== 401 || originalRequest._retry) {
      return Promise.reject(error);
    }

    // Don't intercept auth endpoints
    if (
      originalRequest.url?.includes("/auth/refresh/") ||
      originalRequest.url?.includes("/auth/login/")
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiInstance(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    const { refreshToken, setTokens, logout } = useSessionStore.getState();

    if (!refreshToken) {
      logout();
      if (typeof window !== "undefined") {
        window.location.href = "/select-role";
      }
      return Promise.reject(error);
    }

    try {
      const { data } = await axios.post<RefreshResponse>(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh/`,
        { refresh: refreshToken },
      );

      setTokens(data.access, data.refresh);
      processQueue(null, data.access);

      originalRequest.headers.Authorization = `Bearer ${data.access}`;
      return apiInstance(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      logout();
      if (typeof window !== "undefined") {
        window.location.href = "/select-role";
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
