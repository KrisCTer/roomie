export const PROPERTY_TYPES = ["", "ROOM", "APARTMENT", "HOUSE", "STUDIO"];

export const filterApproved = (items) => {
  return items.filter((property) => {
    const status = (property.status || property.propertyStatus || "").toUpperCase();
    return !["PENDING", "DRAFT", "REJECT", "REJECTED"].includes(status);
  });
};

export const groupByProvince = (items) => {
  const map = new Map();

  items.forEach((property) => {
    const province =
      property.province ||
      property.provinceName ||
      property.address?.province ||
      "__OTHER__";

    if (!map.has(province)) {
      map.set(province, []);
    }
    map.get(province).push(property);
  });

  return Array.from(map.entries()).map(([province, list]) => ({
    province,
    items: list,
  }));
};

export const transformToCardData = (property, t) => {
  const price = property.monthlyRent ?? property.price ?? property.pricePerMonth ?? 0;

  const image =
    property.mediaList?.[0]?.url ||
    property.thumbnail ||
    property.image ||
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200";

  const province =
    property.province ||
    property.provinceName ||
    property.address?.province ||
    "";
  const district = property.district || property.address?.district || "";

  return {
    id: property.propertyId || property.id,
    title: property.title || t("home.untitled"),
    image,
    label: property.propertyLabel || "NONE",
    price,
    location:
      [district, province].filter(Boolean).join(", ") ||
      t("home.unknownAddress"),
    bedrooms: property.bedrooms || property.rooms,
    bathrooms: property.bathrooms,
    size: property.size,
    type: property.propertyType || "",
    displayType: property.propertyType
      ? t(`home.propertyType.${property.propertyType}`)
      : null,
    coordinateLocation: property.address?.location || null,
  };
};
