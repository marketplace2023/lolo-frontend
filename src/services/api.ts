import axios from "axios";
import { useAuthStore } from "@/store/useAuthStore";

export const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const requestUrl = typeof err.config?.url === "string" ? err.config.url : "";
    const isAuthRequest = requestUrl.startsWith("/auth/");
    const hasSession = Boolean(useAuthStore.getState().token);

    if (err.response?.status === 401 && hasSession && !isAuthRequest) {
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
