import { useState, useEffect } from "react";
import {
  createBill,
  updateBill,
  getBillsByContract,
} from "../services/billing.service";
import { calculateBillTotal } from "../utils/billHelpers";

export const useCreateBillForm = (bill, properties, contracts, onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState(
    bill
      ? contracts.find((c) => c.id === bill.contractId)?.propertyId || ""
      : ""
  );
  const [selectedContract, setSelectedContract] = useState(
    bill?.contractId || ""
  );
  const [previousBill, setPreviousBill] = useState(null);

  const [formData, setFormData] = useState({
    billingMonth: bill?.billingMonth || "",
    rentPrice: bill?.rentPrice || "",
    electricityOld: bill?.electricityOld || "",
    electricityNew: bill?.electricityNew || "",
    electricityUnitPrice: bill?.electricityUnitPrice || "3500",
    waterOld: bill?.waterOld || "",
    waterNew: bill?.waterNew || "",
    waterUnitPrice: bill?.waterUnitPrice || "15000",
    internetPrice: bill?.internetPrice || "200000",
    parkingPrice: bill?.parkingPrice || "100000",
    cleaningPrice: bill?.cleaningPrice || "50000",
    maintenancePrice: bill?.maintenancePrice || "0",
    otherDescription: bill?.otherDescription || "",
    otherPrice: bill?.otherPrice || "0",
  });

  // Filter properties with active contracts
  const activeProperties = properties.filter((p) =>
    contracts.some(
      (c) =>
        c.propertyId === p.propertyId &&
        ["ACTIVE", "PENDING_PAYMENT"].includes(c.status)
    )
  );

  // Available contracts for selected property
  const availableContracts = contracts.filter(
    (c) =>
      c.propertyId === selectedProperty &&
      ["ACTIVE", "PENDING_PAYMENT"].includes(c.status)
  );

  // Load previous bill when contract selected
  useEffect(() => {
    if (selectedContract && !bill) {
      loadPreviousBill();
    }
  }, [selectedContract]);

  const loadPreviousBill = async () => {
    try {
      const res = await getBillsByContract(selectedContract);
      if (res?.success && res?.result && res.result.length > 0) {
        const lastBill = res.result[0];
        setPreviousBill(lastBill);

        // Auto-fill old values from previous bill's new values
        setFormData((prev) => ({
          ...prev,
          electricityOld: lastBill.electricityNew || "",
          waterOld: lastBill.waterNew || "",
        }));
      }
    } catch (error) {
      console.error("Error loading previous bill:", error);
    }
  };

  const handlePropertyChange = (propertyId) => {
    setSelectedProperty(propertyId);
    setSelectedContract("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateTotal = () => {
    return calculateBillTotal(formData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedProperty) {
      alert("Vui lòng chọn bất động sản!");
      return;
    }

    if (!selectedContract) {
      alert("Vui lòng chọn hợp đồng!");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        contractId: selectedContract,
        billingMonth: formData.billingMonth,
        rentPrice: parseFloat(formData.rentPrice),
        electricityOld: parseFloat(formData.electricityOld || 0),
        electricityNew: parseFloat(formData.electricityNew),
        electricityUnitPrice: parseFloat(formData.electricityUnitPrice),
        waterOld: parseFloat(formData.waterOld || 0),
        waterNew: parseFloat(formData.waterNew),
        waterUnitPrice: parseFloat(formData.waterUnitPrice),
        internetPrice: parseFloat(formData.internetPrice || 0),
        parkingPrice: parseFloat(formData.parkingPrice || 0),
        cleaningPrice: parseFloat(formData.cleaningPrice || 0),
        maintenancePrice: parseFloat(formData.maintenancePrice || 0),
        otherDescription: formData.otherDescription,
        otherPrice: parseFloat(formData.otherPrice || 0),
      };

      if (bill) {
        await updateBill(bill.id, payload);
        alert("✅ Cập nhật hóa đơn thành công!");
      } else {
        await createBill(payload);
        alert("✅ Tạo hóa đơn thành công!");
      }

      onSuccess();
    } catch (error) {
      console.error("Error saving bill:", error);
      alert("❌ " + (error?.response?.data?.message || "Có lỗi xảy ra!"));
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