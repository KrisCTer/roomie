// web-app/src/services/file.service.js
import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";

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

export const getFile = (id) =>
  httpClient.get(API.FILE_GET(id), { responseType: "blob" });

export const deleteFile = (id) =>
  httpClient.delete(API.FILE_DELETE(id)).then((res) => res.data);