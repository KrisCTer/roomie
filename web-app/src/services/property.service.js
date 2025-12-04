// src/services/property.service.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

export const getAllProperties = (params) =>
  BaseService.get(API.PROPERTY_GET_ALL, params);

export const getPropertyById = (id) =>
  BaseService.get(API.PROPERTY_GET(id));

export const createProperty = (data) =>
  BaseService.post(API.PROPERTY_CREATE, data);

export const updateProperty = (id, data) =>
  BaseService.put(API.PROPERTY_UPDATE(id), data);

export const deleteProperty = (id) =>
  BaseService.delete(API.PROPERTY_DELETE(id));

export const getPropertiesByOwner = (ownerId) =>
  BaseService.get(API.PROPERTY_GET_BY_OWNER(ownerId));