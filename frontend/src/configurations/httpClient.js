import axios from "axios";
import { CONFIG, API } from "./configuration";
import { getToken, setToken } from "../services/localStorageService";

const httpClient = axios.create({
  baseURL: CONFIG.API_GATEWAY,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// === Request Interceptor ===
httpClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// === Response Interceptor ===
// Refresh is disabled because the identity service's /auth/refresh endpoint
// consistently returns 401. Enabling refresh causes cascading failures.
// When refresh is fixed on the backend, re-enable by uncommenting the block below.

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    // Network error (no response from server)
    if (!error.response) {
      return Promise.reject({
        ...error,
        message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
      });
    }

    return Promise.reject(error);
  }
);

export default httpClient;
