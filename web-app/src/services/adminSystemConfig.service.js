// src/services/admin/adminSystemConfig.service.js
import BaseService from "../BaseService";
import { API } from "../../configurations/configuration";

export const getSystemConfig = () =>
  BaseService.get(API.ADMIN_GET_SYSTEM_CONFIG);

export const updateSystemConfig = (payload) =>
  BaseService.put(API.ADMIN_UPDATE_SYSTEM_CONFIG, payload);