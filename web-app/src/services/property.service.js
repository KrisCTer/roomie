// src/services/property.service.js
import BaseService from "./BaseService";
import { API } from "../configurations/configuration";
import { uploadImage } from "./file.service";
import BaseService from "./BaseService";

export const getAllProperties = (params) =>
  BaseService.get(API.PROPERTY_GET_ALL, params);

export const getPropertyById = (id) =>
  BaseService.get(API.PROPERTY_GET(id));

export const createProperty = (data) =>
  BaseService.post(API.PROPERTY_CREATE, data);

export const updateProperty = (id, data) =>
  BaseService.put(API.PROPERTY_UPDATE(id), data);

export const deleteProperty = (id) =>
  BaseService.delete(API.PROPERTY_DELETE(id));

export const getPropertiesByOwner = (ownerId) =>
  BaseService.get(API.PROPERTY_GET_BY_OWNER(ownerId));

export const createPropertyWithMedia = async (propertyData, images) => {
  // 1) Upload images to file-service
  const mediaUploads = [];
  for (const img of images) {
    const uploaded = await uploadImage(img.file);
    mediaUploads.push({
      url: uploaded.url,
      fileId: uploaded.id,
      mediaType: "IMAGE",
    });
  }

  // 2) Build payload for backend
  const payload = {
    title: propertyData.title,
    description: propertyData.description,
    monthlyRent: Number(propertyData.monthlyRent),
    rentalDeposit: Number(propertyData.rentalDeposit),
    propertyType: propertyData.propertyType,
    propertyStatus: "ACTIVE",
    propertyLabel: propertyData.propertyLabel,
    priceLabel: propertyData.priceLabel,
    rentalType: propertyData.rentalType || "LONG_TERM",

    size: Number(propertyData.size),
    rooms: Number(propertyData.rooms),
    bedrooms: Number(propertyData.bedrooms),
    bathrooms: Number(propertyData.bathrooms),
    garages: Number(propertyData.garages),

    // AddressRequest.java
    address: {
      fullAddress: propertyData.fullAddress,
      province: propertyData.province,
      district: propertyData.district,
      ward: propertyData.ward,
      street: propertyData.street,
      houseNumber: propertyData.houseNumber,
      location: propertyData.location,
    },

    // AmenitiesRequest.java
    amenities: {
      homeSafety: propertyData.homeSafety,
      bedroom: propertyData.bedroom,
      kitchen: propertyData.kitchen,
      others: propertyData.others,
    },

    // MediaRequest.java
    mediaList: mediaUploads,
  };

  // 3) Send to backend
  return BaseService.post(API.PROPERTY_CREATE, payload);
};
