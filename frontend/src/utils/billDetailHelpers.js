// utils/billDetailHelpers.js

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount || 0);
};

export const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleDateString("vi-VN");
};

export const formatDateTime = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("vi-VN");
};

export const getStatusConfig = (status) => {
  const configs = {
    DRAFT: {
      label: "Draft",
      bg: "bg-gray-100",
      text: "text-gray-800",
    },
    PENDING: {
      label: "Pending Payment",
      bg: "bg-yellow-100",
      text: "text-yellow-800",
    },
    PAID: {
      label: "Paid",
      bg: "bg-green-100",
      text: "text-green-800",
    },
    OVERDUE: {
      label: "Overdue",
      bg: "bg-red-100",
      text: "text-red-800",
    },
  };
  return configs[status] || configs.DRAFT;
};

export const getPaymentMethods = () => {
  return [
    {
      id: "VNPAY",
      name: "VNPay",
      description: "Pay via VNPay",
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      id: "MOMO",
      name: "MoMo",
      description: "Pay via MoMo wallet",
      color: "text-pink-600",
      bg: "bg-pink-50",
      border: "border-pink-200",
    },
    {
      id: "CASH",
      name: "Cash",
      description: "Pay in cash",
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
    },
  ];
};
