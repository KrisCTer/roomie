// src/services/httpClient.js
import axios from "axios";
import { CONFIG } from "../configurations/configuration";
import { getToken } from "./localStorageService";

const http = axios.create({
  baseURL: CONFIG.API_GATEWAY,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default http;
