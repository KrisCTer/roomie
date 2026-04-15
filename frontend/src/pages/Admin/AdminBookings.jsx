/* SEO_META: title="Roomie Admin - Bookings"; name="description"; property="og:title" */
import React, { useEffect, useMemo, useState } from "react";
import { CalendarCheck, Search, XCircle, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";

import AdminSidebar from "../../components/layout/layoutAdmin/AdminSidebar";
import Header from "../../components/layout/layoutUser/Header";
import Footer from "../../components/layout/layoutUser/Footer";
import StatCard from "../../components/domain/dashboard/StatCard";
import { useDialog } from "../../contexts/DialogContext";

import {
  adminGetAllBookings,
  adminForceCancelBooking,
} from "../../services/adminBookingService";

import "../../styles/apple-glass-dashboard.css";
import "../../styles/home-redesign.css";

const statusConfig = {
  PENDING_APPROVAL: { label: "Chờ duyệt", tone: "home-tone-warning" },
  ACTIVE: { label: "Hoạt động", tone: "home-tone-success" },
  CONFIRMED: { label: "Xác nhận", tone: "home-tone-success" },
  TERMINATED: { label: "Đã hủy", tone: "home-tone-danger" },
  CANCELLED: { label: "Đã hủy", tone: "home-tone-danger" },
  REJECTED: { label: "Từ chối", tone: "home-tone-danger" },
  EXPIRED: { label: "Hết hạn", tone: "home-tone-info" },
  PAUSED: { label: "Tạm dừng", tone: "home-tone-warning" },
  RENEWED: { label: "Gia hạn", tone: "home-tone-info" },
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

const statusFilters = ["ALL", "PENDING_APPROVAL", "ACTIVE", "TERMINATED", "EXPIRED", "PAUSED"];

const AdminBookings = () => {
  const navigate = useNavigate();
  const { showToast, showConfirm } = useDialog();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Đặt phòng");
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [actionId, setActionId] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      const res = await adminGetAllBookings();
      setBookings(unwrap(res));
    } catch (e) {
      console.error("Load bookings failed:", e);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    let list = bookings;
    if (statusFilter !== "ALL") {
      list = list.filter((b) => String(b?.status).toUpperCase().includes(statusFilter));
    }
    const kw = q.trim().toLowerCase();
    if (kw) {
      list = list.filter((b) =>
        [b?.id, b?.tenantId, b?.landlordId, b?.propertyId, b?.bookingReference, b?.status]
          .filter(Boolean).join(" ").toLowerCase().includes(kw)
      );
    }
    return list;
  }, [bookings, q, statusFilter]);

  const stats = useMemo(() => ({
    total: bookings.length,
    active: bookings.filter((b) => String(b?.status).toUpperCase().includes("ACTIVE")).length,
    pending: bookings.filter((b) => String(b?.status).toUpperCase().includes("PENDING")).length,
    terminated: bookings.filter((b) => ["TERMINATED", "CANCELLED"].some(s => String(b?.status).toUpperCase().includes(s))).length,
  }), [bookings]);

  const handleForceCancel = async (b) => {
    const confirmed = await showConfirm({
      title: "Hủy đặt phòng",
      message: `Xác nhận hủy booking #${b?.bookingReference || b?.id}?`,
      confirmText: "Hủy booking",
      cancelText: "Quay lại",
      type: "danger",
    });
    if (!confirmed) return;
    try {
      setActionId(b.id);
      await adminForceCancelBooking(b.id);
      showToast("Đã hủy booking thành công", "success");
      await load();
    } catch (e) {
      console.error("Force cancel failed:", e);
      showToast("Hủy booking thất bại", "error");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="home-v2 home-shell-bg min-h-screen">
      <AdminSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} pageTitle="Quản lý đặt phòng" pageSubtitle="Theo dõi và quản lý tất cả booking trong hệ thống" />
        <main className="w-full px-4 pt-6 pb-8 md:px-8">
          {/* KPI */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={CalendarCheck} label="Tổng booking" value={stats.total} color="blue" />
            <StatCard icon={CalendarCheck} label="Đang hoạt động" value={stats.active} color="green" />
            <StatCard icon={CalendarCheck} label="Chờ duyệt" value={stats.pending} color="orange" />
            <StatCard icon={CalendarCheck} label="Đã hủy" value={stats.terminated} color="red" />
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 home-text-muted" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo ID, tenant, property..." className="home-input pl-9 w-full" />
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
              <div className="apple-glass-soft home-text-muted rounded-2xl border-dashed p-8 text-center">Không có booking nào</div>
            ) : (
              <div className="space-y-2">
                {/* Header */}
                <div className="apple-glass-soft rounded-xl px-4 py-3 hidden md:grid md:grid-cols-12 text-xs font-semibold home-text-muted uppercase tracking-wider">
                  <span className="col-span-2">Mã booking</span>
                  <span className="col-span-2">Tenant ID</span>
                  <span className="col-span-2">Property ID</span>
                  <span className="col-span-1">Giá thuê</span>
                  <span className="col-span-2">Thời gian</span>
                  <span className="col-span-1">Trạng thái</span>
                  <span className="col-span-2 text-right">Hành động</span>
                </div>

                {filtered.map((b) => {
                  const badge = getBadge(b?.status);
                  const busy = actionId === b?.id;
                  return (
                    <div key={b?.id} className="apple-glass-table-row rounded-xl px-4 py-3.5 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-0 items-center">
                      <div className="col-span-2">
                        <p className="home-text-primary font-semibold text-sm truncate">{b?.bookingReference || b?.id?.slice(0, 8)}</p>
                        <p className="text-[10px] home-text-muted truncate">{b?.id}</p>
                      </div>
                      <span className="col-span-2 home-text-muted text-sm truncate">{b?.tenantId?.slice(0, 12)}...</span>
                      <span className="col-span-2 home-text-muted text-sm truncate">{b?.propertyId?.slice(0, 12)}...</span>
                      <span className="col-span-1 home-text-accent font-semibold text-sm">{fmtMoney(b?.monthlyRent)}</span>
                      <div className="col-span-2 text-xs home-text-muted">
                        <span>{fmtDate(b?.leaseStart)}</span>
                        <span className="mx-1">→</span>
                        <span>{fmtDate(b?.leaseEnd)}</span>
                      </div>
                      <span className="col-span-1">
                        <span className={`${badge.tone} rounded-full border px-2.5 py-1 text-xs font-semibold`}>{badge.label}</span>
                      </span>
                      <div className="col-span-2 flex items-center gap-2 justify-end">
                        <button type="button" onClick={() => navigate(`/property/${b?.propertyId}`)} className="apple-glass-pill flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold home-text-accent">
                          <Eye className="w-3.5 h-3.5" /> Xem
                        </button>
                        {!["TERMINATED", "CANCELLED", "EXPIRED"].some(s => String(b?.status).toUpperCase().includes(s)) && (
                          <button type="button" onClick={() => handleForceCancel(b)} disabled={busy}
                            className={`apple-glass-pill flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition ${busy ? "opacity-40 cursor-not-allowed" : "text-red-600 hover:bg-red-50"}`}
                          >
                            <XCircle className="w-3.5 h-3.5" /> Hủy
                          </button>
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

export default AdminBookings;
