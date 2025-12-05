// src/services/booking.service.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

export const createBooking = (payload) =>
  BaseService.post(API.CREATE_BOOKING, payload);

export const getBooking = (id) =>
  BaseService.get(API.GET_BOOKING(id));

export const confirmBooking = (id) =>
  BaseService.post(API.CONFIRM_BOOKING(id));

export const cancelBooking = (id) =>
  BaseService.post(API.CANCEL_BOOKING(id));