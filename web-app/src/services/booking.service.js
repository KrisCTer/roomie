// src/services/booking.service.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

export const createBooking = (payload) =>
  BaseService.post(API.BOOKING_CREATE, payload);

export const getBooking = (id) =>
  BaseService.get(API.BOOKING_GET(id));

export const confirmBooking = (id) =>
  BaseService.post(API.BOOKING_CONFIRM(id));

export const cancelBooking = (id) =>
  BaseService.post(API.BOOKING_CANCEL(id));
