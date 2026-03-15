// web-app/src/services/favoriteService.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

/**
 * Toggle favorite status for a property
 * @param {string} propertyId 
 * @returns {Promise<{isFavorited: boolean, favoriteCount: number}>}
 */
export const toggleFavorite = (propertyId) =>
  BaseService.post(API.TOGGLE_FAVORITE(propertyId));

/**
 * Check if property is favorited
 * @param {string} propertyId 
 * @returns {Promise<{isFavorited: boolean, favoriteCount: number}>}
 */
export const checkFavorite = (propertyId) =>
  BaseService.get(API.CHECK_FAVORITE(propertyId));

/**
 * Get all favorite properties of current user
 * @returns {Promise<Array>}
 */
export const getMyFavorites = () =>
  BaseService.get(API.GET_MY_FAVORITES);

/**
 * Remove property from favorites
 * @param {string} propertyId 
 * @returns {Promise}
 */
export const removeFavorite = (propertyId) =>
  BaseService.delete(API.REMOVE_FAVORITE(propertyId));

/**
 * Get favorite count for a property
 * @param {string} propertyId 
 * @returns {Promise<{count: number}>}
 */
export const getFavoriteCount = (propertyId) =>
  BaseService.get(API.GET_FAVORITE_COUNT(propertyId));