// src/services/admin/adminProperty.service.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

export const adminGetPendingProperties = () =>
  BaseService.get(API.ADMIN_PENDING_PROPERTIES);

export const adminApproveProperty = (id) =>
  BaseService.put(API.ADMIN_APPROVE_PROPERTY(id));

export const adminRejectProperty = (id) =>
  BaseService.put(API.ADMIN_REJECT_PROPERTY(id));

export const adminGetPropertyDetail = (id) =>
  BaseService.get(API.ADMIN_GET_PROPERTY(id));

export const adminUpdateProperty = (id, data) =>
  BaseService.put(API.ADMIN_UPDATE_PROPERTY(id), data);