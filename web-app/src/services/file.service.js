// src/services/file.service.js
import httpClient from "./httpClient";
import { API } from "../configurations/configuration";

export const uploadFile = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return httpClient
    .post(API.FILE_UPLOAD, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    })
    .then((res) => res.data);
};

export const getFile = (id) =>
  httpClient.get(API.FILE_GET(id), { responseType: "blob" });

export const deleteFile = (id) =>
  httpClient.delete(API.FILE_DELETE(id)).then((res) => res.data);
