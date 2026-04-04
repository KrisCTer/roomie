// src/services/userService.js
import BaseService from "./BaseService";
import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";
import {
  getCompleteUserInfo,
  getUserProfile as getStoredUserProfile,
} from "./localStorageService";

// ========= USER (Identity Service) =========
export const getAllUsers = () => 
  BaseService.get(API.GET_ALL_USERS);

export const getUserById = (userId) => 
  BaseService.get(API.GET_USER(userId));

export const getMyInfo = () => 
  BaseService.get(API.GET_MY_INFO);

export const updateUser = (userId, data) => 
  BaseService.put(API.UPDATE_USER(userId), data);

export const deleteUser = (userId) => 
  BaseService.delete(API.DELETE_USER(userId));

const resolveCurrentIdentity = () => {
  const complete = getCompleteUserInfo() || {};
  const storedProfile = getStoredUserProfile() || {};

  const userId = complete.userId || storedProfile.userId || storedProfile.id;

  const roleCandidates = [
    ...(Array.isArray(storedProfile.roles)
      ? storedProfile.roles.map((role) =>
          typeof role === "string" ? role : role?.name,
        )
      : []),
    storedProfile.role,
    storedProfile.userRole,
    complete.role,
  ]
    .map((role) => (role || "").toString().trim())
    .filter(Boolean);

  const roles = [...new Set(roleCandidates.map((role) => role.toUpperCase()))];

  return {
    userId,
    roles,
    username: complete.username || storedProfile.username || "",
  };
};

export const changeMyPassword = async ({ username, oldPassword, newPassword }) => {
  const identity = resolveCurrentIdentity();
  const currentUsername = username || identity.username;

  if (!currentUsername || !oldPassword || !newPassword) {
    throw new Error("Missing required fields for password update");
  }

  // Validate old password against login API before updating
  await BaseService.post(API.LOGIN, {
    username: currentUsername,
    password: oldPassword,
  });

  const { userId, roles } = identity;

  if (!userId || roles.length === 0) {
    throw new Error("Cannot resolve user identity for password update");
  }

  return updateUser(userId, {
    password: newPassword,
    roles,
  });
};

export const deleteMyAccount = async () => {
  const { userId } = resolveCurrentIdentity();

  if (!userId) {
    throw new Error("Cannot resolve user identity for account deletion");
  }

  return deleteUser(userId);
};

// ========= PROFILE (Profile Service) =========
export const getMyProfile = () => 
  BaseService.get(API.GET_MY_PROFILE);

export const updateMyProfile = (profileData) =>
  BaseService.put(API.UPDATE_MY_PROFILE, profileData);

export const getUserProfile = (profileId) => 
  BaseService.get(API.GET_USER_PROFILE(profileId));

export const getAllProfiles = () => 
  BaseService.get(API.GET_ALL_PROFILES);

export const searchUsers = (query) =>
  BaseService.post(API.SEARCH_USER, query);

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
  changeMyPassword,
  deleteMyAccount,
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