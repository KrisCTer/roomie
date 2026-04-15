// src/services/adminBillingService.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

export const adminGetAllBills = () =>
  BaseService.get(API.ADMIN_GET_ALL_BILLS);
