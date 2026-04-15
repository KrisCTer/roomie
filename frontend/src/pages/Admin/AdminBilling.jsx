/* SEO_META: title="Roomie Admin - Billing"; name="description"; property="og:title" */
import React, { useEffect, useMemo, useState } from "react";
import { Receipt, Search, DollarSign, AlertCircle, CheckCircle2 } from "lucide-react";

import AdminSidebar from "../../components/layout/layoutAdmin/AdminSidebar";
import Header from "../../components/layout/layoutUser/Header";
import Footer from "../../components/layout/layoutUser/Footer";
import StatCard from "../../components/domain/dashboard/StatCard";

import { adminGetAllBills } from "../../services/adminBillingService";

import "../../styles/apple-glass-dashboard.css";
import "../../styles/home-redesign.css";

const statusConfig = {
  DRAFT: { label: "Nháp", tone: "home-tone-info" },
  PENDING: { label: "Chờ thanh toán", tone: "home-tone-warning" },
  PAID: { label: "Đã thanh toán", tone: "home-tone-success" },
  OVERDUE: { label: "Quá hạn", tone: "home-tone-danger" },
};

const getBadge = (status) => {
  const s = String(status).toUpperCase().trim();
  return statusConfig[s] || { label: status || "UNKNOWN", tone: "home-tone-info" };
};

const fmtMoney = (v) => {
  const n = Number(v);
  if (!n && n !== 0) return "—";
  return n.toLocaleString("vi-VN") + " đ";
};

const fmtMonth = (d) => {
  if (!d) return "—";
  const parts = String(d).split("-");
  if (parts.length >= 2) return `${parts[1]}/${parts[0]}`;
  return d;
};

const unwrap = (res) => {
  const list = res?.result ?? res?.data?.result ?? res?.data ?? res;
  return Array.isArray(list) ? list : [];
};

const statusFilters = ["ALL", "DRAFT", "PENDING", "PAID", "OVERDUE"];

const AdminBilling = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Hóa đơn");
  const [loading, setLoading] = useState(false);
  const [bills, setBills] = useState([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminGetAllBills();
      setBills(unwrap(res));
    } catch (e) {
      console.error("Load bills failed:", e);
      setBills([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = bills;
    if (statusFilter !== "ALL") {
      list = list.filter((b) => String(b?.status).toUpperCase() === statusFilter);
    }
    const kw = q.trim().toLowerCase();
    if (kw) {
      list = list.filter((b) =>
        [b?.id, b?.contractId, String(b?.status), String(b?.billingMonth)]
          .filter(Boolean).join(" ").toLowerCase().includes(kw)
      );
    }
    return list;
  }, [bills, q, statusFilter]);

  const stats = useMemo(() => {
    const total = bills.length;
    const paid = bills.filter((b) => String(b?.status).toUpperCase() === "PAID").length;
    const pending = bills.filter((b) => String(b?.status).toUpperCase() === "PENDING").length;
    const overdue = bills.filter((b) => String(b?.status).toUpperCase() === "OVERDUE").length;
    const totalRevenue = bills
      .filter((b) => String(b?.status).toUpperCase() === "PAID")
      .reduce((sum, b) => sum + (Number(b?.totalAmount) || 0), 0);
    const totalPending = bills
      .filter((b) => ["PENDING", "OVERDUE"].includes(String(b?.status).toUpperCase()))
      .reduce((sum, b) => sum + (Number(b?.totalAmount) || 0), 0);
    return { total, paid, pending, overdue, totalRevenue, totalPending };
  }, [bills]);

  return (
    <div className="home-v2 home-shell-bg min-h-screen">
      <AdminSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} pageTitle="Quản lý hóa đơn" pageSubtitle="Tổng quan hóa đơn và doanh thu hệ thống" />
        <main className="w-full px-4 pt-6 pb-8 md:px-8">
          {/* KPI */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Receipt} label="Tổng hóa đơn" value={stats.total} color="blue" />
            <StatCard icon={CheckCircle2} label="Đã thanh toán" value={stats.paid} color="green" subtitle={fmtMoney(stats.totalRevenue)} />
            <StatCard icon={DollarSign} label="Chờ thanh toán" value={stats.pending} color="orange" subtitle={fmtMoney(stats.totalPending)} />
            <StatCard icon={AlertCircle} label="Quá hạn" value={stats.overdue} color="red" />
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 home-text-muted" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo ID, contract, tháng..." className="home-input pl-9 w-full" />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {statusFilters.map((s) => (
                  <button key={s} type="button" onClick={() => setStatusFilter(s)}
                    className={`apple-glass-pill px-3 py-1.5 text-xs font-semibold transition ${statusFilter === s ? "home-text-accent ring-1 ring-[var(--home-accent)]" : "home-text-muted"}`}
                  >{s === "ALL" ? "Tất cả" : getBadge(s).label}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Table */}
          <section className="apple-glass-panel no-hover rounded-2xl p-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="apple-glass-soft animate-pulse flex items-center gap-4 rounded-xl p-4">
                    <div className="flex-1 space-y-2">
                      <div className="h-4 rounded w-3/4" style={{ background: "var(--home-surface-soft)" }} />
                      <div className="h-3 rounded w-1/2" style={{ background: "var(--home-surface-soft)" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="apple-glass-soft home-text-muted rounded-2xl border-dashed p-8 text-center">Không có hóa đơn nào</div>
            ) : (
              <div className="space-y-2">
                {/* Header */}
                <div className="apple-glass-soft rounded-xl px-4 py-3 hidden md:grid md:grid-cols-12 text-xs font-semibold home-text-muted uppercase tracking-wider">
                  <span className="col-span-2">Mã HĐ</span>
                  <span className="col-span-2">Contract ID</span>
                  <span className="col-span-1">Tháng</span>
                  <span className="col-span-2">Tiền thuê</span>
                  <span className="col-span-1">Điện</span>
                  <span className="col-span-1">Nước</span>
                  <span className="col-span-1">Tổng</span>
                  <span className="col-span-2 text-right">Trạng thái</span>
                </div>

                {filtered.map((b) => {
                  const badge = getBadge(b?.status);
                  return (
                    <div key={b?.id} className="apple-glass-table-row rounded-xl px-4 py-3.5 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-0 items-center">
                      <div className="col-span-2">
                        <p className="home-text-primary font-semibold text-sm truncate">{b?.id?.slice(0, 8)}...</p>
                      </div>
                      <span className="col-span-2 home-text-muted text-sm truncate">{b?.contractId?.slice(0, 12)}...</span>
                      <span className="col-span-1 home-text-primary text-sm font-medium">{fmtMonth(b?.billingMonth)}</span>
                      <span className="col-span-2 home-text-accent font-semibold text-sm">{fmtMoney(b?.monthlyRent)}</span>
                      <span className="col-span-1 text-sm home-text-muted">{fmtMoney(b?.electricityAmount)}</span>
                      <span className="col-span-1 text-sm home-text-muted">{fmtMoney(b?.waterAmount)}</span>
                      <span className="col-span-1 text-sm font-bold home-text-primary">{fmtMoney(b?.totalAmount)}</span>
                      <div className="col-span-2 flex justify-end">
                        <span className={`${badge.tone} rounded-full border px-2.5 py-1 text-xs font-semibold`}>{badge.label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminBilling;
