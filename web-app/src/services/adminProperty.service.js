// src/services/admin/adminProperty.service.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

export const adminGetAllProperties = () =>
  BaseService.get(API.GET_ALL_PROPERTIES);

export const adminGetPendingProperties = () =>
  BaseService.get(API.ADMIN_PENDING_PROPERTIES).catch(() =>
    BaseService.get(API.PROPERTY_INTERNAL_PENDING)
  );

const shouldFallback = (err) => {
  const s = err?.response?.status;
  return s === 401 || s === 403 || s === 404;
};

export const adminApproveProperty = async (id) => {
  try {
    return await BaseService.put(API.ADMIN_APPROVE_PROPERTY(id));
  } catch (err) {
    if (shouldFallback(err)) {
      return BaseService.put(API.PROPERTY_INTERNAL_APPROVE(id));
    }
    throw err;
  }
};

export const adminRejectProperty = async (id) => {
  try {
    return await BaseService.put(API.ADMIN_REJECT_PROPERTY(id));
  } catch (err) {
    if (shouldFallback(err)) {
      return BaseService.put(API.PROPERTY_INTERNAL_REJECT(id));
    }
    throw err;
  }
};

export const adminGetPropertyDetail = (id) =>
  BaseService.get(API.ADMIN_GET_PROPERTY(id)).catch(() =>
    BaseService.get(API.PROPERTY_INTERNAL_GET(id))
  );
export const adminUpdateProperty = (id, data) =>
  BaseService.put(API.ADMIN_UPDATE_PROPERTY(id), data).catch(() =>
    BaseService.put(API.PROPERTY_INTERNAL_UPDATE(id), data)
  );
