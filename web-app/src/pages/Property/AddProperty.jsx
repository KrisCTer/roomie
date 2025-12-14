import React, { useState, useEffect } from "react";
import { Building, CheckCircle, AlertCircle } from "lucide-react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import PageTitle from "../../components/common/PageTitle.jsx";

import {
  createProperty,
  updateProperty,
  getPropertyById,
} from "../../services/property.service.js";
import { uploadFile } from "../../services/file.service.js";

// Import steps
import Step1Basic from "./steps/Step1Basic.jsx";
import Step2Location from "./steps/Step2Location.jsx";
import Step3Amenities from "./steps/Step3Amenities.jsx";
import Step4Review from "./steps/Step4Review.jsx";

// Import data
import {
  homeSafetyOptions,
  bedroomOptions,
  kitchenOptions,
  otherOptions,
} from "../../services/vietnamData.js";

const AddProperty = () => {
  // UI State
  const [activeMenu, setActiveMenu] = useState("Add Property");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [propertyId, setPropertyId] = useState(null);
  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);

  // Map State
  const [mapsLoaded, setMapsLoaded] = useState(false);

  // Form Data
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

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then((res) => res.json())
      .then((data) => {
        setProvinces(data);
      })
      .catch((err) => console.error("Failed to load provinces:", err));
  }, []);

  // Load Google Maps Script
  useEffect(() => {
    const loadGoogleMaps = () => {
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
      const selected = provinces.find((p) => p.name === propertyData.province);

      setDistricts(selected ? selected.districts : []);

      setPropertyData((prev) => ({
        ...prev,
        district: propertyData.district,
        ward: propertyData.ward,
      }));
    }
  }, [propertyData.province, provinces]);

  // Update available wards when district changes
  useEffect(() => {
    if (propertyData.district) {
      const selectedDistrict = districts.find(
        (d) => d.name === propertyData.district
      );

      setWards(selectedDistrict ? selectedDistrict.wards : []);

      setPropertyData((prev) => ({
        ...prev,
        ward: propertyData.ward,
      }));
    }
  }, [propertyData.district, districts]);

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

  const handleLocationChange = (locationStr) => {
    setPropertyData((prev) => ({
      ...prev,
      location: locationStr,
    }));
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
          if (!file.type.startsWith("image/")) {
            console.error("Invalid file type:", file.type);
            return null;
          }

          if (file.size > 10 * 1024 * 1024) {
            console.error("File too large:", file.size);
            return null;
          }

          console.log("Uploading file:", file.name);
          const response = await uploadFile(file);
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

  // Loading state
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
        <PageTitle
          title="Property Form"
          subtitle="Create or update a new property listing"
        />
        <div className="p-8 w-full">
          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
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
          {currentStep === 1 && (
            <Step1Basic
              propertyData={propertyData}
              onInputChange={handleInputChange}
            />
          )}

          {currentStep === 2 && (
            <Step2Location
              propertyData={propertyData}
              onInputChange={handleInputChange}
              provinces={provinces}
              districts={districts}
              wards={wards}
              mapsLoaded={mapsLoaded}
              onLocationChange={handleLocationChange}
              error={error}
              setError={setError}
            />
          )}

          {currentStep === 3 && (
            <Step3Amenities
              propertyData={propertyData}
              onAmenityToggle={handleAmenityToggle}
              uploadedImages={uploadedImages}
              uploadingImages={uploadingImages}
              onImageUpload={handleImageUpload}
              onImageRemove={removeImage}
              homeSafetyOptions={homeSafetyOptions}
              bedroomOptions={bedroomOptions}
              kitchenOptions={kitchenOptions}
              otherOptions={otherOptions}
            />
          )}

          {currentStep === 4 && (
            <Step4Review
              propertyData={propertyData}
              uploadedImages={uploadedImages}
              isEditMode={isEditMode}
            />
          )}

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

export default AddProperty;
