// src/services/admin/adminLog.service.js
import BaseService from "../BaseService";
import { API } from "../../configurations/configuration";

export const adminGetLogs = (params) =>
  BaseService.get(API.ADMIN_LOGS, params);

// Stream SSE: dùng EventSource trong component, không để trong BaseService
export const createLogsEventSource = () =>
  new EventSource(API.ADMIN_STREAM_LOGS);
