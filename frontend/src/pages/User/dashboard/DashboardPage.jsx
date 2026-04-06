import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../../components/layout/layoutUser/Sidebar";
import Header from "../../../components/layout/layoutUser/Header";
import Footer from "../../../components/layout/layoutUser/Footer";
import PageTitle from "../../../components/common/PageTitle.jsx";
import QuickActions from "../../../components/domain/dashboard/QuickActions";
import RecentActivity from "../../../components/domain/dashboard/RecentActivity";
import LandlordStats from "../../../components/domain/dashboard/LandlordStats";
import TenantStats from "../../../components/domain/dashboard/TenantStats";
import RevenueChartRecharts from "../../../components/domain/dashboard/RevenueChartRecharts";
import useDashboardData from "../../../hooks/dashboard/useDashboardData";
import { useRole } from "../../../contexts/RoleContext";
import { useRefresh } from "../../../contexts/RefreshContext";
import useDashboardPresentation from "./hooks/useDashboardPresentation";
import DashboardLoadingSkeleton from "./sections/DashboardLoadingSkeleton";
import DashboardInsightSection from "./sections/DashboardInsightSection";
import DashboardActionCenterSection from "./sections/DashboardActionCenterSection";
import "../../../styles/apple-glass-dashboard.css";
import "../../../styles/home-redesign.css";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { activeRole } = useRole();
  const { registerRefreshCallback, unregisterRefreshCallback } = useRefresh();
  const { loading, data, stats, refetch } = useDashboardData(activeRole);

  const {
    sidebarOpen,
    setSidebarOpen,
    activeMenu,
    setActiveMenu,
    visibleActivities,
    hasMoreActivities,
    loadMoreActivities,
    visiblePriorityItems,
    hasMorePriorityItems,
    loadMorePriorityItems,
  } = useDashboardPresentation({ data, activeRole });

  useEffect(() => {
    registerRefreshCallback("dashboard", refetch);
    return () => {
      unregisterRefreshCallback("dashboard");
    };
  }, [registerRefreshCallback, unregisterRefreshCallback, refetch]);

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

  return (
    <div className="home-v2 home-shell-bg min-h-screen">
      <Sidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div
        className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <PageTitle
          title="Bảng điều khiển"
          subtitle="Quản lý vận hành tenant/landlord theo thời gian thực."
        />

        <main className="w-full px-4 pb-8 md:px-8">
          {loading ? (
            <DashboardLoadingSkeleton />
          ) : (
            <>
              <div className="mb-8">
                {activeRole === "landlord" ? (
                  <LandlordStats stats={stats} onStatClick={handleStatClick} />
                ) : (
                  <TenantStats stats={stats} onStatClick={handleStatClick} />
                )}
              </div>

              {activeRole === "landlord" && (
                <div className="mb-8">
                  <RevenueChartRecharts bills={data.bills} loading={loading} />
                </div>
              )}

              <DashboardActionCenterSection
                items={visiblePriorityItems}
                hasMore={hasMorePriorityItems}
                onLoadMore={loadMorePriorityItems}
                onNavigate={(route) => navigate(route)}
              />

              <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <QuickActions role={activeRole} />
                <RecentActivity
                  activities={visibleActivities}
                  loading={loading}
                  hasMore={hasMoreActivities}
                  onLoadMore={loadMoreActivities}
                />
              </div>

              <DashboardInsightSection
                activeRole={activeRole}
                stats={stats}
                onUnpaidClick={() => navigate("/my-bills?status=unpaid")}
              />
            </>
          )}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default DashboardPage;
