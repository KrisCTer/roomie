// web-app/src/services/contract.service.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

/**
 * Create a new contract
 */
export const createContract = (payload) =>
  BaseService.post(API.CREATE_CONTRACT, payload);

/**
 * Get my contracts (as landlord and tenant)
 * Returns: { asLandlord: ContractResponse[], asTenant: ContractResponse[] }
 */
export const getMyContracts = () =>
  BaseService.get(API.MY_CONTRACTS);

/**
 * Get contract details by ID
 */
export const getContractById = (id) =>
  BaseService.get(API.GET_CONTRACT(id));

/**
 * Request OTP for signing contract (Tenant)
 * Sends OTP to tenant's email
 */
export const requestTenantOTP = (contractId) =>
  BaseService.post(API.REQUEST_TENANT_OTP(contractId));
export const getContract = (id) =>
  BaseService.get(API.GET_CONTRACT(id));
/**
 * Request OTP for signing contract (Landlord)
 * Sends OTP to landlord's email
 */
export const requestLandlordOTP = (contractId) =>
  BaseService.post(API.REQUEST_LANDLORD_OTP(contractId));

/**
 * Verify OTP and sign contract (Tenant)
 */
export const tenantSignContract = (contractId, otpCode) =>
  BaseService.post(API.TENANT_SIGN_CONTRACT(contractId), { otpCode });

/**
 * Verify OTP and sign contract (Landlord)
 */
export const landlordSignContract = (contractId, otpCode) =>
  BaseService.post(API.LANDLORD_SIGN_CONTRACT(contractId), { otpCode });

/**
 * Get signature status
 */
export const getSignatureStatus = (id) =>
  BaseService.get(API.CONTRACT_SIGNATURE_STATUS(id));

/**
 * Get PDF URL
 */
export const getContractPdf = (id) =>
  BaseService.get(API.CONTRACT_PDF(id));

/**
 * Pause contract
 */
export const pauseContract = (id, reason) =>
  BaseService.post(API.PAUSE_CONTRACT(id), null, { params: { reason } });

/**
 * Resume contract
 */
export const resumeContract = (id) =>
  BaseService.post(API.RESUME_CONTRACT(id));

/**
 * Terminate contract
 */
export const terminateContract = (id, reason) =>
  BaseService.post(API.TERMINATE_CONTRACT(id), null, { params: { reason } });

export default {
  createContract,
  getMyContracts,
  getContractById,
  requestTenantOTP,
  requestLandlordOTP,
  tenantSignContract,
  landlordSignContract,
  getSignatureStatus,
  getContractPdf,
  pauseContract,
  resumeContract,
  terminateContract,
};