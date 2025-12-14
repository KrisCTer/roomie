import {
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  FileText,
} from "lucide-react";

export const getStatusConfig = (status) => {
  const configs = {
    ACTIVE: {
      label: "Đang hiệu lực",
      bg: "bg-green-100",
      text: "text-green-800",
      icon: CheckCircle,
    },
    PENDING_SIGNATURE: {
      label: "Chờ ký",
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      icon: Clock,
    },
    PENDING_PAYMENT: {
      label: "Chờ thanh toán",
      bg: "bg-blue-100",
      text: "text-blue-800",
      icon: DollarSign,
    },
    DRAFT: {
      label: "Bản nháp",
      bg: "bg-gray-100",
      text: "text-gray-800",
      icon: FileText,
    },
    EXPIRED: {
      label: "Đã hết hạn",
      bg: "bg-red-100",
      text: "text-red-800",
      icon: AlertCircle,
    },
    TERMINATED: {
      label: "Đã chấm dứt",
      bg: "bg-red-100",
      text: "text-red-800",
      icon: AlertCircle,
    },
  };
  return configs[status] || configs.DRAFT;
};