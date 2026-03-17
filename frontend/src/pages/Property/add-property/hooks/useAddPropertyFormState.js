import { useCallback, useEffect, useMemo, useState } from "react";
import {
  createProperty,
  updateProperty,
  getPropertyById,
} from "../../../../services/propertyService.js";
import { uploadFile } from "../../../../services/fileService.js";
import { loadGoogleMaps } from "../../../../utils/googleMapsLoader.js";
import { useRefresh } from "../../../../contexts/RefreshContext";

const REVIEW_IMAGES_PER_PAGE = 8;

const getInitialPropertyData = () => ({
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

const useAddPropertyFormState = () => {
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

  const [mapsLoaded, setMapsLoaded] = useState(false);

  const [propertyData, setPropertyData] = useState(getInitialPropertyData);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [reviewImagePage, setReviewImagePage] = useState(1);

  const { registerRefreshCallback, unregisterRefreshCallback } = useRefresh();

  useEffect(() => {
    fetch("https://provinces.open-api.vn/api/?depth=3")
      .then((res) => res.json())
      .then((data) => {
        setProvinces(data);
      })
      .catch((err) => {
        console.error("Failed to load provinces:", err);
      });
  }, []);

  useEffect(() => {
    if (currentStep !== 2 || mapsLoaded) return;

    loadGoogleMaps(["places"])
      .then(() => setMapsLoaded(true))
      .catch((loadErr) => {
        console.error("Failed to load Google Maps API:", loadErr);
        setError(
          "Google Maps không tải được. Kiểm tra API key, bật billing, và thêm referrer localhost/127.0.0.1.",
        );
      });
  }, [currentStep, mapsLoaded]);

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

  useEffect(() => {
    if (!propertyData.province) return;

    const selected = provinces.find((item) => item.name === propertyData.province);
    setDistricts(selected ? selected.districts : []);
  }, [propertyData.province, provinces]);

  useEffect(() => {
    if (!propertyData.district) return;

    const selectedDistrict = districts.find(
      (item) => item.name === propertyData.district,
    );
    setWards(selectedDistrict ? selectedDistrict.wards : []);
  }, [propertyData.district, districts]);

  const loadPropertyData = useCallback(async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getPropertyById(id);
      const property =
        response?.result ||
        response?.data?.result ||
        response?.data ||
        response;

      if (!property) {
        return;
      }

      setPropertyData({
        title: property.title || "",
        description: property.description || "",
        monthlyRent: property.monthlyRent || "",
        rentalDeposit: property.rentalDeposit || "",
        propertyType: property.propertyType || "",
        propertyStatus: property.propertyStatus || property.status || "AVAILABLE",
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
          })),
        );
      } else {
        setUploadedImages([]);
      }
    } catch (loadErr) {
      console.error("Failed to load property:", loadErr);
      setError(
        loadErr?.response?.data?.message ||
          "Failed to load property data. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    if (isEditMode && propertyId) {
      await loadPropertyData(propertyId);
    }
  }, [isEditMode, propertyId, loadPropertyData]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const editId = urlParams.get("edit");

    if (editId) {
      setIsEditMode(true);
      setPropertyId(editId);
      loadPropertyData(editId);
    }
  }, [loadPropertyData]);

  useEffect(() => {
    if (!isEditMode || !propertyId) return;

    registerRefreshCallback("add-property", refetch);

    return () => {
      unregisterRefreshCallback("add-property");
    };
  }, [
    isEditMode,
    propertyId,
    registerRefreshCallback,
    unregisterRefreshCallback,
    refetch,
  ]);

  useEffect(() => {
    setReviewImagePage(1);
  }, [uploadedImages.length]);

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

          const response = await uploadFile(file);
          const fileData = response?.result || response?.data || response;

          return {
            url: fileData?.publicUrl || fileData?.url || URL.createObjectURL(file),
            type: "IMAGE",
            fileId: fileData?.fileId || fileData?.id,
          };
        } catch (uploadErr) {
          console.error("Failed to upload image:", uploadErr);
          return null;
        }
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      const successfulUploads = uploadedFiles.filter((file) => file !== null);

      setUploadedImages((prev) => [...prev, ...successfulUploads]);

      if (successfulUploads.length < files.length) {
        const failedCount = files.length - successfulUploads.length;
        setError(
          `${failedCount} image(s) failed to upload. Please check file size and format.`,
        );
      }
    } catch (uploadErr) {
      console.error("Upload error:", uploadErr);
      setError("Failed to upload images. Please try again.");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setUploadedImages((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
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
        rooms: propertyData.rooms ? parseInt(propertyData.rooms, 10) : null,
        bedrooms: propertyData.bedrooms
          ? parseInt(propertyData.bedrooms, 10)
          : null,
        bathrooms: propertyData.bathrooms
          ? parseInt(propertyData.bathrooms, 10)
          : null,
        garages: propertyData.garages ? parseInt(propertyData.garages, 10) : null,
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

      if (isEditMode && propertyId) {
        await updateProperty(propertyId, payload);
      } else {
        await createProperty(payload);
      }

      setSuccess(true);

      setTimeout(() => {
        window.location.href = "/my-properties";
      }, 2000);
    } catch (submitErr) {
      console.error("Failed to save property:", submitErr);
      setError(
        submitErr?.response?.data?.message ||
          `Failed to ${
            isEditMode ? "update" : "create"
          } property. Please try again.`,
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

  const totalReviewImagePages = Math.max(
    1,
    Math.ceil(uploadedImages.length / REVIEW_IMAGES_PER_PAGE),
  );

  const currentReviewImages = useMemo(() => {
    const start = (reviewImagePage - 1) * REVIEW_IMAGES_PER_PAGE;
    const end = start + REVIEW_IMAGES_PER_PAGE;
    return uploadedImages.slice(start, end);
  }, [uploadedImages, reviewImagePage]);

  const goToNextReviewImagePage = () => {
    setReviewImagePage((prev) => Math.min(totalReviewImagePages, prev + 1));
  };

  const goToPreviousReviewImagePage = () => {
    setReviewImagePage((prev) => Math.max(1, prev - 1));
  };

  return {
    activeMenu,
    setActiveMenu,
    sidebarOpen,
    setSidebarOpen,
    currentStep,
    loading,
    error,
    setError,
    success,
    isEditMode,
    propertyData,
    provinces,
    districts,
    wards,
    mapsLoaded,
    uploadedImages,
    uploadingImages,
    currentReviewImages,
    reviewImagePage,
    totalReviewImagePages,
    handleInputChange,
    handleLocationChange,
    handleAmenityToggle,
    handleImageUpload,
    removeImage,
    handleNext,
    handlePrevious,
    handleSubmit,
    goToNextReviewImagePage,
    goToPreviousReviewImagePage,
  };
};

export default useAddPropertyFormState;
