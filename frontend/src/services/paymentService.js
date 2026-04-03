/**
 * Payment Service API
 *
 * Provides methods to interact with the payment-service backend.
 * Supports creating payments (MoMo, VNPay, Cash), fetching payment
 * details, and listing all payments.
 *
 * @module paymentService
 */
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

/**
 * Create a new payment transaction.
 *
 * For MoMo/VNPay methods, the response includes a `paymentUrl`
 * that the frontend should redirect the user to.
 *
 * @param {Object} payload - Payment details
 * @param {string} payload.billId - ID of the bill being paid
 * @param {string} [payload.contractId] - Associated contract ID
 * @param {number} payload.amount - Payment amount in VND
 * @param {string} payload.method - Payment method: 'MOMO' | 'VNPAY' | 'CASH'
 * @param {string} payload.description - Payment description
 * @returns {Promise<{result: {id, paymentUrl, status}}>}
 */
export const createPayment = (payload) =>
  BaseService.post(API.CREATE_PAYMENT, payload);

/**
 * Get payment details by ID.
 *
 * Used to check payment status after returning from the payment gateway.
 * Status values: 'PENDING', 'COMPLETED', 'FAILED'
 *
 * @param {string} id - Payment ID
 * @returns {Promise<{result: PaymentResponse}>}
 */
export const getPayment = (id) =>
  BaseService.get(API.GET_PAYMENT(id));

/**
 * Get all payments (admin use).
 *
 * @returns {Promise<{result: PaymentResponse[]}>}
 */
export const getAllPayments = () =>
  BaseService.get(API.GET_ALL_PAYMENTS);