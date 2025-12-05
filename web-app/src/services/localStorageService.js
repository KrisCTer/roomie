// src/services/localStorageService.js
const ACCESS_TOKEN_KEY = "access_token";

export const setToken = (token) => {
  if (!token) return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
};

export const getToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);

export const removeToken = () => localStorage.removeItem(ACCESS_TOKEN_KEY);

export const isAuthenticated = () => Boolean(getToken());

export const getUserInfo = () => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    const decodedPayload = atob(payload);
    return JSON.parse(decodedPayload);
  } catch (error) {
    console.error("Failed to decode token payload:", error);
    return null;
  }
};