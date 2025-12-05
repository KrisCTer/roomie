import React, { useState, useEffect } from "react";
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

const AddProperty = () => {
  const [activeMenu, setActiveMenu] = useState("Add Property");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [propertyId, setPropertyId] = useState(null);

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

      // Handle response structure
      const property =
        response?.result ||
        response?.data?.result ||
        response?.data ||
        response;

      if (property) {
        // Map property data to form state
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

        // Load existing images
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
          const response = await uploadFile(file);
          return {
            url: response.result?.publicUrl || URL.createObjectURL(file),
            type: "IMAGE",
            fileId: response.result?.fileId,
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
        setError(
          `${files.length - successfulUploads.length} image(s) failed to upload`
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
    if (!propertyData.fullAddress.trim()) {
      setError("Full address is required");
      return false;
    }
    if (!propertyData.province.trim()) {
      setError("Province is required");
      return false;
    }
    if (!propertyData.district.trim()) {
      setError("District is required");
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
        <div>
          <label className="block text-sm font-medium mb-2">
            Full Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              name="fullAddress"
              value={propertyData.fullAddress}
              onChange={handleInputChange}
              placeholder="Enter complete address"
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Province/City <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="province"
              value={propertyData.province}
              onChange={handleInputChange}
              placeholder="Enter province"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              District <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="district"
              value={propertyData.district}
              onChange={handleInputChange}
              placeholder="Enter district"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Ward</label>
            <input
              type="text"
              name="ward"
              value={propertyData.ward}
              onChange={handleInputChange}
              placeholder="Enter ward"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              House Number
            </label>
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
              Location Coordinates (lat, lng)
            </label>
            <input
              type="text"
              name="location"
              value={propertyData.location}
              onChange={handleInputChange}
              placeholder="10.7731, 106.6798"
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
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
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
                disabled={uploadingImages}
              />
              <label
                htmlFor="image-upload"
                className={`cursor-pointer ${
                  uploadingImages ? "opacity-50" : ""
                }`}
              >
                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-2">
                  {uploadingImages
                    ? "Uploading..."
                    : "Click to upload or drag and drop"}
                </p>
                <p className="text-sm text-gray-500">
                  PNG, JPG, JPEG up to 10MB
                </p>
              </label>
            </div>
          </div>

          {uploadedImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {uploadedImages.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.url}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
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
              {uploadedImages.slice(0, 4).map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={`Property ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg"
                />
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No images uploaded</p>
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
