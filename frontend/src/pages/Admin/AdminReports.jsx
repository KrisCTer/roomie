/* SEO_META: title="Roomie Admin - Reports"; name="description"; property="og:title" */
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { BarChart3, TrendingUp, Users, Building2, CalendarCheck, Receipt } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  AreaChart, Area,
  LineChart, Line,
} from "recharts";

import AdminSidebar from "../../components/layout/layoutAdmin/AdminSidebar";
import Header from "../../components/layout/layoutUser/Header";
import Footer from "../../components/layout/layoutUser/Footer";
import StatCard from "../../components/domain/dashboard/StatCard";

import { adminGetAllProperties } from "../../services/adminPropertyService";
import { adminGetUsers } from "../../services/adminUserService";
import { adminGetAllBookings } from "../../services/adminBookingService";
import { adminGetAllContracts } from "../../services/adminContractService";
import { adminGetAllBills } from "../../services/adminBillingService";

import "../../styles/apple-glass-dashboard.css";
import "../../styles/home-redesign.css";

const ACCENT_COLORS = ["#D89A5B", "#C17A3A", "#E8B87A", "#A0643A", "#F0D0A0", "#88522A"];
const CHART_COLORS = { primary: "#D89A5B", secondary: "#C17A3A", success: "#34D399", warning: "#FBBF24", danger: "#F87171", info: "#60A5FA" };

const unwrap = (res) => {
  const list = res?.result ?? res?.data?.result ?? res?.data ?? res;
  return Array.isArray(list) ? list : [];
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="apple-glass-panel rounded-xl px-4 py-3 shadow-lg border" style={{ borderColor: "rgba(217,200,181,0.2)", background: "var(--home-charcoal)" }}>
      <p className="text-xs font-bold home-text-accent mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-xs home-text-primary">
          <span style={{ color: p.color }}>{p.name}: </span>
          <span className="font-semibold">{typeof p.value === "number" ? p.value.toLocaleString("vi-VN") : p.value}</span>
        </p>
      ))}
    </div>
  );
};

const ChartCard = ({ title, subtitle, children }) => (
  <div className="apple-glass-panel no-hover rounded-2xl p-6">
    <div className="mb-4">
      <h3 className="home-text-primary font-bold text-base">{title}</h3>
      {subtitle && <p className="text-xs home-text-muted mt-0.5">{subtitle}</p>}
    </div>
    {children}
  </div>
);

const AdminReports = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Báo cáo");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ properties: [], users: [], bookings: [], contracts: [], bills: [] });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [pRes, uRes, bkRes, cRes, blRes] = await Promise.allSettled([
        adminGetAllProperties(),
        adminGetUsers(),
        adminGetAllBookings(),
        adminGetAllContracts(),
        adminGetAllBills(),
      ]);
      setData({
        properties: pRes.status === "fulfilled" ? (Array.isArray(pRes.value) ? pRes.value : (pRes.value?.result ?? pRes.value?.data ?? [])) : [],
        users: unwrap(uRes.status === "fulfilled" ? uRes.value : []),
        bookings: unwrap(bkRes.status === "fulfilled" ? bkRes.value : []),
        contracts: unwrap(cRes.status === "fulfilled" ? cRes.value : []),
        bills: unwrap(blRes.status === "fulfilled" ? blRes.value : []),
      });
    } catch (e) {
      console.error("Load reports failed:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // === Property Status Distribution ===
  const propertyStatusData = useMemo(() => {
    const map = {};
    (Array.isArray(data.properties) ? data.properties : []).forEach((p) => {
      const s = String(p?.status ?? p?.propertyStatus ?? p?.approvalStatus ?? "UNKNOWN").toUpperCase();
      const key = s.includes("APPROVED") || s.includes("ACTIVE") ? "Đã duyệt" :
                  s.includes("PENDING") ? "Chờ duyệt" : s.includes("REJECT") || s.includes("DENIED") ? "Từ chối" : "Khác";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [data.properties]);

  // === Booking Status Distribution ===
  const bookingStatusData = useMemo(() => {
    const map = {};
    data.bookings.forEach((b) => {
      const s = String(b?.status).toUpperCase();
      const key = s.includes("ACTIVE") || s.includes("CONFIRMED") ? "Hoạt động" :
                  s.includes("PENDING") ? "Chờ duyệt" :
                  s.includes("TERMINATED") || s.includes("CANCELLED") ? "Đã hủy" :
                  s.includes("EXPIRED") ? "Hết hạn" : "Khác";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [data.bookings]);

  // === Bill Status Distribution ===
  const billStatusData = useMemo(() => {
    const map = {};
    data.bills.forEach((b) => {
      const s = String(b?.status).toUpperCase();
      const key = s === "PAID" ? "Đã thanh toán" : s === "PENDING" ? "Chờ TT" : s === "OVERDUE" ? "Quá hạn" : "Nháp";
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [data.bills]);

  // === Monthly Revenue (from PAID bills) ===
  const monthlyRevenueData = useMemo(() => {
    const map = {};
    data.bills
      .filter((b) => String(b?.status).toUpperCase() === "PAID")
      .forEach((b) => {
        const month = b?.billingMonth ? String(b.billingMonth).slice(0, 7) : "unknown";
        map[month] = (map[month] || 0) + (Number(b?.totalAmount) || 0);
      });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, revenue]) => ({ month: month.slice(5) + "/" + month.slice(0, 4), revenue }));
  }, [data.bills]);

  // === Monthly Bookings Timeline ===
  const monthlyBookingsData = useMemo(() => {
    const map = {};
    data.bookings.forEach((b) => {
      const d = b?.createdAt ? new Date(b.createdAt) : null;
      if (!d || Number.isNaN(d.getTime())) return;
      const key = `${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => ({ month, count }));
  }, [data.bookings]);

  // === Summary Overview ===
  const overview = useMemo(() => {
    const props = Array.isArray(data.properties) ? data.properties : [];
    const totalRevenue = data.bills
      .filter((b) => String(b?.status).toUpperCase() === "PAID")
      .reduce((s, b) => s + (Number(b?.totalAmount) || 0), 0);
    return {
      properties: props.length,
      users: data.users.length,
      bookings: data.bookings.length,
      contracts: data.contracts.length,
      bills: data.bills.length,
      totalRevenue,
    };
  }, [data]);

  const fmtMoney = (v) => {
    if (v >= 1e9) return (v / 1e9).toFixed(1) + " tỷ";
    if (v >= 1e6) return (v / 1e6).toFixed(1) + " tr";
    if (v >= 1e3) return (v / 1e3).toFixed(0) + "k";
    return v.toLocaleString("vi-VN");
  };

  return (
    <div className="home-v2 home-shell-bg min-h-screen">
      <AdminSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} pageTitle="Báo cáo & Thống kê" pageSubtitle="Phân tích toàn diện hoạt động của nền tảng" />
        <main className="w-full px-4 pt-6 pb-8 md:px-8">
          {/* Overview KPIs */}
          <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
            <StatCard icon={Building2} label="Bất động sản" value={overview.properties} color="orange" />
            <StatCard icon={Users} label="Người dùng" value={overview.users} color="blue" />
            <StatCard icon={CalendarCheck} label="Bookings" value={overview.bookings} color="green" />
            <StatCard icon={BarChart3} label="Hợp đồng" value={overview.contracts} color="indigo" />
            <StatCard icon={Receipt} label="Hóa đơn" value={overview.bills} color="yellow" />
            <StatCard icon={TrendingUp} label="Doanh thu" value={fmtMoney(overview.totalRevenue)} color="green" />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="apple-glass-panel no-hover rounded-2xl p-6 animate-pulse">
                  <div className="h-6 rounded w-1/3 mb-4" style={{ background: "var(--home-surface-soft)" }} />
                  <div className="h-48 rounded" style={{ background: "var(--home-surface-soft)" }} />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend */}
              <ChartCard title="Doanh thu theo tháng" subtitle="Tổng hóa đơn đã thanh toán">
                {monthlyRevenueData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <AreaChart data={monthlyRevenueData}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.4} />
                          <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(217,200,181,0.1)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9e8c7a" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#9e8c7a" }} tickFormatter={(v) => (v / 1e6).toFixed(0) + "tr"} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke={CHART_COLORS.primary} fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center home-text-muted text-sm">Chưa có dữ liệu</div>
                )}
              </ChartCard>

              {/* Property Status Pie */}
              <ChartCard title="Phân bố BĐS" subtitle="Theo trạng thái duyệt">
                {propertyStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={propertyStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                        {propertyStatusData.map((_, i) => <Cell key={i} fill={ACCENT_COLORS[i % ACCENT_COLORS.length]} />)}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12, color: "#9e8c7a" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center home-text-muted text-sm">Chưa có dữ liệu</div>
                )}
              </ChartCard>

              {/* Booking Status Bar */}
              <ChartCard title="Booking theo trạng thái" subtitle="Phân bố tất cả bookings">
                {bookingStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={bookingStatusData} barSize={36}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(217,200,181,0.1)" />
                      <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9e8c7a" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#9e8c7a" }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="value" name="Số lượng" fill={CHART_COLORS.primary} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center home-text-muted text-sm">Chưa có dữ liệu</div>
                )}
              </ChartCard>

              {/* Bill Status Pie */}
              <ChartCard title="Hóa đơn theo trạng thái" subtitle="Tổng quan thanh toán">
                {billStatusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie data={billStatusData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={4} dataKey="value">
                        {billStatusData.map((entry, i) => {
                          const c = entry.name === "Đã thanh toán" ? CHART_COLORS.success : entry.name === "Chờ TT" ? CHART_COLORS.warning : entry.name === "Quá hạn" ? CHART_COLORS.danger : CHART_COLORS.info;
                          return <Cell key={i} fill={c} />;
                        })}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ fontSize: 12, color: "#9e8c7a" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center home-text-muted text-sm">Chưa có dữ liệu</div>
                )}
              </ChartCard>

              {/* Booking Timeline */}
              <ChartCard title="Booking theo thời gian" subtitle="Số booking mới mỗi tháng">
                {monthlyBookingsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={monthlyBookingsData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(217,200,181,0.1)" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9e8c7a" }} />
                      <YAxis tick={{ fontSize: 11, fill: "#9e8c7a" }} allowDecimals={false} />
                      <Tooltip content={<CustomTooltip />} />
                      <Line type="monotone" dataKey="count" name="Bookings" stroke={CHART_COLORS.primary} strokeWidth={2} dot={{ fill: CHART_COLORS.primary, r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-48 flex items-center justify-center home-text-muted text-sm">Chưa có dữ liệu</div>
                )}
              </ChartCard>
            </div>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminReports;
