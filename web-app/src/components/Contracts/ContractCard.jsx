import React from "react";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  PenTool,
  FileText,
  User,
  Phone,
  Mail,
} from "lucide-react";

const ContractCard = ({
  contract,
  role,
  onClick,
  propertyData,
  tenantData,
  landlordData,
  currentUserId,
}) => {
  const formatCurrency = (amount) => {
    if (!amount) return "N/A";
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusConfig = (status) => {
    const configs = {
      ACTIVE: {
        label: "Active",
        bgColor: "bg-green-100",
        textColor: "text-green-800",
        icon: CheckCircle,
        iconColor: "text-green-600",
      },
      PENDING_SIGNATURE: {
        label: "Pending Signature",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-800",
        icon: Clock,
        iconColor: "text-yellow-600",
      },
      PENDING_PAYMENT: {
        label: "Pending Payment",
        bgColor: "bg-blue-100",
        textColor: "text-blue-800",
        icon: Clock,
        iconColor: "text-blue-600",
      },
      EXPIRED: {
        label: "Expired",
        bgColor: "bg-gray-100",
        textColor: "text-gray-800",
        icon: AlertCircle,
        iconColor: "text-gray-600",
      },
      TERMINATED: {
        label: "Terminated",
        bgColor: "bg-red-100",
        textColor: "text-red-800",
        icon: AlertCircle,
        iconColor: "text-red-600",
      },
      PAUSED: {
        label: "Paused",
        bgColor: "bg-orange-100",
        textColor: "text-orange-800",
        icon: AlertCircle,
        iconColor: "text-orange-600",
      },
      DRAFT: {
        label: "Draft",
        bgColor: "bg-gray-100",
        textColor: "text-gray-800",
        icon: FileText,
        iconColor: "text-gray-600",
      },
    };
    return configs[status] || configs.DRAFT;
  };

  const statusConfig = getStatusConfig(contract.status);
  const StatusIcon = statusConfig.icon;

  // Property info
  const propertyTitle = propertyData?.title || "Loading...";
  const propertyAddress = propertyData?.address?.fullAddress || "Loading...";
  const monthlyRent = propertyData?.monthlyRent || 0;
  const rentalDeposit = propertyData?.rentalDeposit || 0;

  // Determine current role
  const isLandlord = contract.landlordId === currentUserId;
  const isTenant = contract.tenantId === currentUserId;

  const otherPartyData = isLandlord ? tenantData : landlordData;
  const otherPartyLabel = isLandlord ? "Tenant" : "Landlord";

  const getFullName = (userData) => {
    if (!userData) return "Loading...";
    const firstName = userData?.firstName || "";
    const lastName = userData?.lastName || "";
    return `${firstName} ${lastName}`.trim() || "N/A";
  };

  const otherPartyName = getFullName(otherPartyData);
  const otherPartyPhone = otherPartyData?.phoneNumber || "N/A";
  const otherPartyEmail = otherPartyData?.email || "N/A";

  // Signature status
  const isSigned =
    role === "landlord" ? contract.landlordSigned : contract.tenantSigned;
  const otherPartySigned =
    role === "landlord" ? contract.tenantSigned : contract.landlordSigned;

  const isPropertyLoading = !propertyData;
  const isUserLoading = !otherPartyData;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 cursor-pointer border border-gray-100 hover:border-blue-200"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {isPropertyLoading ? (
              <span className="animate-pulse bg-gray-200 rounded h-6 w-48 inline-block"></span>
            ) : (
              propertyTitle
            )}
          </h3>

          <p className="text-sm text-gray-600 mb-1">
            {isPropertyLoading ? (
              <span className="animate-pulse bg-gray-200 rounded h-4 w-64 inline-block"></span>
            ) : (
              propertyAddress
            )}
          </p>

          <p className="text-xs text-gray-500">
            Contract ID: {contract.id?.substring(0, 8)}...
          </p>
        </div>

        <span
          className={`${statusConfig.bgColor} ${statusConfig.textColor} px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1`}
        >
          <StatusIcon className="w-4 h-4" />
          {statusConfig.label}
        </span>
      </div>

      {/* Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 pb-4 border-b">
        {/* Other party */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-gray-500" />
            <p className="text-xs font-medium text-gray-700">
              {otherPartyLabel}
            </p>
          </div>

          {isUserLoading ? (
            <div className="space-y-2">
              <div className="animate-pulse bg-gray-200 rounded h-4 w-32"></div>
              <div className="animate-pulse bg-gray-200 rounded h-3 w-24"></div>
            </div>
          ) : (
            <>
              <p className="text-sm font-bold text-gray-900 mb-1">
                {otherPartyName}
              </p>
              <div className="flex items-center gap-1 text-xs text-gray-600 mb-1">
                <Phone className="w-3 h-3" />
                {otherPartyPhone}
              </div>
              <div className="flex items-center gap-1 text-xs text-gray-600">
                <Mail className="w-3 h-3" />
                <span className="truncate">{otherPartyEmail}</span>
              </div>
            </>
          )}
        </div>

        {/* Financial */}
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">💰 Monthly Rent</p>
            {isPropertyLoading ? (
              <div className="animate-pulse bg-gray-200 rounded h-5 w-32"></div>
            ) : (
              <p className="text-sm font-bold text-blue-600">
                {formatCurrency(monthlyRent)}
                <span className="text-xs font-normal text-gray-600">
                  /month
                </span>
              </p>
            )}
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">🏦 Deposit</p>
            {isPropertyLoading ? (
              <div className="animate-pulse bg-gray-200 rounded h-5 w-32"></div>
            ) : (
              <p className="text-sm font-medium text-gray-900">
                {formatCurrency(rentalDeposit)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Lease period */}
      <div className="mb-4 pb-4 border-b">
        <p className="text-xs text-gray-500 mb-2">📅 Lease Period</p>
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-gray-900">
            {formatDate(contract.startDate)}
          </span>
          <span className="text-gray-400">→</span>
          <span className="font-medium text-gray-900">
            {formatDate(contract.endDate)}
          </span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm">
          <div
            className={`flex items-center gap-1.5 ${
              isSigned ? "text-green-600" : "text-gray-400"
            }`}
          >
            {isSigned ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            <span className="font-medium">
              {role === "landlord" ? "Landlord" : "Tenant"}:{" "}
              {isSigned ? "Signed" : "Not signed"}
            </span>
          </div>

          <div
            className={`flex items-center gap-1.5 ${
              otherPartySigned ? "text-green-600" : "text-gray-400"
            }`}
          >
            {otherPartySigned ? (
              <CheckCircle className="w-4 h-4" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            <span className="font-medium">
              {role === "landlord" ? "Tenant" : "Landlord"}:{" "}
              {otherPartySigned ? "Signed" : "Not signed"}
            </span>
          </div>
        </div>

        <div>
          {contract.status === "PENDING_SIGNATURE" && !isSigned ? (
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2">
              <PenTool className="w-4 h-4" />
              Sign Now
            </button>
          ) : (
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" />
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContractCard;
