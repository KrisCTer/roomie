// src/configurations/configuration.js
export const CONFIG = {
  API_GATEWAY: "http://localhost:8888/api/v1",
  SOCKET_URL: "http://localhost:8099", // WebSocket server for chat
  WS_ADMIN_LOGS: "ws://localhost:8888/api/v1/admin/ws/admin/logs", // WebSocket for admin logs
};

export const API = {
  // ========= AUTH (Identity Service - Port 8080) =========
  LOGIN: "/identity/auth/token",
  INTROSPECT: "/identity/auth/introspect",
  LOGOUT: "/identity/auth/logout",
  REFRESH_TOKEN: "/identity/auth/refresh",

  // ========= USER (Identity Service - Port 8080) =========
  REGISTER: "/identity/users/register",
  GET_ALL_USERS: "/identity/users",
  GET_USER: (userId) => `/identity/users/${userId}`,
  GET_MY_INFO: "/identity/users/my-info",
  UPDATE_USER: (userId) => `/identity/users/${userId}`,
  DELETE_USER: (userId) => `/identity/users/${userId}`,

  // Internal User endpoints
  INTERNAL_GET_ALL_USERS: "/identity/internal/users",
  INTERNAL_GET_USER: (userId) => `/identity/internal/users/${userId}`,
  INTERNAL_UPDATE_USER: (userId) => `/identity/internal/users/${userId}`,
  INTERNAL_DELETE_USER: (userId) => `/identity/internal/users/${userId}`,
  INTERNAL_SUSPEND_USER: (userId) => `/identity/internal/users/${userId}/suspend`,
  INTERNAL_BAN_USER: (userId) => `/identity/internal/users/${userId}/ban`,

  // ========= ROLE & PERMISSION (Identity Service - Port 8080) =========
  // Roles
  CREATE_ROLE: "/identity/roles",
  GET_ALL_ROLES: "/identity/roles",
  DELETE_ROLE: (role) => `/identity/roles/${role}`,

  // Permissions
  CREATE_PERMISSION: "/identity/permissions",
  GET_ALL_PERMISSIONS: "/identity/permissions",
  DELETE_PERMISSION: (permission) => `/identity/permissions/${permission}`,

  // ========= PROFILE (Profile Service - Port 8082) =========
  // User Profile
  GET_MY_PROFILE: "/profile/users/my-profile",
  UPDATE_MY_PROFILE: "/profile/users/my-profile",
  UPDATE_AVATAR: "/profile/users/avatar",
  UPDATE_ID_CARD: "/profile/me/id-card",
  GET_USER_PROFILE: (profileId) => `/profile/users/${profileId}`,
  GET_ALL_PROFILES: "/profile/users",
  SEARCH_USER: "/profile/search",

  // Internal Profile
  INTERNAL_CREATE_PROFILE: "/profile/internal/users",
  INTERNAL_GET_PROFILE: (userId) => `/profile/internal/users/${userId}`,

  // ID Card
  UPLOAD_IDCARD_TENANT: "/profile/idcard/tenant",
  UPLOAD_IDCARD_LANDLORD: "/profile/idcard/landlord",

  // ========= FILE SERVICE (File Service - Port 8088) =========
  FILE_UPLOAD: "/file/upload",
  FILE_DOWNLOAD: (fileId) => `/file/download/${fileId}`,
  FILE_DELETE: (fileId) => `/file/${fileId}`,
  FILE_GET_BY_ENTITY: (entityType, entityId) => `/file/entity/${entityType}/${entityId}`,
  FILE_GET_BY_OWNER: (ownerId) => `/file/owner/${ownerId}`,

  // ========= PROPERTY (Property Service - Port 8083) =========
  // Public Property endpoints
  CREATE_PROPERTY: "/property/",
  UPDATE_PROPERTY: (id) => `/property/${id}`,
  GET_PROPERTY: (id) => `/property/${id}`,
  DELETE_PROPERTY: (id) => `/property/${id}`,
  GET_ALL_PROPERTIES: "/property/properties",
  SEARCH_PROPERTY: "/property/search",
  PROPERTY_BY_PRICE: "/property/by-price",
  PROPERTY_BY_PROVINCE: "/property/by-province",
  PROPERTY_BY_ME: "/property/owner/me",

  // Internal Property endpoints
  PROPERTY_INTERNAL_PENDING: "/property/internal/pending",
  PROPERTY_INTERNAL_APPROVE: (id) => `/property/internal/${id}/approve`,
  PROPERTY_INTERNAL_REJECT: (id) => `/property/internal/${id}/reject`,
  PROPERTY_INTERNAL_GET: (id) => `/property/internal/${id}`,
  PROPERTY_INTERNAL_UPDATE: (id) => `/property/internal/${id}`,

  // ========= BOOKING (Booking Service - Port 8084) =========
  CREATE_BOOKING: "/booking/",
  GET_BOOKING: (id) => `/booking/${id}`,
  CONFIRM_BOOKING: (id) => `/booking/${id}/confirm`,
  CANCEL_BOOKING: (id) => `/booking/${id}/cancel`,

  // ========= CONTRACT (Contract Service - Port 8085) =========
  CREATE_CONTRACT: "/contract/",
  GET_CONTRACT: (id) => `/contract/${id}`,
  TENANT_SIGN_CONTRACT: (id) => `/contract/${id}/sign/tenant`,
  LANDLORD_SIGN_CONTRACT: (id) => `/contract/${id}/sign/landlord`,
  CONTRACT_PDF: (id) => `/contract/${id}/pdf`,
  CONTRACT_SIGNATURE_STATUS: (id) => `/contract/${id}/signature-status`,
  MY_CONTRACTS: "/contract/my-contracts",
  REQUEST_TENANT_OTP: (id) => `/contract/${id}/request-otp/tenant`,
  REQUEST_LANDLORD_OTP: (id) => `/contract/${id}/request-otp/landlord`,
  PAUSE_CONTRACT: (id) => `/contract/${id}/pause`,

  // ========= BILLING (Billing Service - Port 8086) =========
  CREATE_BILL: "/billing/",
  GET_BILL: (id) => `/billing/${id}`,
  GET_ALL_BILLS: "/billing/",
  GET_BILLS_BY_CONTRACT: (contractId) => `/billing/contract/${contractId}`,
  UPDATE_BILL: (id) => `/billing/${id}`,
  DELETE_BILL: (id) => `/billing/${id}`,

  // ========= PAYMENT (Payment Service - Port 8087) =========
  CREATE_PAYMENT: "/payment",
  GET_PAYMENT: (id) => `/payment/${id}`,
  GET_ALL_PAYMENTS: "/payment",
  PAYMENT_VNPAY_WEBHOOK: "/payment/webhook/vnpay",
  PAYMENT_MOMO_WEBHOOK: "/payment/webhook/momo",

  // ========= CHAT (Chat Service - Port 8089) =========
  // Conversations
  CREATE_CONVERSATION: "/chat/conversations/create",
  MY_CONVERSATIONS: "/chat/conversations/my-conversations",

  // Messages
  CREATE_MESSAGE: "/chat/messages/create",
  GET_MESSAGES: "/chat/messages", // Requires conversationId param

  // ========= ADMIN (Admin Service - Port 8081) =========
  // User Management
  ADMIN_GET_ALL_USERS: "/admin/users",
  ADMIN_GET_USER: (id) => `/admin/users/${id}`,
  ADMIN_DELETE_USER: (id) => `/admin/users/${id}`,
  ADMIN_SUSPEND_USER: (id) => `/admin/users/${id}/suspend`,
  ADMIN_BAN_USER: (id) => `/admin/users/${id}/ban`,

  // Property Management
  ADMIN_PENDING_PROPERTIES: "/admin/properties/pending",
  ADMIN_APPROVE_PROPERTY: (id) => `/admin/properties/${id}/approve`,
  ADMIN_REJECT_PROPERTY: (id) => `/admin/properties/${id}/reject`,
  ADMIN_GET_PROPERTY: (id) => `/admin/properties/${id}`,
  ADMIN_UPDATE_PROPERTY: (id) => `/admin/properties/${id}`,

  // Logs Management
  ADMIN_GET_LOGS: "/admin/logs",
  ADMIN_STREAM_LOGS_SSE: "/admin/logs/stream/sse",

  // System Configuration
  ADMIN_GET_SYSTEM_CONFIG: "/admin/system/config",
  ADMIN_UPDATE_SYSTEM_CONFIG: "/admin/system/config",
};

// Service Ports (for reference)
export const SERVICE_PORTS = {
  API_GATEWAY: 8888,
  IDENTITY: 8080,
  ADMIN: 8081,
  PROFILE: 8082,
  PROPERTY: 8083,
  BOOKING: 8084,
  CONTRACT: 8085,
  BILLING: 8086,
  PAYMENT: 8087,
  FILE: 8088,
  CHAT: 8089,
};

// HTTP Methods Helper
export const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
};

// Query Parameters Helper
export const buildQueryString = (params) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      query.append(key, value);
    }
  });
  return query.toString() ? `?${query.toString()}` : "";
};

// Full URL Builder
export const buildFullUrl = (endpoint, params = {}) => {
  const baseUrl = `${CONFIG.API_GATEWAY}${endpoint}`;
  const queryString = buildQueryString(params);
  return `${baseUrl}${queryString}`;
};

// WebSocket URL Builder
export const buildWebSocketUrl = (path) => {
  const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const host = CONFIG.API_GATEWAY.replace(/^https?:/, wsProtocol);
  return `${host}${path}`;
};

export default { CONFIG, API, SERVICE_PORTS, HTTP_METHODS, buildQueryString, buildFullUrl, buildWebSocketUrl };