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
      id: "MOMO",
      name: "MoMo Wallet",
      description: "Thanh toán ngay qua ứng dụng MoMo - Nhanh chóng & An toàn.",
      instructions: "Bạn sẽ được chuyển hướng đến hệ thống thanh toán của MoMo. Vui lòng quét mã QR hoặc đăng nhập để hoàn tất.",
      color: "bg-[#A50064] text-white", // Brand MoMo Pink
      iconColor: "text-[#A50064]",
      bg: "bg-[#fdf2f8]",
      border: "border-[#fbcfe8] hover:border-[#A50064]",
    },
    {
      id: "VNPAY",
      name: "VNPay / Thẻ ATM",
      description: "Thanh toán qua cổng VNPay bằng QR Code hoặc Thẻ Nội Địa.",
      instructions: "Hệ thống sẽ chuyển hướng bạn đến cổng thanh toán VNPay. Hỗ trợ tất cả các ngân hàng Việt Nam.",
      color: "bg-[#1E3A8A] text-white", // Brand VNPay Blue
      iconColor: "text-[#1E3A8A]",
      bg: "bg-[#eff6ff]",
      border: "border-[#dbeafe] hover:border-[#1E3A8A]",
    },
    {
      id: "CASH",
      name: "Tiền mặt",
      description: "Thanh toán trực tiếp cho chủ nhà khi nhận hóa đơn.",
      instructions: "Vui lòng liên hệ trực tiếp với chủ nhà để xác nhận việc thanh toán bằng tiền mặt.",
      color: "bg-[#10B981] text-white", // Green
      iconColor: "text-[#10B981]",
      bg: "bg-[#f0fdf4]",
      border: "border-[#dcfce7] hover:border-[#10B981]",
    },
  ];
};
