import React, { useEffect, useState } from "react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";

import {
  Home,
  Clock,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  FileText,
} from "lucide-react";

import ListingCard from "../../components/layout/layoutUser/ListingCard.jsx"; // dùng lại card giống MyProperties :contentReference[oaicite:1]{index=1}
import {
  getPropertiesByOwner,
  deleteProperty,
  updateProperty,
} from "../../services/property.service";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Dashboards");
  const [loading, setLoading] = useState(false);

  const [properties, setProperties] = useState([]);

  const [dashboard, setDashboard] = useState({
    totalProperties: 0,
    pending: 0,
    rented: 0,
    incomeEstimate: 0,

    totalContracts: 0,
    activeContracts: 0,
    pendingContracts: 0,
    expiredContracts: 0,

    latestListings: [],
  });

  // ================== LẤY DATA TỪ API (GIỐNG MyProperties) ==================
  const fetchProperties = async () => {
    try {
      setLoading(true);

      const response = await getPropertiesByOwner();
      console.log("Dashboard - API Response:", response);

      let list = [];

      // y hệt MyProperties: response { success, result } :contentReference[oaicite:2]{index=2}
      if (response && response.success && response.result) {
        list = response.result;
      } else if (response && response.data) {
        const data = response.data;
        if (data.result) {
          list = data.result;
        } else if (data.content) {
          list = data.content;
        } else if (Array.isArray(data)) {
          list = data;
        }
      } else if (Array.isArray(response)) {
        list = response;
      }

      setProperties(list);
      computeDashboardFromProperties(list);
    } catch (error) {
      console.error("Error fetching dashboard properties:", error);
    } finally {
      setLoading(false);
    }
  };

  // ================== TÍNH TOÁN SỐ LIỆU TỪ DANH SÁCH PROPERTY ==================
  const computeDashboardFromProperties = (list) => {
    const getStatus = (p) => p.status || p.propertyStatus;

    const total = list.length;
    const pending = list.filter((p) =>
      ["DRAFT", "PENDING"].includes(getStatus(p))
    ).length;
    const rented = list.filter((p) =>
      ["SOLD", "RENTED"].includes(getStatus(p))
    ).length;

    // tạm lấy tổng tiền thuê/tháng của tất cả phòng
    const incomeEstimate = list.reduce(
      (sum, p) => sum + (p.monthlyRent || 0),
      0
    );

    const latestListings = list.slice(0, 3);

    setDashboard((prev) => ({
      ...prev,
      totalProperties: total,
      pending,
      rented,
      incomeEstimate,
      latestListings,
      // các số liệu hợp đồng giữ nguyên = 0, sau này muốn thì thêm API contracts
      totalContracts: prev.totalContracts,
      activeContracts: prev.activeContracts,
      pendingContracts: prev.pendingContracts,
      expiredContracts: prev.expiredContracts,
    }));
  };

  // ================== ACTION GIỐNG MyProperties (Edit/Sold/Delete) ==================
  const handleDelete = async (propertyId) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await deleteProperty(propertyId);
        await fetchProperties();
      } catch (error) {
        console.error("Error deleting property:", error);
        alert("Failed to delete property");
      }
    }
  };

  const handleSold = async (propertyId) => {
    if (window.confirm("Mark this property as sold?")) {
      try {
        await updateProperty(propertyId, { status: "SOLD" });
        await fetchProperties();
        alert("Property marked as sold successfully!");
      } catch (error) {
        console.error("Error updating property:", error);
        alert("Failed to update property status");
      }
    }
  };

  const handleEdit = (propertyId) => {
    window.location.href = `/add-property?edit=${propertyId}`;
  };

  // map dữ liệu Property → props cho ListingCard (copy từ MyProperties, bỏ modal) :contentReference[oaicite:3]{index=3}
  const transformPropertyToListing = (property) => {
    const formatDate = (dateString) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    const getStatusText = (status) => {
      const statusMap = {
        DRAFT: "Pending",
        PENDING: "Pending",
        APPROVED: "Approved",
        AVAILABLE: "Approved",
        SOLD: "Sold",
        RENTED: "Sold",
      };
      return statusMap[status] || "Pending";
    };

    return {
      id: property.propertyId,
      image:
        property.mediaList?.[0]?.url ||
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400",
      title: property.title,
      date: formatDate(property.createdAt),
      price: `${property.monthlyRent?.toLocaleString()} VND`,
      status: getStatusText(property.status || property.propertyStatus),
      onEdit: () => handleEdit(property.propertyId),
      onSold: () => handleSold(property.propertyId),
      onDelete: () => handleDelete(property.propertyId),
      onClick: () => {}, // Dashboard chỉ xem nhanh, không mở modal
    };
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // ================== UI (GIỮ NGUYÊN BỐ CỤC) ==================
  return (
    <div className="flex min-h-screen bg-gray-900">
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

        <main className="p-8 w-full">
          <h1 className="text-3xl font-bold text-white mb-2">
            Dashboard chủ nhà
          </h1>
          <p className="text-gray-300 mb-6">
            Tổng quan về bất động sản, hợp đồng và tình hình cho thuê của bạn.
          </p>

          {/* Hàng 1: thống kê bất động sản */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Tổng số bất động sản */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Home className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-300 mb-1">
                  Tổng số bất động sản
                </p>
                <p className="text-2xl font-semibold text-white">
                  {dashboard.totalProperties}
                </p>
              </div>
            </div>

            {/* Chờ duyệt */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-300 mb-1">Chờ duyệt</p>
                <p className="text-2xl font-semibold text-white">
                  {dashboard.pending}
                </p>
              </div>
            </div>

            {/* Đang cho thuê */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-300 mb-1">Đang cho thuê</p>
                <p className="text-2xl font-semibold text-white">
                  {dashboard.rented}
                </p>
              </div>
            </div>

            {/* Thu nhập ước tính / tháng */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-300 mb-1">
                  Thu nhập ước tính / tháng
                </p>
                <p className="text-2xl font-semibold text-white">
                  {dashboard.incomeEstimate.toLocaleString()} đ
                </p>
              </div>
            </div>
          </div>

          {/* Hàng 2: thống kê hợp đồng (tạm thời = 0, chỉ hiển thị) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-300 mb-1">
                  Tổng số hợp đồng
                </p>
                <p className="text-2xl font-semibold text-white">
                  {dashboard.totalContracts}
                </p>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-300 mb-1">
                  Hợp đồng hiệu lực
                </p>
                <p className="text-2xl font-semibold text-white">
                  {dashboard.activeContracts}
                </p>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-300 mb-1">
                  Hợp đồng chờ ký
                </p>
                <p className="text-2xl font-semibold text-white">
                  {dashboard.pendingContracts}
                </p>
              </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-5 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-300 mb-1">Hết hạn / Hủy</p>
                <p className="text-2xl font-semibold text-white">
                  {dashboard.expiredContracts}
                </p>
              </div>
            </div>
          </div>

          {/* Bất động sản mới nhất */}
          <div className="bg-slate-800 p-6 rounded-xl shadow-sm mb-6">
            <h2 className="text-xl font-bold text-white mb-4">
              Bất động sản mới nhất
            </h2>

            {loading ? (
              <p className="text-gray-300">Đang tải dữ liệu...</p>
            ) : dashboard.latestListings.length === 0 ? (
              <p className="text-gray-300">Không có dữ liệu</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {dashboard.latestListings.map((property) => (
                  <ListingCard
                    key={property.propertyId}
                    listing={transformPropertyToListing(property)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default Dashboard;