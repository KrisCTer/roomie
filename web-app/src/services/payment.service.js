// src/services/payment.service.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

export const createPayment = (payload) =>
  BaseService.post(API.PAYMENT_CREATE, payload);

export const getPayment = (id) =>
  BaseService.get(API.PAYMENT_GET(id));

// Webhook thường là backend gọi, FE ít gọi trực tiếp, nhưng vẫn để nếu cần:
export const handleVnPayWebhook = (payload) =>
  BaseService.post(API.PAYMENT_VNPAY_WEBHOOK, payload);

export const handleMomoWebhook = (payload) =>
  BaseService.post(API.PAYMENT_MOMO_WEBHOOK, payload);
