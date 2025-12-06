import React, { useState, useEffect } from "react";
import {
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Calendar,
  Home,
  User,
  Download,
  PenTool,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";

import { getMyContracts } from "../../services/contract.service";
import { getPropertyById } from "../../services/property.service";
import { getUserProfile } from "../../services/user.service";

// ========== CONTRACT CARD COMPONENT ==========
const ContractCard = ({ contract, role, onClick, propertyData, userData }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "ACTIVE":
        return {
          label: "Đang hiệu lực",
          bgColor: "bg-green-100",
          textColor: "text-green-800",
          icon: CheckCircle,
          iconColor: "text-green-600",
        };
      case "PENDING_SIGNATURE":
        return {
          label: "Chờ ký",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-800",
          icon: Clock,
          iconColor: "text-yellow-600",
        };
      case "PENDING_PAYMENT":
        return {
          label: "Chờ thanh toán",
          bgColor: "bg-blue-100",
          textColor: "text-blue-800",
          icon: Clock,
          iconColor: "text-blue-600",
        };
      case "EXPIRED":
        return {
          label: "Đã hết hạn",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          icon: AlertCircle,
          iconColor: "text-gray-600",
        };
      case "TERMINATED":
        return {
          label: "Đã chấm dứt",
          bgColor: "bg-red-100",
          textColor: "text-red-800",
          icon: AlertCircle,
          iconColor: "text-red-600",
        };
      case "PAUSED":
        return {
          label: "Tạm dừng",
          bgColor: "bg-orange-100",
          textColor: "text-orange-800",
          icon: AlertCircle,
          iconColor: "text-orange-600",
        };
      case "DRAFT":
        return {
          label: "Bản nháp",
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          icon: FileText,
          iconColor: "text-gray-600",
        };
      default:
        return {
          label: status,
          bgColor: "bg-gray-100",
          textColor: "text-gray-800",
          icon: AlertCircle,
          iconColor: "text-gray-600",
        };
    }
  };

  const statusConfig = getStatusConfig(contract.status);
  const StatusIcon = statusConfig.icon;

  // Get property info
  const propertyTitle = propertyData?.title || "Đang tải...";
  const propertyAddress = propertyData?.address?.fullAddress || "Đang tải...";
  const monthlyRent = propertyData?.monthlyRent || 0;
  const rentalDeposit = propertyData?.rentalDeposit || 0;

  // Get other party info based on role
  const otherPartyId =
    role === "landlord" ? contract.tenantId : contract.landlordId;
  const otherPartyData = userData[otherPartyId];
  const otherPartyName = otherPartyData
    ? `${otherPartyData.firstName || ""} ${
        otherPartyData.lastName || ""
      }`.trim() || "N/A"
    : "Đang tải...";
  const otherPartyPhone = otherPartyData?.phoneNumber || "N/A";

  const isSigned =
    role === "landlord" ? contract.landlordSigned : contract.tenantSigned;
  const otherPartySigned =
    role === "landlord" ? contract.tenantSigned : contract.landlordSigned;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-6 cursor-pointer border border-gray-100"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900">{propertyTitle}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-1">{propertyAddress}</p>
          <p className="text-xs text-gray-500">Mã HĐ: {contract.id}</p>
        </div>

        <span
          className={`${statusConfig.bgColor} ${statusConfig.textColor} px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 flex-shrink-0`}
        >
          <StatusIcon className="w-4 h-4" />
          {statusConfig.label}
        </span>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 pb-4 border-b">
        <div>
          <p className="text-xs text-gray-500 mb-1">
            {role === "landlord" ? "Người thuê" : "Chủ nhà"}
          </p>
          <p className="text-sm font-medium text-gray-900">{otherPartyName}</p>
          <p className="text-xs text-gray-600">{otherPartyPhone}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Giá thuê</p>
          <p className="text-sm font-bold text-blue-600">
            {formatCurrency(monthlyRent)}
            <span className="text-xs font-normal text-gray-600">/tháng</span>
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Tiền cọc</p>
          <p className="text-sm font-medium text-gray-900">
            {formatCurrency(rentalDeposit)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 mb-1">Thời hạn</p>
          <p className="text-sm font-medium text-gray-900">
            {formatDate(contract.startDate)}
          </p>
          <p className="text-xs text-gray-600">
            đến {formatDate(contract.endDate)}
          </p>
        </div>
      </div>

      {/* Footer - Signature Status */}
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
              {role === "landlord" ? "Chủ nhà" : "Người thuê"}:{" "}
              {isSigned ? "Đã ký" : "Chưa ký"}
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
              {role === "landlord" ? "Người thuê" : "Chủ nhà"}:{" "}
              {otherPartySigned ? "Đã ký" : "Chưa ký"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {contract.status === "PENDING_SIGNATURE" && !isSigned ? (
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium flex items-center gap-2">
              <PenTool className="w-4 h-4" />
              Ký ngay
            </button>
          ) : (
            <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Xem chi tiết
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// ========== STATS CARD COMPONENT ==========
const StatsCard = ({ icon: Icon, label, value, bgColor, textColor }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 ${bgColor} rounded-lg flex items-center justify-center`}
        >
          <Icon className={`w-6 h-6 ${textColor}`} />
        </div>
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </div>
  );
};

// ========== MAIN COMPONENT ==========
const MyContracts = () => {
  const [activeTab, setActiveTab] = useState("landlord");
  const [contracts, setContracts] = useState({ asLandlord: [], asTenant: [] });
  const [propertyCache, setPropertyCache] = useState({});
  const [userCache, setUserCache] = useState({});
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Contracts");
  const navigate = useNavigate();

  const currentContracts =
    activeTab === "landlord" ? contracts.asLandlord : contracts.asTenant;

  // Fetch contracts and related data
  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);

      // Fetch all contracts
      const res = await getMyContracts();
      console.log("My Contracts Response:", res);

      if (res?.success && res?.result) {
        const allContracts = res.result;
        setContracts(allContracts);

        // Collect unique property and user IDs
        const propertyIds = new Set();
        const userIds = new Set();

        [...allContracts.asLandlord, ...allContracts.asTenant].forEach(
          (contract) => {
            if (contract.propertyId) propertyIds.add(contract.propertyId);
            if (contract.tenantId) userIds.add(contract.tenantId);
            if (contract.landlordId) userIds.add(contract.landlordId);
          }
        );

        // Fetch property data
        const propertyPromises = Array.from(propertyIds).map(async (id) => {
          try {
            const propRes = await getPropertyById(id);
            if (propRes?.success && propRes?.result) {
              return [id, propRes.result];
            }
          } catch (error) {
            console.error(`Error fetching property ${id}:`, error);
          }
          return [id, null];
        });

        const propertyResults = await Promise.all(propertyPromises);
        const propertyMap = Object.fromEntries(
          propertyResults.filter(([_, data]) => data)
        );
        setPropertyCache(propertyMap);

        // Fetch user profiles
        const userPromises = Array.from(userIds).map(async (id) => {
          try {
            const userRes = await getUserProfile(id);
            if (userRes?.success && userRes?.result) {
              return [id, userRes.result];
            }
          } catch (error) {
            console.error(`Error fetching user ${id}:`, error);
          }
          return [id, null];
        });

        const userResults = await Promise.all(userPromises);
        const userMap = Object.fromEntries(
          userResults.filter(([_, data]) => data)
        );
        setUserCache(userMap);
      }
    } catch (err) {
      console.error("Failed to load contracts:", err);
      alert("Không thể tải danh sách hợp đồng. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (contractList) => {
    return {
      total: contractList.length,
      active: contractList.filter((c) => c.status === "ACTIVE").length,
      pending: contractList.filter(
        (c) =>
          c.status === "PENDING_SIGNATURE" || c.status === "PENDING_PAYMENT"
      ).length,
      expired: contractList.filter((c) => c.status === "EXPIRED").length,
    };
  };

  const stats = calculateStats(currentContracts);

  const handleContractClick = (contract) => {
    navigate(`/contract-signing/${contract.id}`, { state: { contract } });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="p-6">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setActiveTab("landlord")}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors relative ${
                  activeTab === "landlord"
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <Home className="w-5 h-5" />
                  <span>Với vai trò Chủ nhà</span>
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                    {contracts.asLandlord.length}
                  </span>
                </div>
                {activeTab === "landlord" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
              </button>

              <button
                onClick={() => setActiveTab("tenant")}
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors relative ${
                  activeTab === "tenant"
                    ? "text-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <User className="w-5 h-5" />
                  <span>Với vai trò Người thuê</span>
                  <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 text-xs rounded-full">
                    {contracts.asTenant.length}
                  </span>
                </div>
                {activeTab === "tenant" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"></div>
                )}
              </button>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-pulse" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Đang tải hợp đồng...
              </h3>
            </div>
          ) : (
            <>
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <StatsCard
                  icon={FileText}
                  label="Tổng hợp đồng"
                  value={stats.total}
                  bgColor="bg-blue-100"
                  textColor="text-blue-600"
                />
                <StatsCard
                  icon={CheckCircle}
                  label="Đang hiệu lực"
                  value={stats.active}
                  bgColor="bg-green-100"
                  textColor="text-green-600"
                />
                <StatsCard
                  icon={Clock}
                  label="Chờ xử lý"
                  value={stats.pending}
                  bgColor="bg-yellow-100"
                  textColor="text-yellow-600"
                />
                <StatsCard
                  icon={AlertCircle}
                  label="Đã hết hạn"
                  value={stats.expired}
                  bgColor="bg-gray-100"
                  textColor="text-gray-600"
                />
              </div>

              {/* Contracts List */}
              <div className="space-y-4">
                {currentContracts.length > 0 ? (
                  currentContracts.map((contract) => (
                    <ContractCard
                      key={contract.id}
                      contract={contract}
                      role={activeTab}
                      onClick={() => handleContractClick(contract)}
                      propertyData={propertyCache[contract.propertyId]}
                      userData={userCache}
                    />
                  ))
                ) : (
                  <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      Chưa có hợp đồng nào
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {activeTab === "landlord"
                        ? "Bạn chưa có hợp đồng nào với vai trò chủ nhà"
                        : "Bạn chưa có hợp đồng thuê nào"}
                    </p>
                    <button
                      onClick={() =>
                        navigate(
                          activeTab === "landlord" ? "/my-properties" : "/"
                        )
                      }
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      {activeTab === "landlord"
                        ? "Xem bất động sản của bạn"
                        : "Tìm nhà thuê"}
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <Footer />
      </div>
    </div>
  );
};

export default MyContracts;
