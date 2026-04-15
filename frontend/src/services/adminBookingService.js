// src/services/adminBookingService.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

export const adminGetAllBookings = () =>
  BaseService.get(API.ADMIN_GET_ALL_BOOKINGS);

export const adminGetBooking = (id) =>
  BaseService.get(API.ADMIN_GET_BOOKING(id));

export const adminForceCancelBooking = (id) =>
  BaseService.post(API.ADMIN_FORCE_CANCEL_BOOKING(id));
