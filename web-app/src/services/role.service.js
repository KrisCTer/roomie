// src/services/role.service.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

export const createRole = (payload) =>
  BaseService.post(API.CREATE_ROLE, payload);

export const getAllRoles = () => 
  BaseService.get(API.GET_ALL_ROLES);

export const deleteRole = (role) =>
  BaseService.delete(API.DELETE_ROLE(role));