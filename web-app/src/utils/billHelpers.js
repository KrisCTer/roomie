// src/utils/billHelpers.js

/**
 * Format currency in Vietnamese format
 */
export const formatCurrency = (value) => {
  if (value == null || value === "") return "0 đ";

  const numValue = typeof value === "string" ? parseFloat(value) : value;

  if (isNaN(numValue)) return "0 đ";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numValue);
};

/**
 * Format date
 */
export const formatDate = (dateString) => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(date);
  } catch (error) {
    return "N/A";
  }
};

/**
 * Get status configuration (color, label, etc.)
 */
export const getStatusConfig = (status) => {
  const configs = {
    DRAFT: {
      label: "Nháp",
      bg: "bg-gray-100",
      text: "text-gray-700",
      badge: "bg-gray-500",
    },
    PENDING: {
      label: "Chờ thanh toán",
      bg: "bg-yellow-100",
      text: "text-yellow-700",
      badge: "bg-yellow-500",
    },
    PAID: {
      label: "Đã thanh toán",
      bg: "bg-green-100",
      text: "text-green-700",
      badge: "bg-green-500",
    },
    OVERDUE: {
      label: "Quá hạn",
      bg: "bg-red-100",
      text: "text-red-700",
      badge: "bg-red-500",
    },
  };

  return configs[status] || configs.DRAFT;
};

/**
 * Check if bill is overdue
 */
export const isBillOverdue = (bill) => {
  if (!bill || !bill.dueDate) return false;
  if (bill.status === "PAID") return false;

  const dueDate = new Date(bill.dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return dueDate < today;
};

/**
 * Calculate days until due date
 */
export const daysUntilDue = (dueDate) => {
  if (!dueDate) return null;

  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const diffTime = due - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

/**
 * Get days until due text
 */
export const getDaysUntilDueText = (dueDate) => {
  const days = daysUntilDue(dueDate);

  if (days === null) return "";
  if (days < 0) return `Quá hạn ${Math.abs(days)} ngày`;
  if (days === 0) return "Hết hạn hôm nay";
  if (days === 1) return "Còn 1 ngày";
  return `Còn ${days} ngày`;
};

/**
 * Calculate statistics from bills
 */
export const calculateBillStats = (bills) => {
  const stats = {
    total: bills.length,
    draft: 0,
    pending: 0,
    paid: 0,
    overdue: 0,
    totalAmount: 0,
    totalPending: 0,
    totalPaid: 0,
  };

  bills.forEach((bill) => {
    // Count by status
    if (bill.status === "DRAFT") stats.draft++;
    else if (bill.status === "PENDING") stats.pending++;
    else if (bill.status === "PAID") stats.paid++;
    else if (bill.status === "OVERDUE") stats.overdue++;

    // Sum amounts
    const amount = parseFloat(bill.totalAmount) || 0;
    stats.totalAmount += amount;

    if (bill.status === "PAID") {
      stats.totalPaid += amount;
    } else if (bill.status === "PENDING" || bill.status === "OVERDUE") {
      stats.totalPending += amount;
    }
  });

  return stats;
};

/**
 * Filter bills by criteria
 */
export const filterBills = (bills, filters) => {
  let filtered = [...bills];

  // Filter by status
  if (filters.status && filters.status !== "") {
    filtered = filtered.filter((bill) => bill.status === filters.status);
  }

  // Filter by property
  if (filters.propertyId && filters.propertyId !== "") {
    filtered = filtered.filter((bill) => {
      // Assuming bill has propertyId or contractId that can be matched
      return bill.propertyId === filters.propertyId;
    });
  }

  // Filter by contract
  if (filters.contractId && filters.contractId !== "") {
    filtered = filtered.filter((bill) => bill.contractId === filters.contractId);
  }

  // Filter by date range
  if (filters.fromDate) {
    const from = new Date(filters.fromDate);
    filtered = filtered.filter((bill) => {
      const billDate = new Date(bill.billingMonth);
      return billDate >= from;
    });
  }

  if (filters.toDate) {
    const to = new Date(filters.toDate);
    filtered = filtered.filter((bill) => {
      const billDate = new Date(bill.billingMonth);
      return billDate <= to;
    });
  }

  // Search by bill ID
  if (filters.searchTerm && filters.searchTerm !== "") {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter((bill) =>
      bill.id.toLowerCase().includes(term)
    );
  }

  return filtered;
};

/**
 * Sort bills
 */
export const sortBills = (bills, sortBy = "billingMonth", sortOrder = "desc") => {
  const sorted = [...bills];

  sorted.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle dates
    if (sortBy === "billingMonth" || sortBy === "dueDate" || sortBy === "createdAt") {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    // Handle numbers
    if (sortBy === "totalAmount") {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    }

    if (sortOrder === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return sorted;
};

/**
 * Group bills by month
 */
export const groupBillsByMonth = (bills) => {
  const grouped = {};

  bills.forEach((bill) => {
    const month = formatDate(bill.billingMonth).substring(3); // Get MM/YYYY
    if (!grouped[month]) {
      grouped[month] = [];
    }
    grouped[month].push(bill);
  });

  return grouped;
};

/**
 * Get billing month options for select dropdown
 */
export const getBillingMonthOptions = (months = 12) => {
  const options = [];
  const today = new Date();

  for (let i = 0; i < months; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    const value = date.toISOString().substring(0, 7); // YYYY-MM
    const label = new Intl.DateTimeFormat("vi-VN", {
      year: "numeric",
      month: "long",
    }).format(date);

    options.push({ value, label });
  }

  return options;
};

/**
 * Validate bill data
 */
export const validateBillData = (formData) => {
  const errors = {};

  // Required fields
  if (!formData.contractId) {
    errors.contractId = "Vui lòng chọn hợp đồng";
  }

  if (!formData.billingMonth) {
    errors.billingMonth = "Vui lòng chọn tháng thanh toán";
  }

  // Meter readings
  if (parseFloat(formData.electricityNew) < parseFloat(formData.electricityOld)) {
    errors.electricityNew = "Chỉ số mới phải lớn hơn chỉ số cũ";
  }

  if (parseFloat(formData.waterNew) < parseFloat(formData.waterOld)) {
    errors.waterNew = "Chỉ số mới phải lớn hơn chỉ số cũ";
  }

  // Prices must be positive
  if (parseFloat(formData.electricityUnitPrice) < 0) {
    errors.electricityUnitPrice = "Giá điện phải là số dương";
  }

  if (parseFloat(formData.waterUnitPrice) < 0) {
    errors.waterUnitPrice = "Giá nước phải là số dương";
  }

  return errors;
};

/**
 * Export utility
 */
export const exportBillsToCSV = (bills) => {
  if (bills.length === 0) return;

  // Create CSV header
  const header = [
    "Bill ID",
    "Contract ID",
    "Billing Month",
    "Due Date",
    "Total Amount",
    "Status",
  ].join(",");

  // Create CSV rows
  const rows = bills.map((bill) =>
    [
      bill.id,
      bill.contractId,
      formatDate(bill.billingMonth),
      formatDate(bill.dueDate),
      bill.totalAmount,
      bill.status,
    ].join(",")
  );

  // Combine
  const csv = [header, ...rows].join("\n");

  // Download
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `bills_export_${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
};

export default {
  formatCurrency,
  formatDate,
  getStatusConfig,
  isBillOverdue,
  daysUntilDue,
  getDaysUntilDueText,
  calculateBillStats,
  filterBills,
  sortBills,
  groupBillsByMonth,
  getBillingMonthOptions,
  validateBillData,
  exportBillsToCSV,
};