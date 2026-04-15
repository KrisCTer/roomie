/* SEO_META: title="Roomie Admin"; name="description"; property="og:title" */
import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users, Building2, ArrowRight, CalendarCheck, FileText,
  Receipt, BarChart3, TrendingUp, AlertCircle, CheckCircle2,
  Sparkles,
} from "lucide-react";
import StatCard from "../../components/domain/dashboard/StatCard";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  BarChart, Bar,
} from "recharts";

import AdminSidebar from "../../components/layout/layoutAdmin/AdminSidebar";
import Header from "../../components/layout/layoutUser/Header";
import Footer from "../../components/layout/layoutUser/Footer";

import { adminGetAllProperties } from "../../services/adminPropertyService";
import { adminGetUsers } from "../../services/adminUserService";
import { adminGetAllBookings } from "../../services/adminBookingService";
import { adminGetAllContracts } from "../../services/adminContractService";
import { adminGetAllBills } from "../../services/adminBillingService";
import { removeToken, removeUserProfile } from "../../services/localStorageService";

import "../../styles/apple-glass-dashboard.css";
import "../../styles/home-redesign.css";

/* ==================== Helpers ==================== */

const CHART_COLORS = ["#D89A5B", "#C17A3A", "#E8B87A", "#A0643A", "#88522A"];
const STATUS_COLORS = { success: "#34D399", warning: "#FBBF24", danger: "#F87171", info: "#60A5FA" };

const safeJson = (v) => { try { return JSON.parse(v); } catch { return null; } };

const resolveUsername = () => {
  const ui = safeJson(localStorage.getItem("userInfo") || "{}");
  if (ui?.username) return ui.username;
  const auth = safeJson(localStorage.getItem("auth") || "{}");
  if (auth?.user?.username) return auth.user.username;
  if (auth?.username) return auth.username;
  const raw = localStorage.getItem("username") || localStorage.getItem("user_name") || localStorage.getItem("currentUser");
  if (!raw) return "";
  const parsed = safeJson(raw);
  return parsed?.username || raw;
};

const normalizeProperties = (res) => {
  const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.result) ? res.result : [];
  return list.map((p) => ({ ...p, status: p?.status ?? p?.propertyStatus ?? p?.approvalStatus ?? p?.state ?? "" }));
};

const unwrap = (res) => { const l = res?.result ?? res?.data?.result ?? res?.data ?? res; return Array.isArray(l) ? l : []; };

const fmtMoney = (v) => {
  if (v >= 1e9) return (v / 1e9).toFixed(1) + " tỷ";
  if (v >= 1e6) return (v / 1e6).toFixed(1) + "tr";
  if (v >= 1e3) return (v / 1e3).toFixed(0) + "k";
  return v.toLocaleString("vi-VN");
};

const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" });
};

const fmtTime = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" });
};

const getPropStatus = (p) => String(p?.status ?? p?.propertyStatus ?? p?.approvalStatus ?? "").toUpperCase().trim();

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl px-3 py-2 shadow-lg text-xs" style={{ background: "var(--home-charcoal)", border: "1px solid rgba(217,200,181,0.2)" }}>
      <p className="font-bold home-text-accent mb-0.5">{label}</p>
      {payload.map((p, i) => (<p key={i} className="home-text-primary"><span style={{ color: p.color }}>{p.name}: </span><span className="font-semibold">{typeof p.value === "number" ? p.value.toLocaleString("vi-VN") : p.value}</span></p>))}
    </div>
  );
};

/* ==================== Component ==================== */

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Admin Dashboard");
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({ properties: [], users: [], bookings: [], contracts: [], bills: [] });

  const username = useMemo(() => resolveUsername(), []);
  const isAdmin = String(username).toLowerCase() === "admin";

  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      const [pRes, uRes, bkRes, cRes, blRes] = await Promise.allSettled([
        adminGetAllProperties(), adminGetUsers(), adminGetAllBookings(), adminGetAllContracts(), adminGetAllBills(),
      ]);
      setData({
        properties: normalizeProperties(pRes.status === "fulfilled" ? pRes.value : []),
        users: unwrap(uRes.status === "fulfilled" ? uRes.value : []).filter((u) => u?.username?.toLowerCase() !== "admin"),
        bookings: unwrap(bkRes.status === "fulfilled" ? bkRes.value : []),
        contracts: unwrap(cRes.status === "fulfilled" ? cRes.value : []),
        bills: unwrap(blRes.status === "fulfilled" ? blRes.value : []),
      });
    } catch (e) {
      console.error("Dashboard load failed:", e);
      if (e?.response?.status === 401) { removeToken(); removeUserProfile(); window.location.href = "/login"; }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { if (isAdmin) loadAll(); }, [isAdmin, loadAll]);

  /* ==================== Computed Stats ==================== */
  const stats = useMemo(() => {
    const { properties, users, bookings, contracts, bills } = data;
    const paidBills = bills.filter((b) => String(b?.status).toUpperCase() === "PAID");
    const totalRevenue = paidBills.reduce((s, b) => s + (Number(b?.totalAmount) || 0), 0);
    const pendingBills = bills.filter((b) => ["PENDING", "OVERDUE"].includes(String(b?.status).toUpperCase()));
    const pendingAmount = pendingBills.reduce((s, b) => s + (Number(b?.totalAmount) || 0), 0);

    return {
      properties: properties.length,
      pendingProps: properties.filter((p) => getPropStatus(p).includes("PENDING")).length,
      approvedProps: properties.filter((p) => getPropStatus(p).includes("APPROVED") || getPropStatus(p).includes("ACTIVE")).length,
      users: users.length,
      bookings: bookings.length,
      activeBookings: bookings.filter((b) => String(b?.status).toUpperCase().includes("ACTIVE")).length,
      contracts: contracts.length,
      activeContracts: contracts.filter((c) => String(c?.status).toUpperCase().includes("ACTIVE")).length,
      bills: bills.length,
      paidBills: paidBills.length,
      overdueBills: bills.filter((b) => String(b?.status).toUpperCase() === "OVERDUE").length,
      totalRevenue,
      pendingAmount,
    };
  }, [data]);

  /* ==================== Chart Data ==================== */
  const propertyPieData = useMemo(() => {
    const m = {};
    data.properties.forEach((p) => {
      const s = getPropStatus(p);
      const k = s.includes("APPROVED") || s.includes("ACTIVE") ? "Đã duyệt" : s.includes("PENDING") ? "Chờ duyệt" : s.includes("REJECT") || s.includes("DENIED") ? "Từ chối" : "Khác";
      m[k] = (m[k] || 0) + 1;
    });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [data.properties]);

  const billPieData = useMemo(() => {
    const m = {};
    data.bills.forEach((b) => {
      const s = String(b?.status).toUpperCase();
      const k = s === "PAID" ? "Đã TT" : s === "PENDING" ? "Chờ TT" : s === "OVERDUE" ? "Quá hạn" : "Nháp";
      m[k] = (m[k] || 0) + 1;
    });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [data.bills]);

  const billPieColor = (name) => name === "Đã TT" ? STATUS_COLORS.success : name === "Chờ TT" ? STATUS_COLORS.warning : name === "Quá hạn" ? STATUS_COLORS.danger : STATUS_COLORS.info;

  const monthlyRevenueData = useMemo(() => {
    const m = {};
    data.bills.filter((b) => String(b?.status).toUpperCase() === "PAID").forEach((b) => {
      const month = b?.billingMonth ? String(b.billingMonth).slice(0, 7) : "unknown";
      m[month] = (m[month] || 0) + (Number(b?.totalAmount) || 0);
    });
    return Object.entries(m).sort(([a], [b]) => a.localeCompare(b)).map(([month, revenue]) => ({ month: month.slice(5) + "/" + month.slice(2, 4), revenue }));
  }, [data.bills]);

  const bookingBarData = useMemo(() => {
    const m = {};
    data.bookings.forEach((b) => {
      const s = String(b?.status).toUpperCase();
      const k = s.includes("ACTIVE") || s.includes("CONFIRMED") ? "HĐ" : s.includes("PENDING") ? "Chờ" : s.includes("TERMINATED") || s.includes("CANCELLED") ? "Hủy" : "Khác";
      m[k] = (m[k] || 0) + 1;
    });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [data.bookings]);

  /* ==================== Recent Activities ==================== */
  const recentBookings = useMemo(() =>
    [...data.bookings].sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)).slice(0, 5)
  , [data.bookings]);

  const recentContracts = useMemo(() =>
    [...data.contracts].sort((a, b) => new Date(b?.createdAt || 0) - new Date(a?.createdAt || 0)).slice(0, 5)
  , [data.contracts]);

  const pendingProperties = useMemo(() =>
    data.properties.filter((p) => getPropStatus(p).includes("PENDING")).slice(0, 5)
  , [data.properties]);

  if (!isAdmin) {
    return (
      <div className="home-v2 home-shell-bg min-h-screen flex items-center justify-center">
        <div className="apple-glass-panel rounded-2xl p-8 text-center"><p className="home-text-primary text-lg font-semibold">Bạn không có quyền truy cập</p></div>
      </div>
    );
  }



  /* ==================== Mini Chart Card ==================== */
  const MiniChartCard = ({ title, children }) => (
    <div className="apple-glass-panel no-hover rounded-2xl p-5">
      <h3 className="text-sm font-bold home-text-primary mb-3">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="home-v2 home-shell-bg min-h-screen">
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} activeMenu={activeMenu} setActiveMenu={setActiveMenu} />
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} pageTitle="Bảng điều khiển" pageSubtitle="Tổng quan hoạt động nền tảng Roomie" />

        <main className="w-full px-4 pt-6 pb-8 md:px-8">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[1,2,3,4,5,6,7,8].map((i) => (
                <div key={i} className="apple-glass-panel rounded-2xl p-5 animate-pulse">
                  <div className="w-11 h-11 rounded-xl mb-3" style={{ background: "var(--home-surface-soft)" }} />
                  <div className="h-7 rounded w-1/2 mb-2" style={{ background: "var(--home-surface-soft)" }} />
                  <div className="h-3 rounded w-3/4" style={{ background: "var(--home-surface-soft)" }} />
                </div>
              ))}
            </div>
          ) : (
            <>
              {/* ===== ROW 1: Primary KPIs ===== */}
              <div className="mb-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Building2} label="Bất động sản" value={stats.properties} subtitle={`${stats.pendingProps} chờ duyệt`} color="orange" onClick={() => navigate("/admin/properties")} />
                <StatCard icon={Users} label="Người dùng" value={stats.users} color="blue" onClick={() => navigate("/admin/users")} />
                <StatCard icon={CalendarCheck} label="Booking" value={stats.bookings} subtitle={`${stats.activeBookings} đang hoạt động`} color="green" onClick={() => navigate("/admin/bookings")} />
                <StatCard icon={TrendingUp} label="Doanh thu" value={fmtMoney(stats.totalRevenue) + " đ"} subtitle={`${stats.paidBills} hóa đơn đã TT`} color="green" onClick={() => navigate("/admin/reports")} />
              </div>

              {/* ===== ROW 2: Secondary KPIs ===== */}
              <div className="mb-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={FileText} label="Hợp đồng" value={stats.contracts} subtitle={`${stats.activeContracts} đang hoạt động`} color="indigo" onClick={() => navigate("/admin/contracts")} />
                <StatCard icon={Receipt} label="Hóa đơn" value={stats.bills} subtitle={fmtMoney(stats.pendingAmount) + " đ chờ TT"} color="yellow" onClick={() => navigate("/admin/billing")} />
                <StatCard icon={AlertCircle} label="Quá hạn" value={stats.overdueBills} color="red" onClick={() => navigate("/admin/billing")} />
                <StatCard icon={CheckCircle2} label="BĐS đã duyệt" value={stats.approvedProps} color="green" onClick={() => navigate("/admin/properties")} />
              </div>

              {/* ===== ROW 3: Charts (2 cols on lg) ===== */}
              <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Revenue Area Chart */}
                <MiniChartCard title="Doanh thu theo tháng">
                  {monthlyRevenueData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={monthlyRevenueData}>
                        <defs>
                          <linearGradient id="dashRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D89A5B" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#D89A5B" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(217,200,181,0.08)" />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9e8c7a" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 10, fill: "#9e8c7a" }} axisLine={false} tickLine={false} tickFormatter={(v) => (v / 1e6).toFixed(0) + "tr"} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area type="monotone" dataKey="revenue" name="Doanh thu" stroke="#D89A5B" fill="url(#dashRev)" strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : <div className="h-[180px] flex items-center justify-center home-text-muted text-sm">Chưa có dữ liệu</div>}
                </MiniChartCard>

                {/* Property Pie */}
                <MiniChartCard title="Trạng thái BĐS">
                  {propertyPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie data={propertyPieData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                          {propertyPieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <div className="h-[180px] flex items-center justify-center home-text-muted text-sm">Chưa có dữ liệu</div>}
                  <div className="flex flex-wrap gap-3 mt-2 justify-center">
                    {propertyPieData.map((d, i) => (
                      <div key={d.name} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                        <span className="text-[10px] home-text-muted">{d.name} ({d.value})</span>
                      </div>
                    ))}
                  </div>
                </MiniChartCard>

                {/* Bill Status + Booking Bar stacked */}
                <div className="space-y-6">
                  <MiniChartCard title="Hóa đơn">
                    {billPieData.length > 0 ? (
                      <div className="flex items-center gap-4">
                        <ResponsiveContainer width="50%" height={100}>
                          <PieChart>
                            <Pie data={billPieData} cx="50%" cy="50%" innerRadius={25} outerRadius={45} paddingAngle={2} dataKey="value">
                              {billPieData.map((d, i) => <Cell key={i} fill={billPieColor(d.name)} />)}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="flex-1 space-y-1">
                          {billPieData.map((d) => (
                            <div key={d.name} className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full" style={{ background: billPieColor(d.name) }} />
                                <span className="text-[10px] home-text-muted">{d.name}</span>
                              </div>
                              <span className="text-xs font-bold home-text-primary">{d.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : <div className="h-[100px] flex items-center justify-center home-text-muted text-sm">—</div>}
                  </MiniChartCard>

                  <MiniChartCard title="Booking theo trạng thái">
                    {bookingBarData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={80}>
                        <BarChart data={bookingBarData} barSize={20} layout="vertical">
                          <XAxis type="number" tick={{ fontSize: 10, fill: "#9e8c7a" }} axisLine={false} tickLine={false} />
                          <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#9e8c7a" }} axisLine={false} tickLine={false} width={30} />
                          <Bar dataKey="value" fill="#D89A5B" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : <div className="h-[80px] flex items-center justify-center home-text-muted text-sm">—</div>}
                  </MiniChartCard>
                </div>
              </div>

              {/* ===== ROW 4: Activity Feeds (3 cols) ===== */}
              <div className="mb-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Pending Properties */}
                <div className="apple-glass-panel no-hover rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" style={{ color: "#FBBF24" }} />
                      <h3 className="text-sm font-bold home-text-primary">BĐS chờ duyệt</h3>
                    </div>
                    <button type="button" onClick={() => navigate("/admin/properties")} className="text-[10px] home-text-accent font-semibold flex items-center gap-1">
                      Xem tất cả <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  {pendingProperties.length === 0 ? (
                    <p className="text-xs home-text-muted text-center py-4">Không có BĐS chờ duyệt</p>
                  ) : (
                    <div className="space-y-2.5">
                      {pendingProperties.map((p, i) => (
                        <div key={p?.propertyId || p?.id || i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer" onClick={() => navigate(`/property/${p?.propertyId || p?.id}`)}>
                          <div className="w-10 h-10 rounded-lg overflow-hidden apple-glass-soft flex-shrink-0">
                            <img src={p?.thumbnail || p?.images?.[0]?.url || p?.images?.[0] || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100"} alt="" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=100"; }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold home-text-primary truncate">{p?.title || "—"}</p>
                            <p className="text-[10px] home-text-muted">{fmtMoney(p?.monthlyRent || p?.price || 0)} đ/tháng</p>
                          </div>
                          <span className="home-tone-warning rounded-full border px-2 py-0.5 text-[10px] font-semibold flex-shrink-0">Chờ</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recent Bookings */}
                <div className="apple-glass-panel no-hover rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CalendarCheck className="w-4 h-4" style={{ color: "#34D399" }} />
                      <h3 className="text-sm font-bold home-text-primary">Booking gần đây</h3>
                    </div>
                    <button type="button" onClick={() => navigate("/admin/bookings")} className="text-[10px] home-text-accent font-semibold flex items-center gap-1">
                      Xem tất cả <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  {recentBookings.length === 0 ? (
                    <p className="text-xs home-text-muted text-center py-4">Chưa có booking</p>
                  ) : (
                    <div className="space-y-2.5">
                      {recentBookings.map((b, i) => {
                        const s = String(b?.status).toUpperCase();
                        const tone = s.includes("ACTIVE") ? "home-tone-success" : s.includes("PENDING") ? "home-tone-warning" : s.includes("TERMINATED") || s.includes("CANCELLED") ? "home-tone-danger" : "home-tone-info";
                        const label = s.includes("ACTIVE") ? "HĐ" : s.includes("PENDING") ? "Chờ" : s.includes("TERMINATED") || s.includes("CANCELLED") ? "Hủy" : s.slice(0, 4);
                        return (
                          <div key={b?.id || i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(52,211,153,0.1)" }}>
                              <CalendarCheck className="w-4 h-4" style={{ color: "#34D399" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold home-text-primary truncate">{b?.bookingReference || b?.id?.slice(0, 10)}</p>
                              <p className="text-[10px] home-text-muted">{fmtTime(b?.createdAt)}</p>
                            </div>
                            <span className={`${tone} rounded-full border px-2 py-0.5 text-[10px] font-semibold flex-shrink-0`}>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Recent Contracts */}
                <div className="apple-glass-panel no-hover rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" style={{ color: "#A78BFA" }} />
                      <h3 className="text-sm font-bold home-text-primary">Hợp đồng gần đây</h3>
                    </div>
                    <button type="button" onClick={() => navigate("/admin/contracts")} className="text-[10px] home-text-accent font-semibold flex items-center gap-1">
                      Xem tất cả <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  {recentContracts.length === 0 ? (
                    <p className="text-xs home-text-muted text-center py-4">Chưa có hợp đồng</p>
                  ) : (
                    <div className="space-y-2.5">
                      {recentContracts.map((c, i) => {
                        const s = String(c?.status).toUpperCase();
                        const tone = s.includes("ACTIVE") ? "home-tone-success" : s.includes("PENDING") ? "home-tone-warning" : s.includes("TERMINATED") ? "home-tone-danger" : "home-tone-info";
                        const label = s.includes("ACTIVE") ? "HĐ" : s.includes("PENDING_SIG") ? "Chờ ký" : s.includes("PENDING_PAY") ? "Chờ TT" : s.includes("TERMINATED") ? "Hết" : s.slice(0, 5);
                        return (
                          <div key={c?.id || i} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/5 transition-colors">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "rgba(167,139,250,0.1)" }}>
                              <FileText className="w-4 h-4" style={{ color: "#A78BFA" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold home-text-primary truncate">{c?.id?.slice(0, 12)}...</p>
                              <div className="flex items-center gap-1.5 mt-0.5">
                                <span className={`w-1.5 h-1.5 rounded-full ${c?.tenantSigned ? "bg-green-500" : "bg-gray-400"}`} />
                                <span className={`w-1.5 h-1.5 rounded-full ${c?.landlordSigned ? "bg-green-500" : "bg-gray-400"}`} />
                                <span className="text-[9px] home-text-muted">{c?.tenantSigned && c?.landlordSigned ? "Đã ký" : "Chưa ký đủ"}</span>
                              </div>
                            </div>
                            <span className={`${tone} rounded-full border px-2 py-0.5 text-[10px] font-semibold flex-shrink-0`}>{label}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* ===== ROW 5: Quick Actions ===== */}
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {[
                  { label: "Bất động sản", icon: Building2, path: "/admin/properties", color: "#D89A5B" },
                  { label: "Người dùng", icon: Users, path: "/admin/users", color: "#60A5FA" },
                  { label: "Đặt phòng", icon: CalendarCheck, path: "/admin/bookings", color: "#34D399" },
                  { label: "Hợp đồng", icon: FileText, path: "/admin/contracts", color: "#A78BFA" },
                  { label: "Hóa đơn", icon: Receipt, path: "/admin/billing", color: "#FBBF24" },
                  { label: "Báo cáo", icon: BarChart3, path: "/admin/reports", color: "#D89A5B" },
                ].map((item) => (
                  <button key={item.label} type="button" onClick={() => navigate(item.path)}
                    className="apple-glass-panel rounded-xl p-3.5 flex flex-col items-center gap-2 text-center transition-all hover:scale-[1.03] group"
                  >
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors" style={{ background: `${item.color}15` }}>
                      <item.icon className="w-4.5 h-4.5" style={{ color: item.color }} />
                    </div>
                    <span className="text-[11px] font-semibold home-text-muted group-hover:home-text-primary transition-colors">{item.label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminDashboard;
