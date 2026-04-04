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
  { value: "ROOM", label: "Phong tro", icon: "🏠" },
  { value: "APARTMENT", label: "Can ho", icon: "🏢" },
  { value: "HOUSE", label: "Nha nguyen can", icon: "🏘️" },
  { value: "STUDIO", label: "Studio", icon: "🛋️" },
  { value: "VILLA", label: "Biet thu", icon: "🏰" },
  { value: "DORMITORY", label: "Ky tuc xa", icon: "🏫" },
];

export const BEDROOM_OPTIONS = [
  { value: 0, label: "Bat ky" },
  { value: 1, label: "1" },
  { value: 2, label: "2" },
  { value: 3, label: "3" },
  { value: 4, label: "4+" },
];

export const BATHROOM_OPTIONS = [
  { value: 0, label: "Bat ky" },
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

export const summaryChipStyle = {
  borderRadius: 999,
  border: "1px solid #E8D8C4",
  bgcolor: "#FFF7ED",
  px: 1.1,
  py: 0.45,
  fontSize: 12,
  color: "#7C2D12",
  fontWeight: 600,
};
