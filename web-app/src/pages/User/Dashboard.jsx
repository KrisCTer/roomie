// src/pages/User/Dashboard/Dashboard.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

// Layout
import Sidebar from "../../components/layout/layoutUser/Sidebar";
import Header from "../../components/layout/layoutUser/Header";
import Footer from "../../components/layout/layoutUser/Footer";

// Components
import RoleToggle from "../../components/Dashboard/RoleToggle";
import QuickActions from "../../components/Dashboard/QuickActions";
import RecentActivity from "../../components/Dashboard/RecentActivity";
import LandlordStats from "../../components/Dashboard/LandlordStats";
import TenantStats from "../../components/Dashboard/TenantStats";
import RevenueChartRecharts from "../../components/Dashboard/RevenueChartRecharts";
import PageTitle from "../../components/common/PageTitle.jsx";

// Hooks
import useDashboardData from "../../hooks/useDashboardData";

// Icons
import { RefreshCw, TrendingUp, AlertCircle } from "lucide-react";

const Dashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Dashboards");
  const [activeRole, setActiveRole] = useState("landlord");

  const { loading, data, stats, refetch } = useDashboardData(activeRole);

  // ==========================================
  // GENERATE MONTHLY REVENUE DATA
  // ==========================================
  const monthlyRevenueData = useMemo(() => {
    if (activeRole !== "landlord") return [];

    // Generate data from contracts and properties
    return generateMonthlyRevenue(
      data.properties,
      data.contracts.asLandlord,
      data.bills
    );
  }, [activeRole, data.properties, data.contracts, data.bills]);

  // Handle stat card clicks
  const handleStatClick = (type) => {
    const routeMap = {
      properties: "/my-properties",
      pending: "/my-properties?status=pending",
      rented: "/my-properties?status=rented",
      available: "/my-properties?status=available",
      contracts: "/my-contracts",
      "unpaid-bills": "/my-bills?status=unpaid",
      "paid-bills": "/my-bills?status=paid",
      "active-bookings": "/my-bookings?status=active",
      "pending-bookings": "/my-bookings?status=pending",
      "completed-bookings": "/my-bookings?status=completed",
    };

    if (routeMap[type]) navigate(routeMap[type]);
  };

  // Generate recent activities
  const generateRecentActivities = () => {
    const activities = [];

    if (activeRole === "landlord") {
      data.properties.slice(0, 2).forEach((property) => {
        activities.push({
          type: "property",
          title: property.title,
          description: `Trạng thái: ${
            property.status || property.propertyStatus
          }`,
          time: formatTime(property.createdAt),
        });
      });

      data.contracts.asLandlord.slice(0, 2).forEach((contract) => {
        activities.push({
          type: "contract",
          title: `Hợp đồng #${contract.contractId?.substring(0, 8)}`,
          description: `Trạng thái: ${contract.status}`,
          time: formatTime(contract.createdAt),
        });
      });
    } else {
      data.bookings.slice(0, 2).forEach((booking) => {
        activities.push({
          type: "booking",
          title: `Đặt thuê #${booking.bookingId?.substring(0, 8)}`,
          description: `Trạng thái: ${booking.status}`,
          time: formatTime(booking.createdAt),
        });
      });

      data.bills.slice(0, 2).forEach((bill) => {
        activities.push({
          type: "payment",
          title: `Hóa đơn #${bill.billId?.substring(0, 8)}`,
          description: `${bill.totalAmount?.toLocaleString()}đ - ${
            bill.status
          }`,
          time: formatTime(bill.createdAt),
        });
      });
    }

    return activities.slice(0, 5);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return "Vừa xong";
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    return `${days} ngày trước`;
  };

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
        <PageTitle
          title="Dashboard"
          subtitle="Manage your properties and track your revenue."
        />
        <main className="p-8 w-full">
          {/* Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
            <div className="flex items-center gap-4 mt-4 lg:mt-0">
              <RoleToggle
                activeRole={activeRole}
                onRoleChange={setActiveRole}
              />
              <button
                onClick={refetch}
                disabled={loading}
                className="p-3 bg-slate-800 border border-slate-700 rounded-xl hover:bg-slate-700 transition disabled:opacity-50"
                title="Làm mới dữ liệu"
              >
                <RefreshCw
                  className={`w-5 h-5 text-white ${
                    loading ? "animate-spin" : ""
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700 rounded-xl flex items-center gap-3">
              <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
              <span className="text-blue-400">Đang tải dữ liệu...</span>
            </div>
          )}

          {/* Stats Section */}
          <div className="mb-8">
            {activeRole === "landlord" ? (
              <LandlordStats stats={stats} onStatClick={handleStatClick} />
            ) : (
              <TenantStats stats={stats} onStatClick={handleStatClick} />
            )}
          </div>

          {/* ==========================================
              REVENUE CHART - LANDLORD ONLY
              ========================================== */}
          {activeRole === "landlord" && (
            <div className="mb-8">
              <RevenueChartRecharts
                data={monthlyRevenueData}
                loading={loading}
              />
            </div>
          )}

          {/* Quick Actions & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <QuickActions role={activeRole} />
            <RecentActivity
              activities={generateRecentActivities()}
              loading={loading}
            />
          </div>

          {/* Insights Section */}
          {activeRole === "landlord" && stats.totalProperties > 0 && (
            <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 border border-blue-700/30 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">
                    Thông tin hữu ích
                  </h3>
                  <ul className="space-y-2 text-slate-300">
                    {stats.pendingProperties > 0 && (
                      <li className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-yellow-400" />
                        <span>
                          Bạn có {stats.pendingProperties} bất động sản đang chờ
                          duyệt
                        </span>
                      </li>
                    )}
                    {stats.availableProperties > 0 && (
                      <li className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-green-400" />
                        <span>
                          Bạn có {stats.availableProperties} bất động sản sẵn
                          sàng cho thuê
                        </span>
                      </li>
                    )}
                    {stats.unpaidBills > 0 && (
                      <li className="flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400" />
                        <span>
                          Bạn có {stats.unpaidBills} hóa đơn chưa được thanh
                          toán
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeRole === "tenant" && stats.unpaidBills > 0 && (
            <div className="bg-gradient-to-br from-red-900/20 to-orange-900/20 border border-red-700/30 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-red-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">
                    Cần chú ý!
                  </h3>
                  <p className="text-slate-300">
                    Bạn có {stats.unpaidBills} hóa đơn chưa thanh toán với tổng
                    số tiền{" "}
                    <span className="font-bold text-red-400">
                      {stats.totalBillAmount.toLocaleString()}đ
                    </span>
                  </p>
                  <button
                    onClick={() => navigate("/my-bills?status=unpaid")}
                    className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

// ==========================================
// HELPER: GENERATE MONTHLY REVENUE
// ==========================================
function generateMonthlyRevenue(properties, contracts, bills) {
  const months = [
    "T1",
    "T2",
    "T3",
    "T4",
    "T5",
    "T6",
    "T7",
    "T8",
    "T9",
    "T10",
    "T11",
    "T12",
  ];
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Get last 6 months
  const last6Months = [];
  for (let i = 5; i >= 0; i--) {
    const monthIndex = (currentMonth - i + 12) % 12;
    const year = currentMonth - i < 0 ? currentYear - 1 : currentYear;
    last6Months.push({ month: months[monthIndex], monthIndex, year });
  }

  return last6Months.map(({ month, monthIndex, year }) => {
    // Calculate revenue from active contracts in that month
    const monthRevenue = contracts
      .filter((contract) => {
        if (contract.status !== "ACTIVE" && contract.status !== "COMPLETED")
          return false;
        const startDate = new Date(contract.leaseStart);
        const endDate = new Date(contract.leaseEnd);
        const checkDate = new Date(year, monthIndex, 15); // Mid-month
        return checkDate >= startDate && checkDate <= endDate;
      })
      .reduce((sum, contract) => sum + (contract.monthlyRent || 0), 0);

    // Calculate expenses from bills in that month
    const monthExpenses = bills
      .filter((bill) => {
        const billDate = new Date(bill.createdAt);
        return (
          billDate.getMonth() === monthIndex && billDate.getFullYear() === year
        );
      })
      .reduce((sum, bill) => sum + (bill.totalAmount || 0), 0);

    // Convert to millions for display
    return {
      month,
      revenue: monthRevenue / 1000000,
      expenses: monthExpenses / 1000000,
    };
  });
}

export default Dashboard;
