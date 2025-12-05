// src/services/user.service.js
import BaseService from "./BaseService";
import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";

// ========= USER (Identity Service) =========
export const getAllUsers = () => 
  BaseService.get(API.GET_ALL_USERS);

export const getUserById = (userId) => {
  return httpClient
    .get(API.GET_USER(userId))
    .then((res) => res.data);
};

export const getMyInfo = () => 
  BaseService.get(API.GET_MY_INFO);

export const updateUser = (userId, data) => 
  BaseService.put(API.UPDATE_USER(userId), data);

export const deleteUser = (userId) => 
  BaseService.delete(API.DELETE_USER(userId));

// ========= PROFILE (Profile Service) =========
export const getMyProfile = () => {
  return httpClient
    .get(API.GET_MY_PROFILE)
    .then((res) => res.data);
};
export const updateProfile = (data) => {
  return httpClient
    .put(API.UPDATE_MY_PROFILE, data)
    .then((res) => res.data);
};
export const updateMyProfile = (profileData) =>
  BaseService.put(API.UPDATE_MY_PROFILE, profileData);

export const getUserProfile = (profileId) => 
  BaseService.get(API.GET_USER_PROFILE(profileId));

export const getAllProfiles = () => 
  BaseService.get(API.GET_ALL_PROFILES);

// export const searchUsers = (query) =>
//   BaseService.post(API.SEARCH_USER, query);
export const searchUsers = (params) => {
  return httpClient
    .get(API.SEARCH_USER, { params })
    .then((res) => res.data);
};

// ========= FILE UPLOAD =========
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
    headers: { 
      "Content-Type": "multipart/form-data" 
    },
  });
};

// ========= ID CARD =========
export const uploadIdCardTenant = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return httpClient.post(API.UPLOAD_IDCARD_TENANT, formData, {
    headers: { 
      "Content-Type": "multipart/form-data" 
    },
  });
};

export const uploadIdCardLandlord = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return httpClient.post(API.UPLOAD_IDCARD_LANDLORD, formData, {
    headers: { 
      "Content-Type": "multipart/form-data" 
    },
  });
};

// ========= INTERNAL USER =========
export const internalGetAllUsers = () => 
  BaseService.get(API.INTERNAL_GET_ALL_USERS);

export const internalGetUser = (userId) => 
  BaseService.get(API.INTERNAL_GET_USER(userId));

export const internalUpdateUser = (userId, data) => 
  BaseService.put(API.INTERNAL_UPDATE_USER(userId), data);

export const internalDeleteUser = (userId) => 
  BaseService.delete(API.INTERNAL_DELETE_USER(userId));

export const internalSuspendUser = (userId) => 
  BaseService.post(API.INTERNAL_SUSPEND_USER(userId));

export const internalBanUser = (userId) => 
  BaseService.post(API.INTERNAL_BAN_USER(userId));

// ========= INTERNAL PROFILE =========
export const internalCreateProfile = (data) => 
  BaseService.post(API.INTERNAL_CREATE_PROFILE, data);

export const internalGetProfile = (userId) => 
  BaseService.get(API.INTERNAL_GET_PROFILE(userId));

export default {
  getAllUsers,
  getUserById,
  getMyInfo,
  updateUser,
  deleteUser,
  getMyProfile,
  updateMyProfile,
  getUserProfile,
  getAllProfiles,
  searchUsers,
  uploadAvatar,
  updateIdCard,
  uploadIdCardTenant,
  uploadIdCardLandlord,
  internalGetAllUsers,
  internalGetUser,
  internalUpdateUser,
  internalDeleteUser,
  internalSuspendUser,
  internalBanUser,
  internalCreateProfile,
  internalGetProfile,
};