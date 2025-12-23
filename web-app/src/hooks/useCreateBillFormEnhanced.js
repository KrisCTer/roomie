// src/hooks/useCreateBillFormEnhanced.js
import { useState, useEffect } from "react";
import { createOrUpdateBill } from "../services/billing.service";
import { getActiveUtilityForContract } from "../services/utility.service";
import { getBillsByContract } from "../services/billing.service";

/**
 * Helper: Calculate next month from YYYY-MM string
 */
const getNextMonth = (dateString) => {
  if (!dateString) return '';
  
  const [year, month] = dateString.split('-').map(Number);
  const date = new Date(year, month - 1); // month is 0-indexed
  date.setMonth(date.getMonth() + 1); // Add 1 month
  
  const nextYear = date.getFullYear();
  const nextMonth = String(date.getMonth() + 1).padStart(2, '0');
  
  return `${nextYear}-${nextMonth}`;
};

/**
 * Enhanced Create Bill Form Hook
 * Features:
 * - Auto-loads utility config
 * - Auto-inherits previous meter readings
 * - Auto-increments billing month from previous bill
 * - Smart form initialization
 */
export const useCreateBillFormEnhanced = (bill, properties, contracts, onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(bill?.contractId ? "" : "");
  const [selectedContract, setSelectedContract] = useState(bill?.contractId || "");
  const [previousBill, setPreviousBill] = useState(null);
  const [utilityConfig, setUtilityConfig] = useState(null);

  const [formData, setFormData] = useState({
    contractId: "",
    billingMonth: new Date().toISOString().substring(0, 7), // YYYY-MM
    monthlyRent: 0,
    rentalDeposit: 0,

    electricityOld: 0,
    electricityNew: 0,
    electricityUnitPrice: 3500,

    waterOld: 0,
    waterNew: 0,
    waterUnitPrice: 15000,

    internetPrice: 0,
    parkingPrice: 0,
    cleaningPrice: 0,
    maintenancePrice: 0,

    otherDescription: "",
    otherPrice: 0,

    notes: "",
  });

  // Filter active properties (those with ACTIVE contracts)
  const activeProperties = properties.filter((property) =>
    contracts.some(
      (contract) =>
        contract.propertyId === property.propertyId &&
        (contract.status === "ACTIVE" || contract.status === "PENDING_PAYMENT")
    )
  );

  // Get available contracts for selected property
  const availableContracts = selectedProperty
    ? contracts.filter(
        (c) => c.propertyId === selectedProperty 
      )
    : [];

  // Initialize form with bill data (edit mode)
  useEffect(() => {
    if (bill) {
      const contract = contracts.find((c) => c.id === bill.contractId);
      if (contract) {
        setSelectedProperty(contract.propertyId);
        setSelectedContract(bill.contractId);
      }

      setFormData({
        contractId: bill.contractId,
        billingMonth: bill.billingMonth?.substring(0, 7) || "",
        monthlyRent: bill.monthlyRent || 0,
        rentalDeposit: bill.rentalDeposit || 0,

        electricityOld: bill.electricityOld || 0,
        electricityNew: bill.electricityNew || 0,
        electricityUnitPrice: bill.electricityUnitPrice || 3500,

        waterOld: bill.waterOld || 0,
        waterNew: bill.waterNew || 0,
        waterUnitPrice: bill.waterUnitPrice || 15000,

        internetPrice: bill.internetPrice || 0,
        parkingPrice: bill.parkingPrice || 0,
        cleaningPrice: bill.cleaningPrice || 0,
        maintenancePrice: bill.maintenancePrice || 0,

        otherDescription: bill.otherDescription || "",
        otherPrice: bill.otherPrice || 0,

        notes: bill.notes || "",
      });
    }
  }, [bill, contracts]);

  // Load utility config and previous bill when contract changes
  useEffect(() => {
    if (selectedContract) {
      loadUtilityConfigAndPreviousBill();
    }
  }, [selectedContract]);

  /**
   * Load utility configuration and previous bill
   */
  const loadUtilityConfigAndPreviousBill = async () => {
    try {
      const contract = contracts.find((c) => c.id === selectedContract);
      if (!contract) return;

      console.log("🔍 Loading config for contract:", {
        contractId: contract.id,
        propertyId: contract.propertyId,
      });

      // Load utility config
      const config = await getActiveUtilityForContract(
        contract.id,
        contract.propertyId
      );

      console.log("📦 Loaded utility config:", config);

      if (config) {
        setUtilityConfig(config);

        // Auto-fill prices from utility config
        setFormData((prev) => ({
          ...prev,
          electricityUnitPrice: config.electricityUnitPrice || prev.electricityUnitPrice,
          waterUnitPrice: config.waterUnitPrice || prev.waterUnitPrice,
          internetPrice: config.internetPrice || prev.internetPrice,
          parkingPrice: config.parkingPrice || prev.parkingPrice,
          cleaningPrice: config.cleaningPrice || prev.cleaningPrice,
          maintenancePrice: config.maintenancePrice || prev.maintenancePrice,
        }));

        console.log("✅ Auto-filled prices from utility config");
      } else {
        console.warn("⚠️ No utility config found");
      }

      // Load previous bill for meter readings
      const billsRes = await getBillsByContract(contract.id);
      if (billsRes?.success && billsRes?.result?.length > 0) {
        const bills = billsRes.result;
        // Sort by billing month descending
        bills.sort(
          (a, b) => new Date(b.billingMonth) - new Date(a.billingMonth)
        );
        const latestBill = bills[0];

        console.log("📊 Previous bill found:", latestBill);

        setPreviousBill(latestBill);

        // Auto-fill old readings from previous bill's new readings
        // AND auto-increment billing month
        const nextBillingMonth = getNextMonth(latestBill.billingMonth?.substring(0, 7));
        
        setFormData((prev) => ({
          ...prev,
          billingMonth: bill ? prev.billingMonth : nextBillingMonth, // Only auto-increment for new bills
          electricityOld: latestBill.electricityNew || 0,
          waterOld: latestBill.waterNew || 0,
        }));

        console.log("✅ Auto-filled meter readings and next billing month:", nextBillingMonth);
      } else {
        setPreviousBill(null);
        console.log("ℹ️ No previous bill found (first bill)");
        
        // For first bill, use current month
        if (!bill) {
          setFormData((prev) => ({
            ...prev,
            billingMonth: new Date().toISOString().substring(0, 7),
          }));
        }
      }
    } catch (error) {
      console.error("❌ Error loading utility config/previous bill:", error);
    }
  };

  /**
   * Handle property change
   */
  const handlePropertyChange = (propertyId) => {
    console.log("🏠 Property changed:", propertyId);
    setSelectedProperty(propertyId);
    setSelectedContract(""); // Reset contract selection
    setPreviousBill(null);
    setUtilityConfig(null);

    // Update monthly rent from property
    const property = properties.find((p) => p.propertyId === propertyId);
    if (property) {
      setFormData((prev) => ({
        ...prev,
        monthlyRent: property.monthlyRent || 0,
        rentalDeposit: property.rentalDeposit || 0,
      }));
    }
  };

  /**
   * Handle form field change
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Calculate total amount
   */
  const calculateTotal = () => {
    const electricityAmount =
      (parseFloat(formData.electricityNew || 0) -
        parseFloat(formData.electricityOld || 0)) *
      parseFloat(formData.electricityUnitPrice || 0);

    const waterAmount =
      (parseFloat(formData.waterNew || 0) -
        parseFloat(formData.waterOld || 0)) *
      parseFloat(formData.waterUnitPrice || 0);

    const total =
      parseFloat(formData.monthlyRent || 0) +
      parseFloat(formData.rentalDeposit || 0) +
      electricityAmount +
      waterAmount +
      parseFloat(formData.internetPrice || 0) +
      parseFloat(formData.parkingPrice || 0) +
      parseFloat(formData.cleaningPrice || 0) +
      parseFloat(formData.maintenancePrice || 0) +
      parseFloat(formData.otherPrice || 0);

    return total;
  };

  /**
   * Handle form submit
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        contractId: selectedContract,
      };

      console.log("📤 Submitting bill:", payload);

      const res = await createOrUpdateBill(payload);

      if (res?.success) {
        alert("✅ Lưu hóa đơn thành công!");
        onSuccess();
      } else {
        throw new Error(res?.message || "Failed to save bill");
      }
    } catch (error) {
      console.error("❌ Error saving bill:", error);
      alert("❌ Không thể lưu hóa đơn! Vui lòng thử lại.\n" + error.message);
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
    utilityConfig,
    activeProperties,
    availableContracts,
    handlePropertyChange,
    setSelectedContract,
    handleChange,
    calculateTotal,
    handleSubmit,
  };
};