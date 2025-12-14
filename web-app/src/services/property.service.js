// web-app/src/services/property.service.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

export const getAllProperties = (params) =>
  BaseService.get(API.GET_ALL_PROPERTIES, params);

export const getPropertyById = (id) =>
  BaseService.get(API.GET_PROPERTY(id));

export const createProperty = (data) =>
  BaseService.post(API.CREATE_PROPERTY, data);

export const updateProperty = (id, data) =>
  BaseService.put(API.UPDATE_PROPERTY(id), data);

export const deleteProperty = (id) =>
  BaseService.delete(API.DELETE_PROPERTY(id));

export const searchProperties = (query) =>
  BaseService.get(API.SEARCH_PROPERTY, { q: query });

export const getPropertiesByPrice = (min, max) =>
  BaseService.get(API.PROPERTY_BY_PRICE, { min, max });

export const getPropertiesByProvince = (province) =>
  BaseService.get(API.PROPERTY_BY_PROVINCE, { province });

export const getPropertiesByOwner = (params) =>
  BaseService.get(API.PROPERTY_BY_ME, params);

export const publishProperty = (propertyId) =>
  BaseService.post(API.PUBLISH_PROPERTY(propertyId));