// src/services/admin/adminUser.service.js
import BaseService from "../BaseService";
import { API } from "../../configurations/configuration";

export const adminGetUsers = () =>
  BaseService.get(API.ADMIN_GET_ALL_USERS);

export const adminGetUser = (id) =>
  BaseService.get(API.ADMIN_GET_USER(id));

export const adminDeleteUser = (id) =>
  BaseService.delete(API.ADMIN_DELETE_USER(id));

export const adminSuspendUser = (id) =>
  BaseService.post(API.ADMIN_SUSPEND_USER(id));

export const adminBanUser = (id) =>
  BaseService.post(API.ADMIN_BAN_USER(id));