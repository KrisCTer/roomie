// src/services/localStorageService.js
const ACCESS_TOKEN_KEY = "access_token";
const USER_INFO_KEY = "userInfo";

export const setToken = (token) =>
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
export const getToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const removeToken = () => localStorage.removeItem(ACCESS_TOKEN_KEY);
export const isAuthenticated = () => Boolean(getToken());

// ⭐ Decode JWT
export const getUserInfo = () => {
  const token = getToken();
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    const decoded = atob(payload);
    return JSON.parse(decoded); // có 'sub'
  } catch (err) {
    console.error("Failed to decode token:", err);
    return null;
  }
};

// ⭐ lưu profile backend trả về
export const setUserProfile = (profile) =>
  localStorage.setItem(USER_INFO_KEY, JSON.stringify(profile));

export const getUserProfile = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_INFO_KEY));
  } catch {
    return null;
  }
};

export const removeUserProfile = () => localStorage.removeItem(USER_INFO_KEY);

// ⭐ GỘP JWT + PROFILE → user hoàn chỉnh
export const getCompleteUserInfo = () => {
  const jwt = getUserInfo();
  if (!jwt) return null;

  const profile = getUserProfile() || {};
  const storedUsername = localStorage.getItem("username") || "";

  // Extract role from JWT scope (Spring Security: "ROLE_ADMIN ROLE_USER")
  const scope = jwt.scope || jwt.authorities || "";
  let jwtRole = "";
  if (typeof scope === "string") {
    const match = scope.match(/ROLE_(\w+)/);
    if (match) jwtRole = match[1].toLowerCase();
  } else if (Array.isArray(scope)) {
    const roleEntry = scope.find((s) => s.startsWith("ROLE_"));
    if (roleEntry) jwtRole = roleEntry.replace("ROLE_", "").toLowerCase();
  }

  const role =
    profile.role ?? profile.roles?.[0] ?? profile.userRole ?? jwtRole ?? "";

  return {
    userId: jwt.sub,
    username:
      profile.username || storedUsername || `user_${jwt.sub.substring(0, 8)}`,
    role,
    firstName: profile.firstName ?? "",
    lastName: profile.lastName ?? "",
    avatar: profile.avatar ?? "",
    email: profile.email ?? "",
  };
};
