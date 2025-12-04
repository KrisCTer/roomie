import BaseService from "./BaseService";
import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";

export const getMyProfile = () => BaseService.get(API.MY_PROFILE);

export const updateProfile = (profileData) =>
  BaseService.put(API.UPDATE_PROFILE, profileData);

export const uploadAvatar = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return httpClient.put(API.UPDATE_AVATAR, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const updateIdCard = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return httpClient.put(API.UPDATE_ID_CARD, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getUserById = (userId) => BaseService.get(API.GET_USER(userId));

export const searchUsers = (data) =>
  BaseService.post(API.SEARCH_USER, data);
