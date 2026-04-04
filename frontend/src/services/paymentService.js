// src/services/paymentService.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

export const createPayment = (payload) =>
  BaseService.post(API.CREATE_PAYMENT, payload);

export const getPayment = (id) =>
  BaseService.get(API.GET_PAYMENT(id));

export const getAllPayments = () =>
  BaseService.get(API.GET_ALL_PAYMENTS);