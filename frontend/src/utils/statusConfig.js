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
      label: "Active",
      bg: "bg-green-100",
      text: "text-green-800",
      icon: CheckCircle,
    },
    PENDING_SIGNATURE: {
      label: "Pending Signature",
      bg: "bg-yellow-100",
      text: "text-yellow-800",
      icon: Clock,
    },
    PENDING_PAYMENT: {
      label: "Pending Payment",
      bg: "bg-blue-100",
      text: "text-blue-800",
      icon: DollarSign,
    },
    DRAFT: {
      label: "Draft",
      bg: "bg-gray-100",
      text: "text-gray-800",
      icon: FileText,
    },
    EXPIRED: {
      label: "Expired",
      bg: "bg-red-100",
      text: "text-red-800",
      icon: AlertCircle,
    },
    TERMINATED: {
      label: "Terminated",
      bg: "bg-red-100",
      text: "text-red-800",
      icon: AlertCircle,
    },
  };
  return configs[status] || configs.DRAFT;
};
