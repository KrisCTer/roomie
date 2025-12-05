// src/services/admin/adminLog.service.js
import BaseService from "../BaseService";
import { API, CONFIG } from "../../configurations/configuration";

export const adminGetLogs = (params) =>
  BaseService.get(API.ADMIN_GET_LOGS, params);

// Stream SSE: dùng EventSource trong component, không để trong BaseService
export const createLogsEventSource = () => {
  const url = `${CONFIG.API_GATEWAY}${API.ADMIN_STREAM_LOGS_SSE}`;
  return new EventSource(url);
};