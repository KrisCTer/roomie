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
  if (user) localStorage.setItem("user", JSON.stringify(user));

  return res;
};

export const logout = async () => {
  try {
    const token = localStorage.getItem("access_token");
    if (token) {
      await BaseService.post(API.LOGOUT, { token });
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    removeToken();
    localStorage.removeItem("user");
  }
};

export const register = (payload) => BaseService.post(API.REGISTER, payload);

export const introspect = (token) => 
  BaseService.post(API.INTROSPECT, { token });

export const refreshToken = (refreshToken) =>
  BaseService.post(API.REFRESH_TOKEN, { token: refreshToken });

export const getMyInfo = () => BaseService.get(API.GET_MY_INFO);

export const isAuthenticated = () => isAuthenticatedLS();