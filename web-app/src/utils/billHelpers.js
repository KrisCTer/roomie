// utils/billHelpers.js

// Format currency to VND
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);
};

// Format date to Vietnamese format
export const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("vi-VN");
};

// Format datetime
export const formatDateTime = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("vi-VN");
};

// Get status configuration
export const getStatusConfig = (status) => {
  const configs = {
    DRAFT: {
      label: "Draft",
      bg: "bg-gray-100",
      text: "text-gray-800",
      badgeBg: "bg-gray-100",
      badgeText: "text-gray-800",
    },
    PENDING: {
      label: "Pending Payment",
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      badgeBg: "bg-yellow-100",
      badgeText: "text-yellow-800",
    },
    PAID: {
      label: "Paid",
      bg: "bg-green-100",
      text: "text-green-800",
      badgeBg: "bg-green-100",
      badgeText: "text-green-800",
    },
    OVERDUE: {
      label: "Overdue",
      bg: "bg-red-100",
      text: "text-red-800",
      badgeBg: "bg-red-100",
      badgeText: "text-red-800",
    },
  };
  return configs[status] || configs.DRAFT;
};

// Calculate bill total
export const calculateBillTotal = (formData) => {
  const electricityAmount =
    (parseFloat(formData.electricityNew || 0) -
      parseFloat(formData.electricityOld || 0)) *
    parseFloat(formData.electricityUnitPrice || 0);

  const waterAmount =
    (parseFloat(formData.waterNew || 0) - parseFloat(formData.waterOld || 0)) *
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

// Get property for contract
export const getPropertyForContract = (contractId, contracts, properties) => {
  const contract = contracts.find((c) => c.id === contractId);
  if (!contract) return null;
  return properties.find((p) => p.propertyId === contract.propertyId);
};

// Get tenant for contract
export const getTenantForContract = (contractId, contracts, tenants) => {
  const contract = contracts.find((c) => c.id === contractId);
  if (!contract) return null;
  return tenants[contract.tenantId];
};
