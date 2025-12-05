import React, { useState, useEffect, useRef } from "react";
import {
  Building,
  Upload,
  Trash2,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Car,
  Maximize,
  Map as MapIcon,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import {
  createProperty,
  updateProperty,
  getPropertyById,
} from "../../services/property.service";
import { uploadFile } from "../../services/file.service";

// Vietnam provinces/cities data
const vietnamProvinces = [
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

// Sample districts for major cities (you should expand this)
const vietnamDistricts = {
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

// Sample wards (you should expand this)
const vietnamWards = {
  "Ba Đình": ["Phúc Xá", "Trúc Bạch", "Vĩnh Phúc", "Cống Vị", "Liễu Giai"],
  "Quận 1": ["Tân Định", "Đa Kao", "Bến Nghé", "Bến Thành", "Nguyễn Thái Bình"],
  "Hải Châu": ["Thạch Thang", "Hải Châu 1", "Hải Châu 2", "Phước Ninh"],
  "Biên Hòa": ["Trảng Dài", "Tân Phong", "Tân Biên", "Hố Nai", "Tân Tiến"],
  "Thủ Dầu Một": ["Hiệp Thành", "Phú Hòa", "Phú Lợi", "Phú Cường"],
};

const AddProperty = () => {
  const [activeMenu, setActiveMenu] = useState("Add Property");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [propertyId, setPropertyId] = useState(null);

  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [map, setMap] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  const [propertyData, setPropertyData] = useState({
    title: "",
    description: "",
    monthlyRent: "",
    rentalDeposit: "",
    propertyType: "",
    propertyStatus: "AVAILABLE",
    propertyLabel: "NONE",
    size: "",
    rooms: "",
    bedrooms: "",
    bathrooms: "",
    garages: "",
    rentalType: "MONTHLY",
    fullAddress: "",
    province: "",
    district: "",
    ward: "",
    street: "",
    houseNumber: "",
    location: "",
    homeSafety: [],
    bedroom: [],
    kitchen: [],
    others: [],
    mediaList: [],
  });

  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [availableDistricts, setAvailableDistricts] = useState([]);
  const [availableWards, setAvailableWards] = useState([]);
  const [gettingLocation, setGettingLocation] = useState(false);

  // Load Google Maps Script
  useEffect(() => {
    const loadGoogleMaps = () => {
      // Check if already loaded
      if (window.google && window.google.maps) {
        setMapsLoaded(true);
        return;
      }

      const existingScript = document.getElementById("google-maps-script");
      if (existingScript) {
        existingScript.addEventListener("load", () => {
          setMapsLoaded(true);
        });
        return;
      }

      const script = document.createElement("script");
      script.id = "google-maps-script";
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.addEventListener("load", () => {
        console.log("✅ Google Maps API loaded successfully");
        setMapsLoaded(true);
      });

      script.addEventListener("error", (e) => {
        console.error("❌ Failed to load Google Maps API:", e);
        setError("Failed to load Google Maps. Please check your API key.");
      });

      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Initialize map when everything is ready
  useEffect(() => {
    if (mapsLoaded && mapRef.current && currentStep === 2) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => {
        initMap();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [mapsLoaded, currentStep]);

  const initMap = () => {
    if (!mapRef.current || !window.google || !window.google.maps) {
      console.warn("Map initialization skipped - not ready yet");
      return;
    }

    // Avoid reinitializing if map already exists
    if (map) {
      console.log("Map already initialized");
      return;
    }

    try {
      console.log("🗺️ Initializing Google Map...");

      // Default to Bien Hoa, Dong Nai
      const defaultCenter = { lat: 10.9447, lng: 106.8392 };

      const mapInstance = new window.google.maps.Map(mapRef.current, {
        center: defaultCenter,
        zoom: 13,
        mapTypeControl: true,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      });

      console.log("✅ Map instance created");
      setMap(mapInstance);

      // Add click listener to map
      mapInstance.addListener("click", (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        console.log("Map clicked:", lat, lng);
        updateMapMarker(lat, lng);
      });

      // Add marker
      const marker = new window.google.maps.Marker({
        map: mapInstance,
        draggable: true,
        position: defaultCenter,
        title: "Drag me to select location",
      });

      console.log("✅ Marker created");
      markerRef.current = marker;

      // Add drag listener to marker
      marker.addListener("dragend", (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        console.log("Marker dragged to:", lat, lng);
        updateLocation(lat, lng);
      });

      // Set initial location if exists
      if (propertyData.location) {
        const [lat, lng] = propertyData.location
          .split(",")
          .map((v) => parseFloat(v.trim()));
        if (!isNaN(lat) && !isNaN(lng)) {
          updateMapMarker(lat, lng);
        }
      }
    } catch (error) {
      console.error("Error initializing map:", error);
      setError("Failed to initialize map. Please refresh the page.");
    }
  };

  const updateMapMarker = (lat, lng) => {
    if (markerRef.current) {
      markerRef.current.setPosition({ lat, lng });
    }
    if (map) {
      map.panTo({ lat, lng });
    }
    updateLocation(lat, lng);
  };

  const updateLocation = (lat, lng) => {
    const locationStr = `${lat.toFixed(6)},${lng.toFixed(6)}`;
    setSelectedLocation({ lat, lng });
    setPropertyData((prev) => ({
      ...prev,
      location: locationStr,
    }));
  };

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setGettingLocation(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        console.log("Current location:", lat, lng);

        updateMapMarker(lat, lng);

        if (map) {
          map.setZoom(15); // Zoom in to current location
        }

        setGettingLocation(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        let errorMessage = "Unable to get your location. ";

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Please allow location access in your browser.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out.";
            break;
          default:
            errorMessage += "An unknown error occurred.";
        }

        setError(errorMessage);
        setGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  // Auto-fill full address when address fields change
  useEffect(() => {
    const addressParts = [
      propertyData.houseNumber,
      propertyData.street,
      propertyData.ward,
      propertyData.district,
      propertyData.province,
    ].filter((part) => part && part.trim());

    if (addressParts.length > 0) {
      const fullAddress = addressParts.join(", ");
      setPropertyData((prev) => ({
        ...prev,
        fullAddress,
      }));
    }
  }, [
    propertyData.houseNumber,
    propertyData.street,
    propertyData.ward,
    propertyData.district,
    propertyData.province,
  ]);

  // Update available districts when province changes
  useEffect(() => {
    if (propertyData.province) {
      const districts = vietnamDistricts[propertyData.province] || [];
      setAvailableDistricts(districts);
      // Reset district and ward if province changes
      if (!districts.includes(propertyData.district)) {
        setPropertyData((prev) => ({
          ...prev,
          district: "",
          ward: "",
        }));
      }
    }
  }, [propertyData.province]);

  // Update available wards when district changes
  useEffect(() => {
    if (propertyData.district) {
      const wards = vietnamWards[propertyData.district] || [];
      setAvailableWards(wards);
      // Reset ward if district changes
      if (!wards.includes(propertyData.ward)) {
        setPropertyData((prev) => ({
          ...prev,
          ward: "",
        }));
      }
    }
  }, [propertyData.district]);

  // Check if edit mode and load property data
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get("edit");

    if (editId) {
      setIsEditMode(true);
      setPropertyId(editId);
      loadPropertyData(editId);
    }
  }, []);

  const loadPropertyData = async (id) => {
    try {
      setLoading(true);
      const response = await getPropertyById(id);

      const property =
        response?.result ||
        response?.data?.result ||
        response?.data ||
        response;

      if (property) {
        setPropertyData({
          title: property.title || "",
          description: property.description || "",
          monthlyRent: property.monthlyRent || "",
          rentalDeposit: property.rentalDeposit || "",
          propertyType: property.propertyType || "",
          propertyStatus:
            property.propertyStatus || property.status || "AVAILABLE",
          propertyLabel: property.propertyLabel || "NONE",
          size: property.size || "",
          rooms: property.rooms || "",
          bedrooms: property.bedrooms || "",
          bathrooms: property.bathrooms || "",
          garages: property.garages || "",
          rentalType: property.rentalType || "MONTHLY",
          fullAddress: property.address?.fullAddress || "",
          province: property.address?.province || "",
          district: property.address?.district || "",
          ward: property.address?.ward || "",
          street: property.address?.street || "",
          houseNumber: property.address?.houseNumber || "",
          location: property.address?.location || "",
          homeSafety: property.amenities?.homeSafety || [],
          bedroom: property.amenities?.bedroom || [],
          kitchen: property.amenities?.kitchen || [],
          others: property.amenities?.others || [],
        });

        // Update map if location exists
        if (property.address?.location) {
          const [lat, lng] = property.address.location
            .split(",")
            .map((v) => parseFloat(v.trim()));
          if (!isNaN(lat) && !isNaN(lng) && map) {
            updateMapMarker(lat, lng);
          }
        }

        if (property.mediaList && property.mediaList.length > 0) {
          setUploadedImages(
            property.mediaList.map((media) => ({
              url: media.url,
              type: media.type || "IMAGE",
              fileId: media.fileId,
            }))
          );
        }
      }
    } catch (err) {
      console.error("Failed to load property:", err);
      setError("Failed to load property data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPropertyData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAmenityToggle = (category, value) => {
    setPropertyData((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value],
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    setError(null);

    try {
      const uploadPromises = files.map(async (file) => {
        try {
          // Validate file type
          if (!file.type.startsWith("image/")) {
            console.error("Invalid file type:", file.type);
            return null;
          }

          // Validate file size (10MB)
          if (file.size > 10 * 1024 * 1024) {
            console.error("File too large:", file.size);
            return null;
          }

          console.log("Uploading file:", file.name);
          const response = await uploadFile(file);
          console.log("Upload response:", response);

          // Handle different response structures
          const fileData = response?.result || response?.data || response;

          return {
            url:
              fileData?.publicUrl || fileData?.url || URL.createObjectURL(file),
            type: "IMAGE",
            fileId: fileData?.fileId || fileData?.id,
          };
        } catch (err) {
          console.error("Failed to upload image:", err);
          return null;
        }
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const successfulUploads = uploadedFiles.filter((file) => file !== null);

      setUploadedImages((prev) => [...prev, ...successfulUploads]);

      if (successfulUploads.length < files.length) {
        const failedCount = files.length - successfulUploads.length;
        setError(
          `${failedCount} image(s) failed to upload. Please check file size and format.`
        );
      }
    } catch (err) {
      console.error("Upload error:", err);
      setError("Failed to upload images. Please try again.");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const validateStep1 = () => {
    if (!propertyData.title.trim()) {
      setError("Property title is required");
      return false;
    }
    if (!propertyData.description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!propertyData.monthlyRent || propertyData.monthlyRent <= 0) {
      setError("Valid monthly rent is required");
      return false;
    }
    if (!propertyData.propertyType) {
      setError("Property type is required");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!propertyData.province.trim()) {
      setError("Province is required");
      return false;
    }
    if (!propertyData.district.trim()) {
      setError("District is required");
      return false;
    }
    if (!propertyData.fullAddress.trim()) {
      setError("Full address is required");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload = {
        title: propertyData.title,
        description: propertyData.description,
        monthlyRent: parseFloat(propertyData.monthlyRent),
        rentalDeposit: propertyData.rentalDeposit
          ? parseFloat(propertyData.rentalDeposit)
          : null,
        propertyType: propertyData.propertyType,
        propertyStatus: propertyData.propertyStatus,
        propertyLabel: propertyData.propertyLabel,
        size: propertyData.size ? parseFloat(propertyData.size) : null,
        rooms: propertyData.rooms ? parseInt(propertyData.rooms) : null,
        bedrooms: propertyData.bedrooms
          ? parseInt(propertyData.bedrooms)
          : null,
        bathrooms: propertyData.bathrooms
          ? parseInt(propertyData.bathrooms)
          : null,
        garages: propertyData.garages ? parseInt(propertyData.garages) : null,
        rentalType: propertyData.rentalType,
        address: {
          fullAddress: propertyData.fullAddress,
          province: propertyData.province,
          district: propertyData.district,
          ward: propertyData.ward,
          street: propertyData.street,
          houseNumber: propertyData.houseNumber,
          location: propertyData.location,
        },
        amenities: {
          homeSafety: propertyData.homeSafety,
          bedroom: propertyData.bedroom,
          kitchen: propertyData.kitchen,
          others: propertyData.others,
        },
        mediaList: uploadedImages.map((img) => ({
          url: img.url,
          type: img.type,
        })),
      };

      console.log("Submitting payload:", payload);

      let response;
      if (isEditMode && propertyId) {
        response = await updateProperty(propertyId, payload);
        console.log("Property updated successfully:", response);
      } else {
        response = await createProperty(payload);
        console.log("Property created successfully:", response);
      }

      setSuccess(true);

      setTimeout(() => {
        window.location.href = "/my-properties";
      }, 2000);
    } catch (err) {
      console.error("Failed to save property:", err);
      setError(
        err?.response?.data?.message ||
          `Failed to ${
            isEditMode ? "update" : "create"
          } property. Please try again.`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    setError(null);
    if (currentStep === 1 && !validateStep1()) return;
    if (currentStep === 2 && !validateStep2()) return;
    setCurrentStep((prev) => Math.min(4, prev + 1));
  };

  const handlePrevious = () => {
    setError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const homeSafetyOptions = [
    "Smoke Detector",
    "Carbon Monoxide Detector",
    "Fire Extinguisher",
    "Security System",
    "Door Lock",
  ];
  const bedroomOptions = [
    "King Bed",
    "Queen Bed",
    "Wardrobe",
    "Air Conditioning",
    "Heater",
  ];
  const kitchenOptions = [
    "Refrigerator",
    "Microwave",
    "Oven",
    "Dishwasher",
    "Coffee Maker",
  ];
  const otherOptions = [
    "WiFi",
    "TV",
    "Parking",
    "Gym",
    "Swimming Pool",
    "Garden",
    "Balcony",
  ];

  const renderStep1 = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-bold mb-6">Basic Information</h2>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            Property Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            value={propertyData.title}
            onChange={handleInputChange}
            placeholder="Enter property title"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            name="description"
            value={propertyData.description}
            onChange={handleInputChange}
            placeholder="Describe your property..."
            rows="6"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Property Type <span className="text-red-500">*</span>
            </label>
            <select
              name="propertyType"
              value={propertyData.propertyType}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Type</option>
              <option value="APARTMENT">Apartment</option>
              <option value="HOUSE">House</option>
              <option value="VILLA">Villa</option>
              <option value="ROOM">Room</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Property Status
            </label>
            <select
              name="propertyStatus"
              value={propertyData.propertyStatus}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="AVAILABLE">Available</option>
              <option value="PENDING">Pending</option>
              <option value="RENTED">Rented</option>
              <option value="MAINTENANCE">Maintenance</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Size (m²)</label>
            <div className="relative">
              <Maximize className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="size"
                value={propertyData.size}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Monthly Rent <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <DollarSign className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="monthlyRent"
                value={propertyData.monthlyRent}
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Rental Deposit
            </label>
            <div className="relative">
              <DollarSign className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="rentalDeposit"
                value={propertyData.rentalDeposit}
                onChange={handleInputChange}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Property Label
            </label>
            <select
              name="propertyLabel"
              value={propertyData.propertyLabel}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="NONE">None</option>
              <option value="HOT">Hot</option>
              <option value="NEW">New</option>
              <option value="RECOMMENDED">Recommended</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Bedrooms</label>
            <div className="relative">
              <Bed className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="bedrooms"
                value={propertyData.bedrooms}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bathrooms</label>
            <div className="relative">
              <Bath className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="bathrooms"
                value={propertyData.bathrooms}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Garages</label>
            <div className="relative">
              <Car className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="garages"
                value={propertyData.garages}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Rooms</label>
            <div className="relative">
              <Building className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="number"
                name="rooms"
                value={propertyData.rooms}
                onChange={handleInputChange}
                placeholder="0"
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-bold mb-6">Location Details</h2>

      <div className="space-y-6">
        {/* Google Map */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium">
              <MapIcon className="w-4 h-4 inline mr-1" />
              Select Location on Map (Click or Drag Marker)
            </label>
            <button
              type="button"
              onClick={getCurrentLocation}
              disabled={gettingLocation || !mapsLoaded}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {gettingLocation ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Getting Location...
                </>
              ) : (
                <>
                  <MapPin className="w-4 h-4" />
                  Use My Location
                </>
              )}
            </button>
          </div>
          <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-100">
            <div
              ref={mapRef}
              style={{
                width: "100%",
                height: "400px",
                minHeight: "400px",
              }}
            />
          </div>
          {!mapsLoaded && (
            <div className="text-center py-4 text-gray-500 text-sm">
              Loading map...
            </div>
          )}
          {propertyData.location && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                <strong>Selected coordinates:</strong>
                <code className="ml-2 bg-white px-2 py-1 rounded">
                  {propertyData.location}
                </code>
              </p>
            </div>
          )}
        </div>

        {/* Address Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Province/City <span className="text-red-500">*</span>
            </label>
            <select
              name="province"
              value={propertyData.province}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select Province/City</option>
              {vietnamProvinces.map((prov) => (
                <option key={prov.code} value={prov.name}>
                  {prov.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              District <span className="text-red-500">*</span>
            </label>
            <select
              name="district"
              value={propertyData.district}
              onChange={handleInputChange}
              disabled={!propertyData.province}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select District</option>
              {availableDistricts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Ward</label>
            <select
              name="ward"
              value={propertyData.ward}
              onChange={handleInputChange}
              disabled={!propertyData.district}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Select Ward</option>
              {availableWards.map((ward) => (
                <option key={ward} value={ward}>
                  {ward}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Street</label>
            <input
              type="text"
              name="street"
              value={propertyData.street}
              onChange={handleInputChange}
              placeholder="Enter street name"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">House Number</label>
          <input
            type="text"
            name="houseNumber"
            value={propertyData.houseNumber}
            onChange={handleInputChange}
            placeholder="Enter house number"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Full Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <textarea
              name="fullAddress"
              value={propertyData.fullAddress}
              onChange={handleInputChange}
              placeholder="Auto-filled from address fields above, or enter manually"
              rows="2"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            💡 This field is automatically filled based on the address
            components above
          </p>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6">Amenities</h2>

        <div className="space-y-6">
          <div>
            <h3 className="font-semibold mb-3">Home Safety</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {homeSafetyOptions.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={propertyData.homeSafety.includes(item)}
                    onChange={() => handleAmenityToggle("homeSafety", item)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Bedroom</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {bedroomOptions.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={propertyData.bedroom.includes(item)}
                    onChange={() => handleAmenityToggle("bedroom", item)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Kitchen</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {kitchenOptions.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={propertyData.kitchen.includes(item)}
                    onChange={() => handleAmenityToggle("kitchen", item)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Others</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {otherOptions.map((item) => (
                <label
                  key={item}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={propertyData.others.includes(item)}
                    onChange={() => handleAmenityToggle("others", item)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm">{item}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold mb-6">Property Media</h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-3">
              Upload Images
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              <input
                type="file"
                multiple
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={uploadingImages}
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer ${
                  uploadingImages ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">
                  {uploadingImages
                    ? "Uploading images..."
                    : "Click to upload or drag and drop"}
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, JPEG, WEBP up to 10MB each
                </p>
              </label>
            </div>
          </div>

          {uploadedImages.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-3">
                Uploaded Images ({uploadedImages.length})
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {uploadedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.src =
                          "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect fill='%23ddd' width='100' height='100'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999'%3EImage%3C/text%3E%3C/svg%3E";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep4 = () => (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-bold mb-6">Review Your Listing</h2>

      <div className="space-y-6">
        <div className="border-b pb-4">
          <h3 className="font-semibold text-lg mb-3">Basic Information</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <InfoRow label="Title" value={propertyData.title} />
            <InfoRow label="Type" value={propertyData.propertyType} />
            <InfoRow
              label="Monthly Rent"
              value={`${propertyData.monthlyRent || "0"}`}
            />
            <InfoRow label="Status" value={propertyData.propertyStatus} />
            <InfoRow label="Bedrooms" value={propertyData.bedrooms || "0"} />
            <InfoRow label="Bathrooms" value={propertyData.bathrooms || "0"} />
          </div>
        </div>

        <div className="border-b pb-4">
          <h3 className="font-semibold text-lg mb-3">Location</h3>
          <p className="text-sm text-gray-700">
            {propertyData.fullAddress || "No address provided"}
          </p>
          <p className="text-sm text-gray-600 mt-1">
            {propertyData.ward && `${propertyData.ward}, `}
            {propertyData.district && `${propertyData.district}, `}
            {propertyData.province}
          </p>
          {propertyData.location && (
            <p className="text-sm text-gray-500 mt-1 flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              Coordinates: {propertyData.location}
            </p>
          )}
        </div>

        <div className="border-b pb-4">
          <h3 className="font-semibold text-lg mb-3">Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {[
              ...propertyData.homeSafety,
              ...propertyData.bedroom,
              ...propertyData.kitchen,
              ...propertyData.others,
            ].map((amenity, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-medium"
              >
                {amenity}
              </span>
            ))}
            {[
              ...propertyData.homeSafety,
              ...propertyData.bedroom,
              ...propertyData.kitchen,
              ...propertyData.others,
            ].length === 0 && (
              <span className="text-gray-500 text-sm">
                No amenities selected
              </span>
            )}
          </div>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">Media</h3>
          {uploadedImages.length > 0 ? (
            <div className="grid grid-cols-4 gap-3">
              {uploadedImages.slice(0, 8).map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={`Property ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200"
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No images uploaded</p>
          )}
          {uploadedImages.length > 8 && (
            <p className="text-sm text-gray-600 mt-2">
              +{uploadedImages.length - 8} more images
            </p>
          )}
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-gray-700">
            <strong>Note:</strong> Please review all information carefully
            before submitting.
            {isEditMode
              ? " Your changes will update the existing property."
              : " Once submitted, your property will be reviewed by our team."}
          </p>
        </div>
      </div>
    </div>
  );

  if (loading && isEditMode && !propertyData.title) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <Sidebar
          activeMenu={activeMenu}
          setActiveMenu={setActiveMenu}
          sidebarOpen={sidebarOpen}
        />
        <div
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0"
          }`}
        >
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          <div className="p-8 w-full">
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Loading property data...</p>
            </div>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="p-8 w-full">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-green-800">Success!</h3>
                <p className="text-sm text-green-700">
                  Property {isEditMode ? "updated" : "created"} successfully.
                  Redirecting...
                </p>
              </div>
            </div>
          )}

          {/* Progress Indicator */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="relative mb-4">
              <div className="grid grid-cols-4 relative z-10">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex justify-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                        currentStep >= step
                          ? "bg-blue-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {step}
                    </div>
                  </div>
                ))}
              </div>

              <div className="absolute left-[12.5%] right-[12.5%] top-[20px] h-1 bg-gray-200"></div>

              <div
                className="absolute left-[12.5%] top-[20px] h-1 bg-blue-600 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / 3) * 75}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-4 text-center text-sm mt-2">
              <span
                className={
                  currentStep >= 1
                    ? "text-blue-600 font-medium"
                    : "text-gray-500"
                }
              >
                Basic Info
              </span>
              <span
                className={
                  currentStep >= 2
                    ? "text-blue-600 font-medium"
                    : "text-gray-500"
                }
              >
                Location
              </span>
              <span
                className={
                  currentStep >= 3
                    ? "text-blue-600 font-medium"
                    : "text-gray-500"
                }
              >
                Details & Media
              </span>
              <span
                className={
                  currentStep >= 4
                    ? "text-blue-600 font-medium"
                    : "text-gray-500"
                }
              >
                Review
              </span>
            </div>
          </div>

          {/* Step Content */}
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                currentStep === 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Previous
            </button>

            {currentStep < 4 ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {isEditMode ? "Updating..." : "Submitting..."}
                  </>
                ) : (
                  <>
                    <Building className="w-5 h-5" />
                    {isEditMode ? "Update Property" : "Submit Property"}
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div>
    <span className="text-gray-600">{label}:</span>{" "}
    <span className="font-medium">{value || "N/A"}</span>
  </div>
);

export default AddProperty;
