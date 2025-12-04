import React, { useState } from "react";
import {
  Building,
  Upload,
  Trash2,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Car,
  Calendar,
  Maximize,
  Map as MapIcon,
} from "lucide-react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";

// ========== MAIN ADD PROPERTY COMPONENT ==========
const AddProperty = () => {
  const [activeMenu, setActiveMenu] = useState("Add Property");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [propertyData, setPropertyData] = useState({
    title: "",
    description: "",
    monthlyRent: "",
    rentalDeposit: "",
    propertyType: "",
    propertyStatus: "",
    propertyLabel: "",
    size: "",
    rooms: "",
    bedrooms: "",
    bathrooms: "",
    garages: "",
    rentalType: "",

    // Address
    fullAddress: "",
    province: "",
    district: "",
    ward: "",
    street: "",
    houseNumber: "",
    location: "",

    // Amenities
    homeSafety: [],
    bedroom: [],
    kitchen: [],
    others: [],

    // Media
    mediaList: [],
  });

  const [uploadedImages, setUploadedImages] = useState([]);

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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      url: URL.createObjectURL(file),
      type: "image",
      file,
    }));
    setUploadedImages((prev) => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    console.log("Property Data:", propertyData);
    alert("Property submitted successfully!");
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
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            {/* Step Circles (căn đều, không bị line đè lên) */}
            <div className="relative mb-4">
              <div className="grid grid-cols-4 relative z-10">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className="flex justify-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold
                        ${
                          currentStep >= step
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-500"
                        }
                      `}
                    >
                      {step}
                    </div>
                  </div>
                ))}
              </div>

              {/* BACKGROUND LINE */}
              <div className="absolute left-[12.5%] right-[12.5%] top-[20px] h-1 bg-gray-200"></div>

              {/* ACTIVE LINE */}
              <div
                className="absolute left-[12.5%] top-[20px] h-1 bg-blue-600 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / 3) * 75}%` }}
              ></div>
            </div>

            {/* Labels (thẳng hàng với số, không lệch) */}
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

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold mb-6">Basic Information</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Property Title *
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
                    Description *
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
                      Property Type *
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
                      <option value="CONDO">Condo</option>
                      <option value="STUDIO">Studio</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Size (m²)
                    </label>
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
                      Monthly Rent *
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
                      Price Label
                    </label>
                    <input
                      type="text"
                      name="priceLabel"
                      value={propertyData.priceLabel}
                      onChange={handleInputChange}
                      placeholder="e.g., /month"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
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
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Bedrooms
                    </label>
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
                    <label className="block text-sm font-medium mb-2">
                      Bathrooms
                    </label>
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
                    <label className="block text-sm font-medium mb-2">
                      Garages
                    </label>
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
                    <label className="block text-sm font-medium mb-2">
                      Rooms
                    </label>
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
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold mb-6">Location Details</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Full Address *
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
                      Province/City *
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
                      District *
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
                    <label className="block text-sm font-medium mb-2">
                      Ward
                    </label>
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
                    <label className="block text-sm font-medium mb-2">
                      Street
                    </label>
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
                      Location Coordinates
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={propertyData.location}
                      onChange={handleInputChange}
                      placeholder="lat, lng"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-center h-64">
                  <div className="text-center text-gray-500">
                    <MapIcon className="w-12 h-12 mx-auto mb-2" />
                    <p>Map preview will appear here</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Details & Media */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Amenities */}
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
                            onChange={() =>
                              handleAmenityToggle("homeSafety", item)
                            }
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
                            onChange={() =>
                              handleAmenityToggle("bedroom", item)
                            }
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
                            onChange={() =>
                              handleAmenityToggle("kitchen", item)
                            }
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

              {/* Media Upload */}
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
                      />
                      <label htmlFor="image-upload" className="cursor-pointer">
                        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                        <p className="text-gray-600 mb-2">
                          Click to upload or drag and drop
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
          )}

          {/* Step 4: Review */}
          {currentStep === 4 && (
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold mb-6">Review Your Listing</h2>

              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h3 className="font-semibold text-lg mb-3">
                    Basic Information
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Title:</span>{" "}
                      <span className="font-medium">
                        {propertyData.title || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Type:</span>{" "}
                      <span className="font-medium">
                        {propertyData.propertyType || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Monthly Rent:</span>{" "}
                      <span className="font-medium">
                        ${propertyData.monthlyRent || "0"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Status:</span>{" "}
                      <span className="font-medium">
                        {propertyData.propertyStatus || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Bedrooms:</span>{" "}
                      <span className="font-medium">
                        {propertyData.bedrooms || "0"}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Bathrooms:</span>{" "}
                      <span className="font-medium">
                        {propertyData.bathrooms || "0"}
                      </span>
                    </div>
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
                    <strong>Note:</strong> Please review all information
                    carefully before submitting. Once submitted, your property
                    will be reviewed by our team.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
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
                onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Next Step
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="px-8 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Building className="w-5 h-5" />
                Submit Property
              </button>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default AddProperty;
