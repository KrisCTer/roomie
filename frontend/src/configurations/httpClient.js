import axios from "axios";
import { CONFIG, API } from "./configuration";
import { getToken, setToken, removeToken, removeUserProfile } from "../services/localStorageService";

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
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  failedQueue = [];
};

httpClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Network error (no response from server)
    if (!error.response) {
      return Promise.reject({
        ...error,
        message: "Không thể kết nối đến máy chủ. Vui lòng kiểm tra kết nối mạng.",
      });
    }

    const { status } = error.response;

    // 401 Unauthorized → try refresh token
    if (status === 401 && !originalRequest._retry) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return httpClient(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const currentToken = getToken();
        const res = await axios.post(
          `${CONFIG.API_GATEWAY}${API.REFRESH_TOKEN}`,
          { token: currentToken }
        );

        const newToken = res.data?.result?.token ?? res.data?.token;
        if (newToken) {
          setToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return httpClient(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        removeToken();
        removeUserProfile();
        window.location.href = "/login";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // 403 Forbidden → no permission
    if (status === 403) {
      removeToken();
      removeUserProfile();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default httpClient;

