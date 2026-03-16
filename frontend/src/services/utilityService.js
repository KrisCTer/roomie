// src/services/utilityService.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

/**
 * Utility Configuration Service
 * Manages electricity, water, and service pricing configs
 */

// ========== CREATE ==========
export const createUtilityConfig = (payload) =>
  BaseService.post(API.CREATE_UTILITY, payload);

// ========== READ ==========
export const getUtilityConfig = (id) =>
  BaseService.get(API.GET_UTILITY(id));

export const getUtilityByProperty = (propertyId) =>
  BaseService.get(API.GET_UTILITY_BY_PROPERTY(propertyId));

export const getUtilityByContract = (contractId) =>
  BaseService.get(API.GET_UTILITY_BY_CONTRACT(contractId));

export const getMyUtilities = () =>
  BaseService.get(API.GET_MY_UTILITIES);

// ========== UPDATE ==========
export const updateUtilityConfig = (id, payload) =>
  BaseService.put(API.UPDATE_UTILITY(id), payload);

// ========== DELETE / DEACTIVATE ==========
export const deactivateUtilityConfig = (id) =>
  BaseService.post(API.DEACTIVATE_UTILITY(id));

export const deleteUtilityConfig = (id) =>
  BaseService.delete(API.DELETE_UTILITY(id));

// ========== HELPERS ==========
/**
 * Get active utility config for a contract
 * Priority: Contract-level > Property-level
 */
export const getActiveUtilityForContract = async (contractId, propertyId) => {
  try {

    // Step 1: Try contract-specific first
    const contractRes = await getUtilityByContract(contractId);

    if (contractRes?.success && contractRes?.result) {
      // Handle both array and single object
      const configs = Array.isArray(contractRes.result) 
        ? contractRes.result 
        : [contractRes.result];


      const activeConfig = configs.find(c => c.active);
      if (activeConfig) {
        return activeConfig;
      } else {
      }
    } else {
    }

    // Step 2: Fallback to property-level
    const propertyRes = await getUtilityByProperty(propertyId);

    if (propertyRes?.success && propertyRes?.result) {
      // Handle both array and single object
      const configs = Array.isArray(propertyRes.result)
        ? propertyRes.result
        : [propertyRes.result];


      const activeConfig = configs.find(c => c.active);
      if (activeConfig) {
        return activeConfig;
      } else {
      }
    } else {
    }

    return null;
  } catch (error) {
    console.error("❌ Error getting utility config:", error);
    console.error("Error details:", {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status,
    });
    return null;
  }
};

/**
 * Create default utility config for property
 */
export const createDefaultUtilityConfig = (propertyId) => {
  const defaultConfig = {
    propertyId,
    contractId: null, // Property-level config

    // Electricity (Vietnam average)
    electricityUnitPrice: 3500,

    // Water (Vietnam average)
    waterUnitPrice: 15000,

    // Fixed services
    internetPrice: 200000,
    parkingPrice: 100000,
    cleaningPrice: 50000,
    maintenancePrice: 0,

    // Meter info
    electricityMeterNumber: "",
    waterMeterNumber: "",

    active: true,
  };

  return createUtilityConfig(defaultConfig);
};