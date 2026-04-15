/* SEO_META: title="Roomie Admin - Contracts"; name="description"; property="og:title" */
import React, { useEffect, useMemo, useState } from "react";
import { FileText, Search, Eye, CheckCircle2, XCircle } from "lucide-react";

import AdminSidebar from "../../components/layout/layoutAdmin/AdminSidebar";
import Header from "../../components/layout/layoutUser/Header";
import Footer from "../../components/layout/layoutUser/Footer";
import StatCard from "../../components/domain/dashboard/StatCard";

import { adminGetAllContracts } from "../../services/adminContractService";

import "../../styles/apple-glass-dashboard.css";
import "../../styles/home-redesign.css";

const statusConfig = {
  PENDING_SIGNATURE: { label: "Chờ ký", tone: "home-tone-warning" },
  PENDING_PAYMENT: { label: "Chờ thanh toán", tone: "home-tone-warning" },
  ACTIVE: { label: "Hoạt động", tone: "home-tone-success" },
  TERMINATED: { label: "Đã chấm dứt", tone: "home-tone-danger" },
  EXPIRED: { label: "Hết hạn", tone: "home-tone-info" },
  PAUSED: { label: "Tạm dừng", tone: "home-tone-warning" },
  DRAFT: { label: "Nháp", tone: "home-tone-info" },
};

const getBadge = (status) => {
  const s = String(status).toUpperCase().trim();
  for (const [key, config] of Object.entries(statusConfig)) {
    if (s.includes(key)) return config;
  }
  return { label: status || "UNKNOWN", tone: "home-tone-info" };
};

const fmtDate = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const fmtMoney = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("vi-VN") + " đ";
};

const unwrap = (res) => {
  const list = res?.result ?? res?.data?.result ?? res?.data ?? res;
  return Array.isArray(list) ? list : [];
};

const statusFilters = ["ALL", "PENDING_SIGNATURE", "PENDING_PAYMENT", "ACTIVE", "TERMINATED", "EXPIRED"];

const AdminContracts = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Hợp đồng");
  const [loading, setLoading] = useState(false);
  const [contracts, setContracts] = useState([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminGetAllContracts();
      setContracts(unwrap(res));
    } catch (e) {
      console.error("Load contracts failed:", e);
      setContracts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = contracts;
    if (statusFilter !== "ALL") {
      list = list.filter((c) => String(c?.status).toUpperCase().includes(statusFilter));
    }
    const kw = q.trim().toLowerCase();
    if (kw) {
      list = list.filter((c) =>
        [c?.id, c?.tenantId, c?.landlordId, c?.propertyId, c?.bookingId, String(c?.status)]
          .filter(Boolean).join(" ").toLowerCase().includes(kw)
      );
    }
    return list;
  }, [contracts, q, statusFilter]);

  const stats = useMemo(() => ({
    total: contracts.length,
    active: contracts.filter((c) => String(c?.status).toUpperCase().includes("ACTIVE")).length,
    pending: contracts.filter((c) => String(c?.status).toUpperCase().includes("PENDING")).length,
    terminated: contracts.filter((c) => String(c?.status).toUpperCase().includes("TERMINATED")).length,
  }), [contracts]);

  return (
    <div className="home-v2 home-shell-bg min-h-screen">
      <AdminSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} pageTitle="Quản lý hợp đồng" pageSubtitle="Theo dõi tất cả hợp đồng thuê nhà trong hệ thống" />
        <main className="w-full px-4 pt-6 pb-8 md:px-8">
          {/* KPI */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={FileText} label="Tổng hợp đồng" value={stats.total} color="blue" />
            <StatCard icon={CheckCircle2} label="Đang hoạt động" value={stats.active} color="green" />
            <StatCard icon={FileText} label="Chờ xử lý" value={stats.pending} color="orange" />
            <StatCard icon={XCircle} label="Đã chấm dứt" value={stats.terminated} color="red" />
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 home-text-muted" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo ID, tenant, landlord..." className="home-input pl-9 w-full" />
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
              <div className="apple-glass-soft home-text-muted rounded-2xl border-dashed p-8 text-center">Không có hợp đồng nào</div>
            ) : (
              <div className="space-y-2">
                {/* Header */}
                <div className="apple-glass-soft rounded-xl px-4 py-3 hidden md:grid md:grid-cols-12 text-xs font-semibold home-text-muted uppercase tracking-wider">
                  <span className="col-span-2">Mã HĐ</span>
                  <span className="col-span-2">Tenant ID</span>
                  <span className="col-span-2">Landlord ID</span>
                  <span className="col-span-1">Giá thuê</span>
                  <span className="col-span-2">Thời hạn</span>
                  <span className="col-span-1">Ký tên</span>
                  <span className="col-span-2 text-right">Trạng thái</span>
                </div>

                {filtered.map((c) => {
                  const badge = getBadge(c?.status);
                  return (
                    <div key={c?.id} className="apple-glass-table-row rounded-xl px-4 py-3.5 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-0 items-center">
                      <div className="col-span-2">
                        <p className="home-text-primary font-semibold text-sm truncate">{c?.id?.slice(0, 8)}...</p>
                      </div>
                      <span className="col-span-2 home-text-muted text-sm truncate">{c?.tenantId?.slice(0, 12)}...</span>
                      <span className="col-span-2 home-text-muted text-sm truncate">{c?.landlordId?.slice(0, 12)}...</span>
                      <span className="col-span-1 home-text-accent font-semibold text-sm">{fmtMoney(c?.monthlyRent)}</span>
                      <div className="col-span-2 text-xs home-text-muted">
                        <span>{fmtDate(c?.startDate)}</span>
                        <span className="mx-1">→</span>
                        <span>{fmtDate(c?.endDate)}</span>
                      </div>
                      <div className="col-span-1 flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${c?.tenantSigned ? "bg-green-500" : "bg-gray-300"}`} title="Tenant" />
                        <span className={`w-2 h-2 rounded-full ${c?.landlordSigned ? "bg-green-500" : "bg-gray-300"}`} title="Landlord" />
                        <span className="text-[10px] home-text-muted">{c?.tenantSigned && c?.landlordSigned ? "Đã ký" : "Chưa"}</span>
                      </div>
                      <div className="col-span-2 flex items-center gap-2 justify-end">
                        <span className={`${badge.tone} rounded-full border px-2.5 py-1 text-xs font-semibold`}>{badge.label}</span>
                        {c?.pdfUrl && (
                          <a href={c.pdfUrl} target="_blank" rel="noopener noreferrer" className="apple-glass-pill flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold home-text-accent">
                            <Eye className="w-3.5 h-3.5" /> PDF
                          </a>
                        )}
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

export default AdminContracts;
