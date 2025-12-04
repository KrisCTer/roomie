// src/services/auth.service.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";
import {
  setToken,
  removeToken,
  isAuthenticated as isAuthenticatedLS,
} from "./localStorageService";

export const login = async (username, password) => {
  const res = await BaseService.post(API.LOGIN, { username, password });

  // Token có thể nằm ở 2 dạng response
  const token = res?.result?.token ?? res?.token;
  if (token) setToken(token);

  // User info (nếu backend trả về)
  const user = res?.result?.user ?? res?.user;
  if (user) localStorage.setItem("user", JSON.stringify(user)); // ⭐ LƯU USER

  return res;
};

export const logout = () => {
  removeToken();
  localStorage.removeItem("user"); // ⭐ XÓA USER KHI ĐĂNG XUẤT
};

export const register = (payload) => BaseService.post(API.REGISTER, payload);

export const me = () => BaseService.get(API.MY_PROFILE);

export const isAuthenticated = () => isAuthenticatedLS();
