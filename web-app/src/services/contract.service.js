// src/services/contract.service.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

export const createContract = (payload) =>
  BaseService.post(API.CREATE_CONTRACT, payload);

export const getContract = (id) =>
  BaseService.get(API.GET_CONTRACT(id));

export const tenantSignContract = (id, payload) =>
  BaseService.post(API.TENANT_SIGN_CONTRACT(id), payload);

export const landlordSignContract = (id, payload) =>
  BaseService.post(API.LANDLORD_SIGN_CONTRACT(id), payload);

export const getContractPdf = (id) =>
  BaseService.get(API.CONTRACT_PDF(id));

export const getSignatureStatus = (id) =>
  BaseService.get(API.CONTRACT_SIGNATURE_STATUS(id));