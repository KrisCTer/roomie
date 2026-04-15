import { Home, Building2, Warehouse, Sofa, Castle, School } from "lucide-react";

export const DEFAULT_FILTERS = {
  priceRange: [0, 50000000],
  propertyTypes: [],
  bedrooms: 0,
  bathrooms: 0,
  nearbyEnabled: false,
  nearbyLat: null,
  nearbyLng: null,
  nearbyRadiusKm: 5,
};

export const RADIUS_OPTIONS = [1, 2, 3, 5, 10, 15, 20];

export const PROPERTY_TYPES = [
  { value: "ROOM", labelKey: "filters.room", icon: Home, color: "bg-orange-100/80 text-orange-700" },
  { value: "APARTMENT", labelKey: "filters.apartment", icon: Building2, color: "bg-sky-100/80 text-sky-700" },
  { value: "HOUSE", labelKey: "filters.house", icon: Warehouse, color: "bg-emerald-100/80 text-emerald-700" },
  { value: "STUDIO", labelKey: "filters.studio", icon: Sofa, color: "bg-indigo-100/80 text-indigo-700" },
  { value: "VILLA", labelKey: "filters.villa", icon: Castle, color: "bg-pink-100/80 text-pink-700" },
  { value: "DORMITORY", labelKey: "filters.dormitory", icon: School, color: "bg-teal-100/80 text-teal-700" },
];

export const BEDROOM_OPTIONS = [
  { value: 0, labelKey: "filters.any" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4+" },
];

export const BATHROOM_OPTIONS = [
  { value: 0, labelKey: "filters.any" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3+" },
];

export const getActiveFilterCount = (currentFilters) => {
  let count = 0;
  if (currentFilters.propertyTypes.length > 0) count += 1;
  if (currentFilters.bedrooms > 0) count += 1;
  if (currentFilters.bathrooms > 0) count += 1;
  if (
    currentFilters.priceRange[0] !== DEFAULT_FILTERS.priceRange[0] ||
    currentFilters.priceRange[1] !== DEFAULT_FILTERS.priceRange[1]
  ) {
    count += 1;
  }
  if (currentFilters.nearbyEnabled) count += 1;

  return count;
};
