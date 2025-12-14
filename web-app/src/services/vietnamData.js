// Vietnam provinces/cities data
export const vietnamProvinces = [
  { code: "HN", name: "Hà Nội" },
  { code: "HCM", name: "Hồ Chí Minh" },
  { code: "DN", name: "Đà Nẵng" },
  { code: "HP", name: "Hải Phòng" },
  { code: "CT", name: "Cần Thơ" },
  { code: "BD", name: "Bình Dương" },
  { code: "DNA", name: "Đồng Nai" },
  { code: "KH", name: "Khánh Hòa" },
  { code: "LA", name: "Long An" },
  { code: "QN", name: "Quảng Nam" },
  { code: "QNG", name: "Quảng Ninh" },
  { code: "VT", name: "Bà Rịa - Vũng Tàu" },
  { code: "BTH", name: "Bình Thuận" },
  { code: "TH", name: "Thanh Hóa" },
  { code: "NA", name: "Nghệ An" },
  { code: "HT", name: "Hà Tĩnh" },
];

// Sample districts for major cities
export const vietnamDistricts = {
  "Hà Nội": [
    "Ba Đình",
    "Hoàn Kiếm",
    "Tây Hồ",
    "Long Biên",
    "Cầu Giấy",
    "Đống Đa",
    "Hai Bà Trưng",
    "Hoàng Mai",
    "Thanh Xuân",
    "Nam Từ Liêm",
    "Bắc Từ Liêm",
    "Hà Đông",
  ],
  "Hồ Chí Minh": [
    "Quận 1",
    "Quận 2",
    "Quận 3",
    "Quận 4",
    "Quận 5",
    "Quận 6",
    "Quận 7",
    "Quận 8",
    "Quận 9",
    "Quận 10",
    "Quận 11",
    "Quận 12",
    "Bình Thạnh",
    "Gò Vấp",
    "Phú Nhuận",
    "Tân Bình",
    "Tân Phú",
    "Thủ Đức",
    "Bình Tân",
  ],
  "Đà Nẵng": [
    "Hải Châu",
    "Thanh Khê",
    "Sơn Trà",
    "Ngũ Hành Sơn",
    "Liên Chiểu",
    "Cẩm Lệ",
  ],
  "Đồng Nai": [
    "Biên Hòa",
    "Long Khánh",
    "Long Thành",
    "Nhơn Trạch",
    "Vĩnh Cửu",
  ],
  "Bình Dương": ["Thủ Dầu Một", "Dĩ An", "Thuận An", "Tân Uyên", "Bến Cát"],
};

// Sample wards
export const vietnamWards = {
  "Ba Đình": ["Phúc Xá", "Trúc Bạch", "Vĩnh Phúc", "Cống Vị", "Liễu Giai"],
  "Quận 1": ["Tân Định", "Đa Kao", "Bến Nghé", "Bến Thành", "Nguyễn Thái Bình"],
  "Hải Châu": ["Thạch Thang", "Hải Châu 1", "Hải Châu 2", "Phước Ninh"],
  "Biên Hòa": ["Trảng Dài", "Tân Phong", "Tân Biên", "Hố Nai", "Tân Tiến"],
  "Thủ Dầu Một": ["Hiệp Thành", "Phú Hòa", "Phú Lợi", "Phú Cường"],
};

// Amenity options
export const homeSafetyOptions = [
  "Smoke Detector",
  "Carbon Monoxide Detector",
  "Fire Extinguisher",
  "Security System",
  "Door Lock",
];

export const bedroomOptions = [
  "King Bed",
  "Queen Bed",
  "Wardrobe",
  "Air Conditioning",
  "Heater",
];

export const kitchenOptions = [
  "Refrigerator",
  "Microwave",
  "Oven",
  "Dishwasher",
  "Coffee Maker",
];

export const otherOptions = [
  "WiFi",
  "TV",
  "Parking",
  "Gym",
  "Swimming Pool",
  "Garden",
  "Balcony",
];