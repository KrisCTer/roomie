import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Home, Clock, CheckCircle, DollarSign, FileText, CalendarCheck,
  TrendingUp, AlertCircle, Receipt, Users, Building2,
  Zap, Percent,
} from "lucide-react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

import Sidebar from "../../../components/layout/layoutUser/Sidebar";
import Header from "../../../components/layout/layoutUser/Header";
import Footer from "../../../components/layout/layoutUser/Footer";
import StatCard from "../../../components/domain/dashboard/StatCard";
import RevenueChartRecharts from "../../../components/domain/dashboard/RevenueChartRecharts";
import useDashboardData from "../../../hooks/dashboard/useDashboardData";
import { useRole } from "../../../contexts/RoleContext";
import { useRefresh } from "../../../contexts/RefreshContext";
import useDashboardPresentation from "./hooks/useDashboardPresentation";
import DashboardLoadingSkeleton from "./sections/DashboardLoadingSkeleton";
import "../../../styles/apple-glass-dashboard.css";
import "../../../styles/home-redesign.css";

const CHART_COLORS = {
  primary: "#D89A5B", secondary: "#C17A3A", success: "#34D399",
  warning: "#FBBF24", danger: "#F87171", info: "#60A5FA", teal: "#2DD4BF",
};
const PIE_COLORS = ["#34D399", "#FBBF24", "#F87171", "#60A5FA", "#A78BFA"];

const MiniTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="apple-glass-panel rounded-lg px-3 py-2 shadow-lg text-xs" style={{ background: "var(--home-charcoal)" }}>
      <span className="home-text-primary font-semibold">{payload[0].name}: </span>
      <span className="home-text-accent font-bold">{payload[0].value}</span>
    </div>
  );
};

const MiniChartCard = ({ title, children }) => (
  <div className="apple-glass-panel no-hover rounded-2xl p-5">
    <h3 className="text-sm font-bold home-text-primary mb-3">{title}</h3>
    {children}
  </div>
);

const QuickNavButton = ({ icon: Icon, label, color, onClick }) => {
  const colorMap = {
    blue: "bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200",
    green: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200",
    teal: "bg-teal-50 text-teal-700 hover:bg-teal-100 border-teal-200",
    orange: "bg-orange-50 text-orange-700 hover:bg-orange-100 border-orange-200",
    yellow: "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200",
    red: "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200",
    gray: "bg-stone-50 text-stone-700 hover:bg-stone-100 border-stone-200",
  };
  return (
    <button type="button" onClick={onClick}
      className={`apple-glass-item flex flex-col items-center justify-center gap-2 rounded-xl border px-3 py-4 text-xs font-semibold transition ${colorMap[color] || colorMap.blue}`}
    >
      <Icon className="w-5 h-5" /> {label}
    </button>
  );
};

const ActivityFeed = ({ title, items, emptyText }) => (
  <div className="apple-glass-panel no-hover rounded-2xl p-5">
    <h3 className="text-sm font-bold home-text-primary mb-3">{title}</h3>
    {items.length === 0 ? (
      <p className="text-xs home-text-muted text-center py-4">{emptyText}</p>
    ) : (
      <div className="space-y-2 max-h-52 overflow-y-auto">
        {items.slice(0, 5).map((item, i) => (
          <div key={i} className="apple-glass-table-row rounded-lg px-3 py-2.5 flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
              item.status === "PENDING" ? "bg-amber-400" :
              item.status === "ACTIVE" || item.status === "CONFIRMED" || item.status === "PAID" ? "bg-emerald-400" :
              item.status === "OVERDUE" || item.status === "UNPAID" ? "bg-rose-400" : "bg-gray-400"
            }`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs home-text-primary font-semibold truncate">{item.title}</p>
              <p className="text-[10px] home-text-muted truncate">{item.subtitle}</p>
            </div>
            <span className="text-[10px] home-text-muted flex-shrink-0">{item.time}</span>
          </div>
        ))}
      </div>
    )}
  </div>
);

const DashboardPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { activeRole } = useRole();
  const { registerRefreshCallback, unregisterRefreshCallback } = useRefresh();
  const { loading, data, stats, refetch } = useDashboardData(activeRole);

  const {
    sidebarOpen, setSidebarOpen,
    activeMenu, setActiveMenu,
    visibleActivities,
  } = useDashboardPresentation({ data, activeRole });

  useEffect(() => {
    registerRefreshCallback("dashboard", refetch);
    return () => unregisterRefreshCallback("dashboard");
  }, [registerRefreshCallback, unregisterRefreshCallback, refetch]);

  // === Chart Data ===
  const bookingStatusChart = useMemo(() => {
    if (!data.bookings?.length) return [];
    const map = {};
    data.bookings.forEach((b) => {
      const s = String(b?.status ?? "").toUpperCase();
      const key = s === "CONFIRMED" ? t("dashboard.confirmed") : s === "PENDING" ? t("dashboard.pending") :
                  s === "COMPLETED" ? t("dashboard.completedStatus") : s === "CANCELLED" ? t("dashboard.cancelled") : t("dashboard.other");
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [data.bookings]);

  const contractStatusChart = useMemo(() => {
    const contracts = activeRole === "landlord" ? data.contracts?.asLandlord : data.contracts?.asTenant;
    if (!contracts?.length) return [];
    const map = {};
    contracts.forEach((c) => {
      const s = String(c?.status ?? "").toUpperCase();
      const key = s === "ACTIVE" ? t("dashboard.active") : s === "PENDING" ? t("dashboard.pendingSign") :
                  s === "EXPIRED" || s === "TERMINATED" ? t("dashboard.expired") : t("dashboard.other");
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [data.contracts, activeRole]);

  const billStatusChart = useMemo(() => {
    if (!data.bills?.length) return [];
    const map = {};
    data.bills.forEach((b) => {
      const s = String(b?.status ?? "").toUpperCase();
      const key = s === "PAID" ? t("dashboard.paid") : s === "PENDING" || s === "UNPAID" ? t("dashboard.unpaid") :
                  s === "OVERDUE" ? t("dashboard.overdue") : t("dashboard.other");
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [data.bills]);

  const monthlyBillTimeline = useMemo(() => {
    if (!data.bills?.length) return [];
    const map = {};
    data.bills.forEach((b) => {
      const month = b?.billingMonth ? String(b.billingMonth).slice(0, 7) : null;
      if (!month) return;
      map[month] = (map[month] || 0) + 1;
    });
    return Object.entries(map).sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([m, count]) => ({ month: m.slice(5) + "/" + m.slice(2, 4), count }));
  }, [data.bills]);

  // === Priority feed items ===
  const priorityFeed = useMemo(() => {
    const items = [];
    const fmt = (d) => {
      if (!d) return "";
      const dt = new Date(d);
      const diff = Date.now() - dt.getTime();
      const mins = Math.floor(diff / 60000);
      if (mins < 60) return t("dashboard.minutesAgo", { count: mins });
      const hrs = Math.floor(diff / 3600000);
      if (hrs < 24) return t("dashboard.hoursAgo", { count: hrs });
      return t("dashboard.daysAgo", { count: Math.floor(diff / 86400000) });
    };

    if (activeRole === "landlord") {
      (data.properties || []).filter(p => ["DRAFT", "PENDING"].includes((p.status || p.propertyStatus || "").toUpperCase()))
        .forEach(p => items.push({ title: p.title || t("dashboard.property"), subtitle: t("dashboard.waitingApproval"), status: "PENDING", time: fmt(p.createdAt) }));
      (data.bookings || []).filter(b => b.status === "PENDING")
        .forEach(b => items.push({ title: `Booking #${(b.bookingId || "").slice(0, 8)}`, subtitle: t("dashboard.waitingConfirm"), status: "PENDING", time: fmt(b.createdAt) }));
    } else {
      (data.bookings || []).filter(b => b.status === "PENDING")
        .forEach(b => items.push({ title: `Booking #${(b.bookingId || "").slice(0, 8)}`, subtitle: t("dashboard.waitingLandlord"), status: "PENDING", time: fmt(b.createdAt) }));
      (data.contracts?.asTenant || []).filter(c => c.status === "PENDING")
        .forEach(c => items.push({ title: `HĐ #${(c.contractId || "").slice(0, 8)}`, subtitle: t("dashboard.waitingSign"), status: "PENDING", time: fmt(c.createdAt) }));
    }
    (data.bills || []).filter(b => ["UNPAID", "PENDING", "OVERDUE"].includes((b.status || "").toUpperCase()))
      .forEach(b => items.push({ title: `${t("dashboard.bill")} ${(b.totalAmount || 0).toLocaleString()}đ`, subtitle: b.status === "OVERDUE" ? t("dashboard.overdueAlert") : t("dashboard.unpaidAlert"), status: b.status?.toUpperCase(), time: fmt(b.createdAt) }));

    return items;
  }, [data, activeRole]);

  const recentFeed = useMemo(() => {
    return visibleActivities.slice(0, 5).map(a => ({
      title: a.title, subtitle: a.description,
      status: a.description?.includes("ACTIVE") || a.description?.includes("CONFIRMED") ? "ACTIVE" :
              a.description?.includes("PENDING") ? "PENDING" :
              a.description?.includes("PAID") ? "PAID" : "OTHER",
      time: a.time,
    }));
  }, [visibleActivities]);

  // === Computed extra stats ===
  const fmtMoney = (v) => {
    if (v >= 1e9) return (v / 1e9).toFixed(1) + " tỷ";
    if (v >= 1e6) return (v / 1e6).toFixed(1) + "tr";
    if (v >= 1e3) return (v / 1e3).toFixed(0) + "k";
    return v.toLocaleString("vi-VN");
  };

  const occupancyRate = useMemo(() => {
    if (stats.totalProperties === 0) return 0;
    return Math.round((stats.rentedProperties / stats.totalProperties) * 100);
  }, [stats]);

  return (
    <div className="home-v2 home-shell-bg min-h-screen">
      <Sidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}
          pageTitle={t("sidebar." + activeRole + ".dashboard")}
          pageSubtitle={t(`dashboard.subtitle_${activeRole}`)}
        />
        <main className="w-full px-4 pb-8 pt-6 md:px-8">
          {loading ? <DashboardLoadingSkeleton /> : (
            <>
              {/* ===== KPI STAT CARDS ===== */}
              {activeRole === "landlord" ? (
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard icon={Building2} label={t("dashboard.totalProperties")} value={stats.totalProperties} color="blue"
                    onClick={() => navigate("/my-properties")} subtitle={`${stats.availableProperties} ${t("dashboard.available")}`} />
                  <StatCard icon={Clock} label={t("dashboard.pendingApproval")} value={stats.pendingProperties} color="yellow"
                    onClick={() => navigate("/my-properties?status=pending")} />
                  <StatCard icon={CheckCircle} label={t("dashboard.activeContracts")} value={stats.activeContracts} color="green"
                    onClick={() => navigate("/my-contracts")} subtitle={`${stats.totalContracts} ${t("dashboard.total")}`} />
                  <StatCard icon={AlertCircle} label={t("dashboard.unpaidBills")} value={stats.unpaidBills} color="red"
                    onClick={() => navigate("/my-bills?status=unpaid")} />
                  <StatCard icon={DollarSign} label={t("dashboard.monthlyIncome")} value={`${fmtMoney(stats.monthlyIncome)}đ`} color="teal" />
                  <StatCard icon={Percent} label={t("dashboard.occupancyRate")} value={`${occupancyRate}%`} color="indigo"
                    subtitle={`${stats.rentedProperties}/${stats.totalProperties} BĐS`} />
                  <StatCard icon={Receipt} label={t("dashboard.paidBills")} value={stats.paidBills} color="green"
                    onClick={() => navigate("/my-bills?status=paid")} />
                  <StatCard icon={TrendingUp} label={t("dashboard.totalRevenue")} value={`${fmtMoney(stats.totalBillAmount)}đ`} color="orange" />
                </div>
              ) : (
                <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  <StatCard icon={CheckCircle} label={t("dashboard.activeRentals")} value={stats.activeBookings} color="green"
                    onClick={() => navigate("/my-bookings?status=active")} />
                  <StatCard icon={Clock} label={t("dashboard.pendingConfirm")} value={stats.pendingBookings} color="yellow"
                    onClick={() => navigate("/my-bookings?status=pending")} />
                  <StatCard icon={FileText} label={t("dashboard.activeContracts")} value={stats.activeContracts} color="blue"
                    onClick={() => navigate("/my-contracts")} subtitle={`${stats.totalContracts} ${t("dashboard.total")}`} />
                  <StatCard icon={AlertCircle} label={t("dashboard.unpaidBills")} value={stats.unpaidBills} color="red"
                    onClick={() => navigate("/my-bills?status=unpaid")} />
                  <StatCard icon={CalendarCheck} label={t("dashboard.completed")} value={stats.completedBookings} color="teal"
                    onClick={() => navigate("/my-bookings?status=completed")} />
                  <StatCard icon={Receipt} label={t("dashboard.paidBillsTenant")} value={stats.paidBills} color="green"
                    onClick={() => navigate("/my-bills?status=paid")} />
                  <StatCard icon={DollarSign} label={t("dashboard.totalBills")} value={`${fmtMoney(stats.totalBillAmount)}đ`} color="orange" />
                  <StatCard icon={Zap} label={t("dashboard.pendingContracts")} value={stats.pendingContracts} color="indigo"
                    onClick={() => navigate("/my-contracts")} />
                </div>
              )}

              {/* ===== REVENUE CHART (Landlord only) ===== */}
              {activeRole === "landlord" && (
                <div className="mb-8">
                  <RevenueChartRecharts bills={data.bills} loading={loading} />
                </div>
              )}

              {/* ===== MINI CHARTS ROW ===== */}
              <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                {/* Booking Status */}
                <MiniChartCard title="Booking">
                  {bookingStatusChart.length > 0 ? (
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie data={bookingStatusChart} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                          {bookingStatusChart.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<MiniTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-xs home-text-muted text-center py-8">{t("dashboard.noData")}</p>}
                </MiniChartCard>

                {/* Contract Status */}
                <MiniChartCard title={t("dashboard.contractChart")}>
                  {contractStatusChart.length > 0 ? (
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie data={contractStatusChart} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                          {contractStatusChart.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                        </Pie>
                        <Tooltip content={<MiniTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-xs home-text-muted text-center py-8">{t("dashboard.noData")}</p>}
                </MiniChartCard>

                {/* Bill Status */}
                <MiniChartCard title={t("dashboard.billChart")}>
                  {billStatusChart.length > 0 ? (
                    <ResponsiveContainer width="100%" height={140}>
                      <PieChart>
                        <Pie data={billStatusChart} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                          {billStatusChart.map((e, i) => {
                            const c = e.name === t("dashboard.paid") ? CHART_COLORS.success : e.name === t("dashboard.unpaid") ? CHART_COLORS.warning : e.name === t("dashboard.overdue") ? CHART_COLORS.danger : CHART_COLORS.info;
                            return <Cell key={i} fill={c} />;
                          })}
                        </Pie>
                        <Tooltip content={<MiniTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : <p className="text-xs home-text-muted text-center py-8">{t("dashboard.noData")}</p>}
                </MiniChartCard>

                {/* Bill Timeline */}
                <MiniChartCard title={t("dashboard.billTimeline")}>
                  {monthlyBillTimeline.length > 0 ? (
                    <ResponsiveContainer width="100%" height={140}>
                      <BarChart data={monthlyBillTimeline} barSize={16}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(217,200,181,0.1)" />
                        <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9e8c7a" }} />
                        <YAxis tick={{ fontSize: 10, fill: "#9e8c7a" }} allowDecimals={false} />
                        <Tooltip content={<MiniTooltip />} />
                        <Bar dataKey="count" name={t("dashboard.billChart")} fill={CHART_COLORS.primary} radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : <p className="text-xs home-text-muted text-center py-8">{t("dashboard.noData")}</p>}
                </MiniChartCard>
              </div>

              {/* ===== ACTIVITY FEEDS + QUICK ACTIONS ===== */}
              <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
                <ActivityFeed title={t("dashboard.priorityFeed")} items={priorityFeed} emptyText={t("dashboard.noPriority")} />
                <ActivityFeed title={t("dashboard.recentFeed")} items={recentFeed} emptyText={t("dashboard.noActivity")} />

                {/* Quick Actions */}
                <div className="apple-glass-panel no-hover rounded-2xl p-5">
                  <h3 className="text-sm font-bold home-text-primary mb-3">{t("dashboard.quickActions")}</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {activeRole === "landlord" ? (
                      <>
                        <QuickNavButton icon={Home} label={t("dashboard.addProperty")} color="blue" onClick={() => navigate("/add-property")} />
                        <QuickNavButton icon={FileText} label={t("dashboard.contracts")} color="teal" onClick={() => navigate("/my-contracts")} />
                        <QuickNavButton icon={Receipt} label={t("dashboard.bills")} color="orange" onClick={() => navigate("/my-bills")} />
                        <QuickNavButton icon={CalendarCheck} label={t("dashboard.bookings")} color="green" onClick={() => navigate("/my-bookings")} />
                      </>
                    ) : (
                      <>
                        <QuickNavButton icon={Home} label={t("dashboard.findRoom")} color="blue" onClick={() => navigate("/search")} />
                        <QuickNavButton icon={FileText} label={t("dashboard.contracts")} color="teal" onClick={() => navigate("/my-contracts")} />
                        <QuickNavButton icon={Receipt} label={t("dashboard.bills")} color="orange" onClick={() => navigate("/my-bills")} />
                        <QuickNavButton icon={CalendarCheck} label={t("dashboard.bookings")} color="green" onClick={() => navigate("/my-bookings")} />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* ===== INSIGHTS ===== */}
              {(activeRole === "landlord" && (stats.unpaidBills > 0 || stats.pendingProperties > 0)) && (
                <div className="apple-glass-panel rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="home-tone-warning flex h-12 w-12 items-center justify-center rounded-xl border">
                      <TrendingUp className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="home-text-primary mb-2 font-bold">{t("dashboard.insights")}</h3>
                      <ul className="home-text-muted space-y-1.5 text-sm">
                        {stats.pendingProperties > 0 && (
                          <li className="flex items-center gap-2">
                            <AlertCircle className="home-text-accent h-4 w-4" />
                            <span>{t("dashboard.pendingApprovalMsg", { count: stats.pendingProperties })}</span>
                          </li>
                        )}
                        {stats.unpaidBills > 0 && (
                          <li className="flex items-center gap-2">
                            <AlertCircle className="text-rose-500 h-4 w-4" />
                            <span>{t("dashboard.unpaidBillsMsg", { count: stats.unpaidBills, amount: fmtMoney(stats.totalBillAmount) + "đ" })}</span>
                          </li>
                        )}
                        {stats.availableProperties > 0 && (
                          <li className="flex items-center gap-2">
                            <CheckCircle className="text-emerald-500 h-4 w-4" />
                            <span>{t("dashboard.availableMsg", { count: stats.availableProperties })}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {(activeRole === "tenant" && stats.unpaidBills > 0) && (
                <div className="apple-glass-panel rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="home-tone-danger flex h-12 w-12 items-center justify-center rounded-xl border">
                      <AlertCircle className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h3 className="home-text-primary mb-2 font-bold">{t("dashboard.attention")}</h3>
                      <p className="home-text-muted text-sm">
                        {t("dashboard.unpaidBillsTenantMsg", { count: stats.unpaidBills })}{" "}
                        <span className="home-tone-danger rounded px-1 py-0.5 font-bold">{fmtMoney(stats.totalBillAmount)}đ</span>
                      </p>
                      <button onClick={() => navigate("/my-bills?status=unpaid")} className="home-btn-accent mt-3 px-4 py-2 text-white shadow-sm">
                        {t("dashboard.viewDetails")}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default DashboardPage;
