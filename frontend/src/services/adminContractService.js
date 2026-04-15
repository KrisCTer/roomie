// src/services/adminContractService.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";

export const adminGetAllContracts = () =>
  BaseService.get(API.ADMIN_GET_ALL_CONTRACTS);

export const adminGetContract = (id) =>
  BaseService.get(API.ADMIN_GET_CONTRACT(id));
