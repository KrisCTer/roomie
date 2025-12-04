// src/services/permission.service.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

export const createPermission = (payload) =>
  BaseService.post(API.PERMISSION_CREATE, payload);

export const getPermissions = () =>
  BaseService.get(API.PERMISSION_GET_ALL);

export const getPermission = (id) =>
  BaseService.get(API.PERMISSION_GET(id));
