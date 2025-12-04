// src/services/contract.service.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

export const createContract = (payload) =>
  BaseService.post(API.CONTRACT_CREATE, payload);

export const getContract = (id) =>
  BaseService.get(API.CONTRACT_GET(id));

export const tenantSignContract = (id) =>
  BaseService.post(API.CONTRACT_TENANT_SIGN(id));

export const landlordSignContract = (id) =>
  BaseService.post(API.CONTRACT_LANDLORD_SIGN(id));

export const getContractPdf = (id) =>
  BaseService.get(API.CONTRACT_PDF(id));

export const getSignatureStatus = (id) =>
  BaseService.get(API.CONTRACT_SIGNATURE_STATUS(id));
