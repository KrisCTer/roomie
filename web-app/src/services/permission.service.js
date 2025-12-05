// src/services/permission.service.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

export const createPermission = (payload) =>
  BaseService.post(API.CREATE_PERMISSION, payload);

export const getAllPermissions = () =>
  BaseService.get(API.GET_ALL_PERMISSIONS);

export const deletePermission = (permission) =>
  BaseService.delete(API.DELETE_PERMISSION(permission));