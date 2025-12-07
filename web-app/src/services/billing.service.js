// src/services/billing.service.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

export const createBill = (payload) =>
  BaseService.post(API.CREATE_BILL, payload);

export const getBill = (id) =>
  BaseService.get(API.GET_BILL(id));

export const getAllBills = (params) =>
  BaseService.get(API.GET_ALL_BILLS, params);

export const getBillsByContract = (contractId) =>
  BaseService.get(API.GET_BILLS_BY_CONTRACT(contractId));

export const updateBill = (id, payload) =>
  BaseService.put(API.UPDATE_BILL(id), payload);

export const deleteBill = (id) =>
  BaseService.delete(API.DELETE_BILL(id));

export const sendBill = (id) =>
  BaseService.post(`/billing/${id}/send`);

export const payBill = (billId, paymentId) =>
  BaseService.post(`/billing/${billId}/pay`, null, {
    params: { paymentId }
  });

  export const getMyBills = () =>
  BaseService.get("/billing/my-bills");