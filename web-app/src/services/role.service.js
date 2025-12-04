// src/services/role.service.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

export const createRole = (payload) =>
  BaseService.post(API.ROLE_CREATE, payload);

export const getRoles = () => BaseService.get(API.ROLE_GET_ALL);

export const getRole = (id) => BaseService.get(API.ROLE_GET(id));

export const updateRole = (id, payload) =>
  BaseService.put(API.ROLE_UPDATE(id), payload);

export const deleteRole = (id) =>
  BaseService.delete(API.ROLE_DELETE(id));
