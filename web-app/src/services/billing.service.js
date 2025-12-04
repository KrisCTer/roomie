// src/services/billing.service.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

export const createBill = (payload) =>
  BaseService.post(API.BILL_CREATE, payload);

export const getBill = (id) =>
  BaseService.get(API.BILL_GET(id));

export const getAllBills = (params) =>
  BaseService.get(API.BILL_GET_ALL, params);

export const getBillsByContract = (contractId) =>
  BaseService.get(API.BILL_GET_BY_CONTRACT(contractId));

export const updateBill = (id, payload) =>
  BaseService.put(API.BILL_UPDATE(id), payload);

export const deleteBill = (id) =>
  BaseService.delete(API.BILL_DELETE(id));
