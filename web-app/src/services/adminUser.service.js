// src/services/admin/adminUser.service.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

const isAuthError = (e) => {
  const status = e?.response?.status;
  return status === 401 || status === 403;
};

const doRequest = async (primaryFn, fallbackFn) => {
  try {
    return await primaryFn();
  } catch (e) {
    if (isAuthError(e) && fallbackFn) return await fallbackFn();
    throw e;
  }
};

export const adminGetUsers = () =>
  doRequest(
    () => BaseService.get(API.ADMIN_GET_ALL_USERS),
    () => BaseService.get(API.INTERNAL_GET_ALL_USERS)
  );

export const adminSuspendUser = (userId) => {
  return BaseService.post(API.ADMIN_SUSPEND_USER(userId));
};

export const adminBanUser = (userId) => {
  return BaseService.post(API.ADMIN_BAN_USER(userId));
};
