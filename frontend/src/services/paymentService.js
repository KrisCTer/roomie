/**
 * Payment Service API — ROOMIE-15
 *
 * Provides methods to interact with payment-service backend.
 * Supports MoMo, VNPay, and Cash payment methods.
 *
 * @module paymentService
 */
// src/services/paymentService.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

export const createPayment = (payload) =>
  BaseService.post(API.CREATE_PAYMENT, payload);

export const getPayment = (id) =>
  BaseService.get(API.GET_PAYMENT(id));

export const getAllPayments = () =>
  BaseService.get(API.GET_ALL_PAYMENTS);