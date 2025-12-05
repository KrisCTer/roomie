// web-app/src/services/file.service.js
import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";

/**
 * Upload file
 * @param {File} file - File to upload
 * @param {Object} options - { entityType: string, entityId: string }
 * @returns {Promise}
 */
export const uploadFile = (file, options = {}) => {
  const formData = new FormData();
  formData.append("file", file);
  
  // Tạo URL với query params nếu có
  let url = API.FILE_UPLOAD;
  const params = new URLSearchParams();
  
  if (options.entityType) {
    params.append("entityType", options.entityType);
  }
  
  if (options.entityId) {
    params.append("entityId", options.entityId);
  }
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }

  console.log("Upload URL:", url); // Debug log
  console.log("Options:", options); // Debug log

  return httpClient
    .post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};

/**
 * Download file
 * @param {string} fileId - File ID
 * @returns {Promise<Blob>}
 */
export const downloadFile = (fileId) =>
  httpClient
    .get(API.FILE_DOWNLOAD(fileId), { responseType: "blob" })
    .then((res) => res.data);

/**
 * Delete file
 * @param {string} fileId - File ID
 * @returns {Promise}
 */
export const deleteFile = (fileId) =>
  httpClient.delete(API.FILE_DELETE(fileId)).then((res) => res.data);

/**
 * Get files by entity
 * @param {string} entityType - Entity type
 * @param {string} entityId - Entity ID
 * @returns {Promise}
 */
export const getFilesByEntity = (entityType, entityId) =>
  httpClient
    .get(API.FILE_GET_BY_ENTITY(entityType, entityId))
    .then((res) => res.data);

/**
 * Get files by owner
 * @param {string} ownerId - Owner ID
 * @returns {Promise}
 */
export const getFilesByOwner = (ownerId) =>
  httpClient.get(API.FILE_GET_BY_OWNER(ownerId)).then((res) => res.data);

export default {
  uploadFile,
  downloadFile,
  deleteFile,
  getFilesByEntity,
  getFilesByOwner,
};