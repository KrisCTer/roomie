export const PROVINCE_COORDINATES = {
  "Hồ Chí Minh": { lat: 10.8231, lng: 106.6297, zoom: 12 },
  "TP. Hồ Chí Minh": { lat: 10.8231, lng: 106.6297, zoom: 12 },
  "Hà Nội": { lat: 21.0285, lng: 105.8542, zoom: 12 },
  "Đà Nẵng": { lat: 16.0544, lng: 108.2022, zoom: 13 },
  "Cần Thơ": { lat: 10.0452, lng: 105.7469, zoom: 13 },
  "Hải Phòng": { lat: 20.8449, lng: 106.6881, zoom: 12 },
  "Biên Hòa": { lat: 10.9468, lng: 106.8232, zoom: 13 },
  "Nha Trang": { lat: 12.2388, lng: 109.1967, zoom: 13 },
  Huế: { lat: 16.4637, lng: 107.5909, zoom: 13 },
  "Vũng Tàu": { lat: 10.346, lng: 107.0844, zoom: 13 },
};

export const DEFAULT_SEARCH_CRITERIA = {
  location: "",
  propertyType: "",
  minPrice: 0,
  maxPrice: 50000000,
};

export const DEFAULT_FILTERS = {
  priceRange: [0, 50000000],
  propertyTypes: [],
  bedrooms: 0,
  bathrooms: 0,
};

export const getActiveFilterCount = (filters) => {
  let count = 0;

  if (filters.propertyTypes.length > 0) count += 1;
  if (filters.bedrooms > 0) count += 1;
  if (filters.bathrooms > 0) count += 1;
  if (filters.priceRange[0] !== 0 || filters.priceRange[1] !== 50000000) {
    count += 1;
  }

  return count;
};
