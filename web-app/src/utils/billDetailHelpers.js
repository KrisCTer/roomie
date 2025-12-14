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
      label: "Nháp",
      bg: "bg-gray-100",
      text: "text-gray-800",
    },
    PENDING: {
      label: "Chờ thanh toán",
      bg: "bg-yellow-100",
      text: "text-yellow-800",
    },
    PAID: {
      label: "Đã thanh toán",
      bg: "bg-green-100",
      text: "text-green-800",
    },
    OVERDUE: {
      label: "Quá hạn",
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
      description: "Thanh toán qua VNPay",
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      id: "MOMO",
      name: "MoMo",
      description: "Thanh toán qua ví MoMo",
      color: "text-pink-600",
      bg: "bg-pink-50",
      border: "border-pink-200",
    },
    {
      id: "CASH",
      name: "Tiền mặt",
      description: "Thanh toán trực tiếp bằng tiền mặt",
      color: "text-green-600",
      bg: "bg-green-50",
      border: "border-green-200",
    },
  ];
};