// src/configurations/configuration.js
export const CONFIG = {
  API_GATEWAY: "http://localhost:8888/api/v1",
  SOCKET_URL: "http://localhost:8099", // WebSocket server
};

export const API = {
  // ========= AUTH =========
  LOGIN: "/identity/auth/token",
  INTROSPECT: "/identity/auth/introspect",
  LOGOUT: "/identity/auth/logout",
  REFRESH_TOKEN: "/identity/auth/refresh",

  // ========= USER & PROFILE =========
  REGISTER: "/identity/users/register",
  GET_USER: (id) => `/identity/users/${id}`,
  GET_ALL_USERS: "/identity/users",
  UPDATE_USER: (id) => `/identity/users/${id}`,
  DELETE_USER: (id) => `/identity/users/${id}`,

  MY_PROFILE: "/profile/users/my-profile",
  UPDATE_PROFILE: "/profile/users/my-profile",
  UPDATE_AVATAR: "/profile/users/avatar",
  UPDATE_ID_CARD: "/profile/me/id-card",
  GET_USER_PROFILE: (id) => `/profile/users/${id}`,
  SEARCH_USER: "/profile/users/search",

  // INTERNAL USER
  INTERNAL_USER: (id) => `/identity/internal/users/${id}`,
  INTERNAL_USER_BY_EMAILS: "/identity/internal/users/emails",
  INTERNAL_USER_BY_IDS: "/identity/internal/users/ids",

  // INTERNAL PROFILE
  INTERNAL_PROFILE: (id) => `/profile/internal/profiles/${id}`,

  // ID CARD
  IDCARD_CREATE: "/profile/id-cards",
  IDCARD_GET: (id) => `/profile/id-cards/${id}`,

  // ========= FILE SERVICE =========
  FILE_UPLOAD: "/file/upload",
  FILE_DOWNLOAD: (fileId) => `/file/download/${fileId}`,
  FILE_DELETE: (fileId) => `/file/${fileId}`,
  FILE_GET_BY_ENTITY: (entityType, entityId) => `/file/entity/${entityType}/${entityId}`,
  FILE_GET_BY_OWNER: (ownerId) => `/file/owner/${ownerId}`,

  // ========= ROLE / PERMISSION =========
  ROLE_CREATE: "/identity/roles",
  ROLE_GET_ALL: "/identity/roles",
  ROLE_GET: (id) => `/identity/roles/${id}`,
  ROLE_UPDATE: (id) => `/identity/roles/${id}`,
  ROLE_DELETE: (id) => `/identity/roles/${id}`,

  PERMISSION_CREATE: "/identity/permissions",
  PERMISSION_GET_ALL: "/identity/permissions",
  PERMISSION_GET: (id) => `/identity/permissions/${id}`,

  // ========= PAYMENT =========
  PAYMENT_CREATE: "/payment/create",
  PAYMENT_GET: (id) => `/payment/${id}`,
  PAYMENT_VNPAY_WEBHOOK: "/payment/webhook/vnpay",
  PAYMENT_MOMO_WEBHOOK: "/payment/webhook/momo",

  // ========= PROPERTY =========
  PROPERTY_CREATE: "/property/",
  PROPERTY_UPDATE: (id) => `/property/${id}`,
  PROPERTY_GET: (id) => `/property/${id}`,
  PROPERTY_DELETE: (id) => `/property/${id}`,
  PROPERTY_GET_ALL: "/property/properties",
  PROPERTY_SEARCH: "/property/search",
  PROPERTY_BY_PRICE: "/property/by-price",
  PROPERTY_BY_PROVINCE: "/property/by-province",
  
  // Internal Property endpoints
  PROPERTY_INTERNAL_PENDING: "/property/internal/pending",
  PROPERTY_INTERNAL_APPROVE: (id) => `/property/internal/${id}/approve`,
  PROPERTY_INTERNAL_REJECT: (id) => `/property/internal/${id}/reject`,
  PROPERTY_INTERNAL_GET: (id) => `/property/internal/${id}`,
  PROPERTY_INTERNAL_UPDATE: (id) => `/property/internal/${id}`,

  // ========= BOOKING =========
  BOOKING_CREATE: "/booking",
  BOOKING_GET: (id) => `/booking/${id}`,
  BOOKING_CONFIRM: (id) => `/booking/${id}/confirm`,
  BOOKING_CANCEL: (id) => `/booking/${id}/cancel`,

  // ========= BILLING =========
  BILL_CREATE: "/billing",
  BILL_GET: (id) => `/billing/${id}`,
  BILL_GET_ALL: "/billing",
  BILL_GET_BY_CONTRACT: (cId) => `/billing/contract/${cId}`,
  BILL_UPDATE: (id) => `/billing/${id}`,
  BILL_DELETE: (id) => `/billing/${id}`,

  // ========= CONTRACT =========
  CONTRACT_CREATE: "/contract",
  CONTRACT_GET: (id) => `/contract/${id}`,
  CONTRACT_TENANT_SIGN: (id) => `/contract/${id}/sign/tenant`,
  CONTRACT_LANDLORD_SIGN: (id) => `/contract/${id}/sign/landlord`,
  CONTRACT_PDF: (id) => `/contract/${id}/pdf`,
  CONTRACT_SIGNATURE_STATUS: (id) => `/contract/${id}/signature-status`,

  // ========= CHAT =========
  // Conversations
  CONVERSATION_BASE: "/chat/conversations",
  CREATE_CONVERSATION: "/chat/conversations/create",
  MY_CONVERSATIONS: "/chat/conversations/my-conversations",
  
  // Messages
  MESSAGE_BASE: "/chat/messages",
  CREATE_MESSAGE: "/chat/messages/create",
  GET_MESSAGES: "/chat/messages",

  // ========= POST =========
  MY_POST: "/social/posts/my-posts",
  CREATE_POST: "/social/posts",

  // ========= ADMIN =========
  ADMIN_USERS: "/admin/users",
  ADMIN_USER_DETAIL: (id) => `/admin/users/${id}`,
  ADMIN_USER_DELETE: (id) => `/admin/users/${id}`,
  ADMIN_USER_SUSPEND: (id) => `/admin/users/${id}/suspend`,
  ADMIN_USER_BAN: (id) => `/admin/users/${id}/ban`,

  ADMIN_PENDING_PROPERTIES: "/admin/properties/pending",
  ADMIN_PROPERTY_APPROVE: (id) => `/admin/properties/${id}/approve`,
  ADMIN_PROPERTY_REJECT: (id) => `/admin/properties/${id}/reject`,
  ADMIN_PROPERTY_DETAIL: (id) => `/admin/properties/${id}`,

  ADMIN_LOGS: "/admin/logs",
  ADMIN_STREAM_LOGS: "/admin/logs/stream/sse",

  ADMIN_SYSTEM_CONFIG: "/admin/system/config",
};