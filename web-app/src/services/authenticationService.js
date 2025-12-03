// src/services/authenticationService.js
import httpClient from "../configurations/httpClient";
import { API } from "../configurations/configuration";
import {
  setToken,
  removeToken,
  isAuthenticated as isAuthenticatedLS,
} from "./localStorageService";

// Đăng nhập → lưu token (ApiResponse.result.token hoặc token trực tiếp)
export const logIn = async (username, password) => {
  const res = await httpClient.post(API.LOGIN, { username, password });
  const token = res?.data?.result?.token ?? res?.data?.token;
  setToken(token);
  return res;
};

// Đăng xuất → xoá token
export const logOut = () => {
  removeToken();
};

// Kiểm tra đăng nhập
export const isAuthenticated = () => isAuthenticatedLS();

export const register = async (username, email, password) => {
  // backend UserController: /users/register
  return httpClient.post(API.REGISTER, {
    username,
    email,
    password,
  });
};
