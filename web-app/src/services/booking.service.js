// src/services/booking.service.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

/**
 * Create a new long-term booking/lease
 * @param {Object} payload - Booking data
 * @param {string} payload.propertyId - Property ID
 * @param {string} payload.leaseStart - Lease start date (ISO format)
 * @param {string} payload.leaseEnd - Lease end date (ISO format)
 * @param {number} payload.monthlyRent - Monthly rent amount
 * @param {number} payload.rentalDeposit - Rental deposit amount
 * @returns {Promise} API response
 */
export const createBooking = (payload) =>
  BaseService.post(API.CREATE_BOOKING, payload);

/**
 * Get booking details by ID
 * @param {string} id - Booking ID
 * @returns {Promise} Booking details
 */
export const getBooking = (id) =>
  BaseService.get(API.GET_BOOKING(id));

/**
 * Confirm a booking (Owner action)
 * @param {string} id - Booking ID
 * @returns {Promise} Updated booking
 */
export const confirmBooking = (id) =>
  BaseService.post(API.CONFIRM_BOOKING(id));

/**
 * Cancel a booking
 * @param {string} id - Booking ID
 * @returns {Promise} Updated booking
 */
export const cancelBooking = (id) =>
  BaseService.post(API.CANCEL_BOOKING(id));

/**
 * Get all bookings for current user
 * @returns {Promise} List of bookings
 */
export const getMyBookings = () =>
  BaseService.get("/booking/tenant/bookings");

/**
 * Get all bookings where user is the owner (Owner bookings)
 * @returns {Promise} List of bookings
 */
export const getOwnerBookings = () =>
  BaseService.get("/booking/owner/bookings");

/**
 * Get bookings by property ID (Owner)
 * @param {string} propertyId - Property ID
 * @returns {Promise} List of bookings
 */
export const getPropertyBookings = (propertyId) =>
  BaseService.get(`/booking/property/${propertyId}`);