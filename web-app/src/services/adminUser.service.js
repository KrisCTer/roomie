// src/services/admin/adminUser.service.js
import BaseService from "../BaseService";
import { API } from "../../configurations/configuration";

export const adminGetUsers = (params) =>
  BaseService.get(API.ADMIN_USERS, params);

export const adminGetUser = (id) =>
  BaseService.get(API.ADMIN_USER_DETAIL(id));

export const adminDeleteUser = (id) =>
  BaseService.delete(API.ADMIN_USER_DELETE(id));

export const adminSuspendUser = (id) =>
  BaseService.post(API.ADMIN_USER_SUSPEND(id));

export const adminBanUser = (id) =>
  BaseService.post(API.ADMIN_USER_BAN(id));
