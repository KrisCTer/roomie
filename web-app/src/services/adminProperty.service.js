// src/services/admin/adminProperty.service.js
import BaseService from "../BaseService";
import { API } from "../../configurations/configuration";

export const adminGetPendingProperties = (params) =>
  BaseService.get(API.ADMIN_PENDING_PROPERTIES, params);

export const adminApproveProperty = (id) =>
  BaseService.post(API.ADMIN_PROPERTY_APPROVE(id));

export const adminRejectProperty = (id, reason) =>
  BaseService.post(API.ADMIN_PROPERTY_REJECT(id), { reason });

export const adminGetPropertyDetail = (id) =>
  BaseService.get(API.ADMIN_PROPERTY_DETAIL(id));
