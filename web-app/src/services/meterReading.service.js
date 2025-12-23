// src/services/meterReading.service.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

/**
 * Meter Reading Service
 * Manages electricity/water meter readings with AI OCR support
 */

// ========== CREATE ==========
export const createMeterReading = (payload) =>
  BaseService.post(API.CREATE_METER_READING, payload);

export const createManualMeterReading = (contractId, propertyId, readingMonth, payload) =>
  BaseService.post(
    `${API.CREATE_METER_READING}/manual`,
    payload,
    {
      params: { contractId, propertyId, readingMonth }
    }
  );

// ========== READ ==========
export const getMeterReading = (id) =>
  BaseService.get(API.GET_METER_READING(id));

export const getMeterReadingsByContract = (contractId) =>
  BaseService.get(API.GET_METER_READINGS_BY_CONTRACT(contractId));

export const getMeterReadingsByProperty = (propertyId) =>
  BaseService.get(API.GET_METER_READINGS_BY_PROPERTY(propertyId));

export const getLatestMeterReading = (contractId) =>
  BaseService.get(API.GET_LATEST_METER_READING(contractId));

// ========== UPDATE ==========
export const updateMeterReadingValues = (id, payload) =>
  BaseService.put(API.UPDATE_METER_READING_VALUES(id), payload);

// ========== DELETE ==========
export const deleteMeterReading = (id) =>
  BaseService.delete(API.DELETE_METER_READING(id));

export const deleteMeterReadingPhoto = (id, photoType) =>
  BaseService.delete(`${API.DELETE_METER_READING(id)}/photo`, {
    params: { photoType }
  });

// ========== AI OCR UPLOAD ==========
/**
 * Upload meter photo with Vietnamese AI OCR (RECOMMENDED)
 * Auto-extracts meter reading value
 */
export const uploadMeterPhotoWithAI = (meterReadingId, file, meterType) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("meterType", meterType); // ELECTRICITY or WATER

  return BaseService.post(
    `${API.UPLOAD_METER_PHOTO_AI(meterReadingId)}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

/**
 * Test Vietnamese OCR without saving
 */
export const testVietnameseOCR = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return BaseService.post(API.TEST_VIETNAMESE_OCR, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

/**
 * Test generic OCR without saving
 */
export const testGenericOCR = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return BaseService.post(API.TEST_GENERIC_OCR, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// ========== MANUAL PHOTO UPLOAD (No AI) ==========
export const uploadElectricityPhoto = (meterReadingId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  return BaseService.post(
    `${API.UPLOAD_ELECTRICITY_PHOTO(meterReadingId)}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

export const uploadWaterPhoto = (meterReadingId, file) => {
  const formData = new FormData();
  formData.append("file", file);

  return BaseService.post(
    `${API.UPLOAD_WATER_PHOTO(meterReadingId)}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
};

// ========== HELPERS ==========
/**
 * Get previous meter reading for inheritance
 */
export const getPreviousMeterReading = async (contractId, currentMonth) => {
  try {
    const res = await getMeterReadingsByContract(contractId);
    if (res?.success && res?.result?.length > 0) {
      // Filter readings before current month
      const previousReadings = res.result.filter(reading => {
        return new Date(reading.readingMonth) < new Date(currentMonth);
      });

      // Sort by date descending
      previousReadings.sort((a, b) => 
        new Date(b.readingMonth) - new Date(a.readingMonth)
      );

      return previousReadings[0] || null;
    }
    return null;
  } catch (error) {
    console.error("Error getting previous meter reading:", error);
    return null;
  }
};

/**
 * Create meter reading with OCR
 */
export const createMeterReadingWithOCR = async (
  contractId,
  propertyId,
  readingMonth,
  electricityFile,
  waterFile
) => {
  try {
    // 1. Create meter reading record
    const createRes = await createManualMeterReading(
      contractId,
      propertyId,
      readingMonth,
      {
        electricityReading: 0,
        waterReading: 0,
      }
    );

    if (!createRes?.success || !createRes?.result?.id) {
      throw new Error("Failed to create meter reading");
    }

    const meterReadingId = createRes.result.id;

    // 2. Upload electricity photo with AI
    if (electricityFile) {
      await uploadMeterPhotoWithAI(meterReadingId, electricityFile, "ELECTRICITY");
    }

    // 3. Upload water photo with AI
    if (waterFile) {
      await uploadMeterPhotoWithAI(meterReadingId, waterFile, "WATER");
    }

    // 4. Get updated meter reading
    const updatedRes = await getMeterReading(meterReadingId);
    return updatedRes;

  } catch (error) {
    console.error("Error creating meter reading with OCR:", error);
    throw error;
  }
};