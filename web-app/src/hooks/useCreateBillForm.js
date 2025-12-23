// src/hooks/useCreateBillForm.js
import { useState, useEffect } from "react";
import { createOrUpdateBill, getBillsByContract } from "../services/billing.service";
import { calculateBillTotal } from "../utils/billHelpers";

/**
 * Hook for Create/Update Bill Form
 * 
 * Updated for new backend API:
 * - Backend auto-loads utility config if prices not provided
 * - Backend auto-inherits previous readings if not provided
 * - Only need to send NEW readings and optional overrides
 */
export const useCreateBillForm = (bill, properties, contracts, onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [selectedContract, setSelectedContract] = useState("");
  const [previousBill, setPreviousBill] = useState(null);

  // Form data - simplified for new API
  const [formData, setFormData] = useState({
    contractId: "",
    billingMonth: "",
    monthlyRent: "",
    
    // Only NEW readings are required
    electricityNew: "",
    waterNew: "",
    
    // Optional: Only for FIRST bill or to override
    electricityOld: "",
    waterOld: "",
    
    // Optional: Backend auto-loads from utility config
    electricityUnitPrice: "",
    waterUnitPrice: "",
    internetPrice: "",
    parkingPrice: "",
    cleaningPrice: "",
    maintenancePrice: "",
    
    // Other fees
    otherPrice: "",
    otherDescription: "",
  });

  // Initialize form when editing
  useEffect(() => {
    if (bill) {
      setFormData({
        contractId: bill.contractId || "",
        billingMonth: bill.billingMonth?.substring(0, 7) || "",
        monthlyRent: bill.monthlyRent || "",
        electricityOld: bill.electricityOld || "",
        electricityNew: bill.electricityNew || "",
        electricityUnitPrice: bill.electricityUnitPrice || "",
        waterOld: bill.waterOld || "",
        waterNew: bill.waterNew || "",
        waterUnitPrice: bill.waterUnitPrice || "",
        internetPrice: bill.internetPrice || "",
        parkingPrice: bill.parkingPrice || "",
        cleaningPrice: bill.cleaningPrice || "",
        maintenancePrice: bill.maintenancePrice || "",
        otherPrice: bill.otherPrice || "",
        otherDescription: bill.otherDescription || "",
      });

      const contract = contracts.find((c) => c.id === bill.contractId);
      if (contract) {
        setSelectedProperty(contract.propertyId);
        setSelectedContract(contract.id);
      }
    }
  }, [bill, contracts]);

  // Filter active properties
  const activeProperties = properties.filter((property) =>
    contracts.some(
      (contract) =>
        contract.propertyId === property.propertyId &&
        (contract.status === "ACTIVE" || contract.status === "PENDING_PAYMENT")
    )
  );

  // Filter contracts for selected property
  const availableContracts = selectedProperty
    ? contracts.filter(
        (c) => c.propertyId === selectedProperty
        
      )
    : [];

  // Load previous bill when contract is selected
  useEffect(() => {
    if (selectedContract && !bill) {
      loadPreviousBill(selectedContract);
    }
  }, [selectedContract]);

  const loadPreviousBill = async (contractId) => {
    try {
      const res = await getBillsByContract(contractId);
      if (res?.success && res?.result && res.result.length > 0) {
        const latest = res.result[0];
        setPreviousBill(latest);

        // Show what will be auto-inherited
        setFormData((prev) => ({
          ...prev,
          electricityOld: latest.electricityNew || "",
          waterOld: latest.waterNew || "",
          electricityUnitPrice: latest.electricityUnitPrice || prev.electricityUnitPrice,
          waterUnitPrice: latest.waterUnitPrice || prev.waterUnitPrice,
          internetPrice: latest.internetPrice || prev.internetPrice,
          parkingPrice: latest.parkingPrice || prev.parkingPrice,
          cleaningPrice: latest.cleaningPrice || prev.cleaningPrice,
          maintenancePrice: latest.maintenancePrice || prev.maintenancePrice,
        }));
      }
    } catch (error) {
      console.error("Error loading previous bill:", error);
    }
  };

  const handlePropertyChange = (propertyId) => {
    setSelectedProperty(propertyId);
    setSelectedContract("");
    setPreviousBill(null);

    const property = properties.find((p) => p.propertyId === propertyId);
    if (property) {
      setFormData((prev) => ({
        ...prev,
        monthlyRent: property.monthlyRent || "",
      }));
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const calculateTotal = () => {
    return calculateBillTotal(formData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // Prepare payload for NEW API
      const payload = {
        contractId: selectedContract,
        billingMonth: formData.billingMonth,
        monthlyRent: parseFloat(formData.monthlyRent) || 0,
        
        // Always send NEW readings (required)
        electricityNew: parseFloat(formData.electricityNew) || 0,
        waterNew: parseFloat(formData.waterNew) || 0,
      };

      // Only send OLD readings for first bill
      if (!previousBill && formData.electricityOld) {
        payload.electricityOld = parseFloat(formData.electricityOld) || 0;
      }
      if (!previousBill && formData.waterOld) {
        payload.waterOld = parseFloat(formData.waterOld) || 0;
      }

      // Optional: Send to override auto-loading
      if (formData.electricityUnitPrice) {
        payload.electricityUnitPrice = parseFloat(formData.electricityUnitPrice);
      }
      if (formData.waterUnitPrice) {
        payload.waterUnitPrice = parseFloat(formData.waterUnitPrice);
      }
      if (formData.internetPrice) {
        payload.internetPrice = parseFloat(formData.internetPrice);
      }
      if (formData.parkingPrice) {
        payload.parkingPrice = parseFloat(formData.parkingPrice);
      }
      if (formData.cleaningPrice) {
        payload.cleaningPrice = parseFloat(formData.cleaningPrice);
      }
      if (formData.maintenancePrice) {
        payload.maintenancePrice = parseFloat(formData.maintenancePrice);
      }

      // Other fees
      if (formData.otherPrice) {
        payload.otherPrice = parseFloat(formData.otherPrice);
        payload.otherDescription = formData.otherDescription;
      }

      console.log("Submitting bill payload:", payload);

      const res = await createOrUpdateBill(payload);

      if (res?.success) {
        alert(bill ? "✅ Bill updated successfully!" : "✅ Bill created successfully!");
        onSuccess();
      } else {
        alert("❌ Failed to save bill: " + (res?.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saving bill:", error);
      alert("❌ Error: " + (error?.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    selectedProperty,
    selectedContract,
    previousBill,
    activeProperties,
    availableContracts,
    handlePropertyChange,
    setSelectedContract,
    handleChange,
    calculateTotal,
    handleSubmit,
  };
};