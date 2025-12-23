// src/hooks/useCreateBillFormEnhanced.js
import { useState, useEffect } from "react";
import { createBill, updateBill, getBillsByContract } from "../services/billing.service";
import { getActiveUtilityForContract } from "../services/utility.service";
import { getLatestMeterReading } from "../services/meterReading.service";

/**
 * ENHANCED useCreateBillForm Hook
 * ================================
 * Features:
 * 1. ✅ Auto-load utility prices from config (Contract > Property)
 * 2. ✅ Auto-inherit previous meter readings from last bill
 * 3. ✅ Smart bill creation (backend detects existing bills)
 * 4. ✅ Fallback to meter reading if no previous bill
 * 
 * Usage:
 * Replace import in CreateBillModal.jsx:
 * import { useCreateBillForm } from "../../hooks/useCreateBillFormEnhanced";
 */
export const useCreateBillForm = (bill, properties, contracts, onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState("");
  const [selectedContract, setSelectedContract] = useState("");
  const [previousBill, setPreviousBill] = useState(null);
  const [utilityConfig, setUtilityConfig] = useState(null);
  const [autoFillStatus, setAutoFillStatus] = useState({
    utility: false,
    previousBill: false,
    meterReading: false,
  });

  const [formData, setFormData] = useState({
    contractId: "",
    billingMonth: getCurrentMonth(),
    monthlyRent: 0,

    // Electricity
    electricityOld: 0,
    electricityNew: 0,
    electricityUnitPrice: 3500,

    // Water
    waterOld: 0,
    waterNew: 0,
    waterUnitPrice: 15000,

    // Services
    internetPrice: 200000,
    parkingPrice: 100000,
    cleaningPrice: 50000,
    maintenancePrice: 0,

    // Other
    otherPrice: 0,
    otherDescription: "",
  });

  // Filter active properties (those with ACTIVE contracts)
  const activeProperties = properties.filter((property) =>
    contracts.some(
      (c) => c.propertyId === property.propertyId && (c.status === "ACTIVE" || c.status === "PENDING_PAYMENT")
    )
  );

  // Get contracts for selected property
  const availableContracts = selectedProperty
    ? contracts.filter(
        (c) => c.propertyId === selectedProperty 
      )
    : [];

  /**
   * Initialize form for editing
   */
  useEffect(() => {
    if (bill) {
      const contract = contracts.find((c) => c.id === bill.contractId);
      if (contract) {
        setSelectedProperty(contract.propertyId);
        setSelectedContract(bill.contractId);
      }

      setFormData({
        contractId: bill.contractId,
        billingMonth: bill.billingMonth?.substring(0, 7) || getCurrentMonth(),
        monthlyRent: bill.monthlyRent || 0,
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
        otherPrice: bill.otherPrice || 0,
        otherDescription: bill.otherDescription || "",
      });
    }
  }, [bill, contracts]);

  /**
   * When property changes
   */
  const handlePropertyChange = (propertyId) => {
    setSelectedProperty(propertyId);
    setSelectedContract("");
    setPreviousBill(null);
    setUtilityConfig(null);
    setAutoFillStatus({ utility: false, previousBill: false, meterReading: false });

    const property = properties.find((p) => p.propertyId === propertyId);
    if (property) {
      setFormData((prev) => ({
        ...prev,
        monthlyRent: property.monthlyRent || 0,
      }));
    }
  };

  /**
   * When contract changes - AUTO-FILL MAGIC! ✨
   */
  useEffect(() => {
    if (selectedContract && !bill) {
      loadSmartData();
    }
  }, [selectedContract]);

  /**
   * Load smart data:
   * STEP 1: Load Utility Config (prices)
   * STEP 2: Load Previous Bill (old readings)
   * STEP 3: Fallback to Meter Reading (if no previous bill)
   */
  const loadSmartData = async () => {
    try {
      const contract = contracts.find((c) => c.id === selectedContract);
      if (!contract) return;

      console.log("🚀 Auto-fill started for contract:", contract.id);

      // ========== STEP 1: Load Utility Config ==========
      try {
        const config = await getActiveUtilityForContract(
          contract.id,
          contract.propertyId
        );

        if (config) {
          console.log("✅ [1/3] Loaded utility config:", {
            electricity: config.electricityUnitPrice,
            water: config.waterUnitPrice,
            level: config.contractId ? "Contract-level" : "Property-level",
          });

          setUtilityConfig(config);
          setAutoFillStatus((prev) => ({ ...prev, utility: true }));

          setFormData((prev) => ({
            ...prev,
            electricityUnitPrice: config.electricityUnitPrice || 3500,
            waterUnitPrice: config.waterUnitPrice || 15000,
            internetPrice: config.internetPrice || 0,
            parkingPrice: config.parkingPrice || 0,
            cleaningPrice: config.cleaningPrice || 0,
            maintenancePrice: config.maintenancePrice || 0,
          }));
        } else {
          console.log("⚠️ [1/3] No utility config found, using defaults");
        }
      } catch (error) {
        console.error("❌ [1/3] Error loading utility config:", error);
      }

      // ========== STEP 2: Load Previous Bill ==========
      try {
        const billsRes = await getBillsByContract(selectedContract);
        if (billsRes?.success && billsRes?.result?.length > 0) {
          // Sort by billing month (newest first)
          const sortedBills = billsRes.result.sort(
            (a, b) => new Date(b.billingMonth) - new Date(a.billingMonth)
          );

          const latestBill = sortedBills[0];
          console.log("✅ [2/3] Found previous bill:", {
            month: latestBill.billingMonth,
            electricityNew: latestBill.electricityNew,
            waterNew: latestBill.waterNew,
          });

          setPreviousBill(latestBill);
          setAutoFillStatus((prev) => ({ ...prev, previousBill: true }));

          // Calculate next month from previous bill
          const nextMonth = getNextMonth(latestBill.billingMonth);
          console.log("📅 Next billing month calculated:", {
            previousMonth: latestBill.billingMonth?.substring(0, 7),
            nextMonth: nextMonth,
          });

          // Auto-fill old readings from previous bill's NEW readings
          // AND auto-fill billing month to next month
          setFormData((prev) => ({
            ...prev,
            billingMonth: nextMonth,
            electricityOld: latestBill.electricityNew || 0,
            waterOld: latestBill.waterNew || 0,
          }));

          return; // Stop here, we have previous bill
        }

        console.log("⚠️ [2/3] No previous bill found");
      } catch (error) {
        console.error("❌ [2/3] Error loading previous bill:", error);
      }

      // ========== STEP 3: Fallback to Meter Reading ==========
      try {
        const meterRes = await getLatestMeterReading(selectedContract);
        if (meterRes?.success && meterRes?.result) {
          const meter = meterRes.result;
          console.log("✅ [3/3] Found latest meter reading:", {
            month: meter.readingMonth,
            electricity: meter.electricityReading,
            water: meter.waterReading,
          });

          setAutoFillStatus((prev) => ({ ...prev, meterReading: true }));

          setFormData((prev) => ({
            ...prev,
            electricityOld: meter.electricityReading || 0,
            waterOld: meter.waterReading || 0,
          }));
        } else {
          console.log("ℹ️ [3/3] No meter reading found, starting from 0");
        }
      } catch (error) {
        console.log("ℹ️ [3/3] No meter reading available:", error.message);
      }

      console.log("🎉 Auto-fill completed!");
    } catch (error) {
      console.error("❌ Error in loadSmartData:", error);
    }
  };

  /**
   * Handle input change
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
   * Submit form
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        contractId: selectedContract,
        billingMonth: formData.billingMonth, // Convert YYYY-MM to YYYY-MM-01
        monthlyRent: parseFloat(formData.monthlyRent),
        electricityOld: parseFloat(formData.electricityOld),
        electricityNew: parseFloat(formData.electricityNew),
        electricityUnitPrice: parseFloat(formData.electricityUnitPrice),
        waterOld: parseFloat(formData.waterOld),
        waterNew: parseFloat(formData.waterNew),
        waterUnitPrice: parseFloat(formData.waterUnitPrice),
        internetPrice: parseFloat(formData.internetPrice),
        parkingPrice: parseFloat(formData.parkingPrice),
        cleaningPrice: parseFloat(formData.cleaningPrice),
        maintenancePrice: parseFloat(formData.maintenancePrice),
        otherPrice: parseFloat(formData.otherPrice),
        otherDescription: formData.otherDescription,
      };

      console.log("📤 Submitting bill:", payload);

      let res;
      if (bill) {
        // Update existing bill
        res = await updateBill(bill.id, payload);
      } else {
        // Create new bill (backend will auto-detect if bill exists for the month)
        res = await createBill(payload);
      }

      if (res?.success) {
        console.log("✅ Bill saved successfully:", res.result);
        alert(bill ? "✅ Cập nhật hóa đơn thành công!" : "✅ Tạo hóa đơn thành công!");
        onSuccess();
      }
    } catch (error) {
      console.error("❌ Error saving bill:", error);
      alert("❌ Không thể lưu hóa đơn! " + (error?.response?.data?.message || ""));
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
    autoFillStatus,
    activeProperties,
    availableContracts,
    handlePropertyChange,
    setSelectedContract,
    handleChange,
    calculateTotal,
    handleSubmit,
  };
};

/**
 * Get current month in YYYY-MM format
 */
function getCurrentMonth() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Get next month from a given date
 * Input: "2025-12-01" or "2025-12"
 * Output: "2026-01"
 */
function getNextMonth(dateString) {
  if (!dateString) return getCurrentMonth();

  // Extract YYYY-MM part
  const monthPart = dateString.substring(0, 7); // "2025-12"
  const [year, month] = monthPart.split("-").map(Number);

  // Calculate next month
  let nextYear = year;
  let nextMonth = month + 1;

  if (nextMonth > 12) {
    nextMonth = 1;
    nextYear += 1;
  }

  const formattedMonth = String(nextMonth).padStart(2, "0");
  return `${nextYear}-${formattedMonth}`;
}