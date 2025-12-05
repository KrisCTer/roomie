// src/services/payment.service.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

export const createPayment = (payload) =>
  BaseService.post(API.CREATE_PAYMENT, payload);

export const getPayment = (id) =>
  BaseService.get(API.GET_PAYMENT(id));

export const getAllPayments = () =>
  BaseService.get(API.GET_ALL_PAYMENTS);

// Webhook thường là backend gọi, FE ít gọi trực tiếp, nhưng vẫn để nếu cần:
export const handleVnPayWebhook = (params) =>
  BaseService.get(API.PAYMENT_VNPAY_WEBHOOK, params);

export const handleMomoWebhook = (params) =>
  BaseService.post(API.PAYMENT_MOMO_WEBHOOK, params);