// src/services/user.service.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

export const getMyProfile = () => BaseService.get(API.MY_PROFILE);

export const updateProfile = (profileData) =>
  BaseService.put(API.UPDATE_PROFILE, profileData);

export const uploadAvatar = (formData) =>
  BaseService.put(API.UPDATE_AVATAR, formData);

export const updateIdCard = (formData) =>
  BaseService.put(API.UPDATE_ID_CARD, formData);

export const getUserById = (userId) => BaseService.get(API.GET_USER(userId));

export const getAllUsers = () => BaseService.get(API.GET_ALL_USERS);
