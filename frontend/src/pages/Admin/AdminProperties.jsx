/* SEO_META: title="Roomie Admin - Properties"; name="description"; property="og:title" */
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, Check, X, Search, Building2, Sparkles, Home, XCircle } from "lucide-react";

import AdminSidebar from "../../components/layout/layoutAdmin/AdminSidebar";
import Header from "../../components/layout/layoutUser/Header";
import Footer from "../../components/layout/layoutUser/Footer";
import StatCard from "../../components/domain/dashboard/StatCard";
import { useTranslation } from "react-i18next";
import { useDialog } from "../../contexts/DialogContext";
import {
  removeToken,
  removeUserProfile,
} from "../../services/localStorageService";

import {
  adminGetAllProperties,
  adminApproveProperty,
  adminRejectProperty,
} from "../../services/adminPropertyService";

import "../../styles/apple-glass-dashboard.css";
import "../../styles/home-redesign.css";

const safeJson = (v) => { try { return JSON.parse(v); } catch { return null; } };

const resolveUsername = () => {
  const ui = safeJson(localStorage.getItem("userInfo") || "{}");
  if (ui?.username) return ui.username;
  const auth = safeJson(localStorage.getItem("auth") || "{}");
  if (auth?.user?.username) return auth.user.username;
  if (auth?.username) return auth.username;
  const direct = localStorage.getItem("username") || localStorage.getItem("user_name") || localStorage.getItem("currentUser");
  if (direct) { const d = safeJson(direct); if (d?.username) return d.username; return direct; }
  return "";
};

const normalizeList = (res) => {
  const list = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : Array.isArray(res?.result) ? res.result : [];
  return list.map((p) => ({ ...p, status: p?.status ?? p?.propertyStatus ?? p?.approvalStatus ?? p?.state }));
};

const getStatus = (p) => String(p?.status ?? "").toUpperCase().trim();

const statusConfig = {
  PENDING: { label: "Chờ duyệt", tone: "home-tone-warning" },
  APPROVED: { label: "Đã duyệt", tone: "home-tone-success" },
  ACTIVE: { label: "Đã duyệt", tone: "home-tone-success" },
  REJECTED: { label: "Từ chối", tone: "home-tone-danger" },
  DENIED: { label: "Từ chối", tone: "home-tone-danger" },
};

const getBadge = (status) => {
  const s = String(status).toUpperCase();
  for (const [key, config] of Object.entries(statusConfig)) {
    if (s.includes(key)) return config;
  }
  return { label: status || "UNKNOWN", tone: "home-tone-info" };
};

const fmtMoney = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return v ?? "";
  return n.toLocaleString("vi-VN");
};

const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const pickImage = (p) => {
  const m = p?.mediaList?.[0];
  if (!m) return "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400";
  if (typeof m === "string") return m;
  return m?.url || m?.link || m?.path || "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400";
};

const formatAddress = (addr) => {
  if (!addr) return "";
  if (typeof addr === "string") return addr;
  const parts = [addr.fullAddress, addr.houseNumber, addr.street, addr.ward, addr.district, addr.province].filter(Boolean);
  return addr.fullAddress || parts.join(", ");
};

const statusFilters = ["ALL", "PENDING", "APPROVED", "REJECTED"];

const AdminProperties = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Bất động sản");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const username = useMemo(() => resolveUsername(), []);
  const isAdmin = String(username).toLowerCase() === "admin";
  const { t } = useTranslation();
  const { showToast } = useDialog();

  const loadAll = async () => {
    try {
      setLoading(true);
      const res = await adminGetAllProperties();
      setProperties(normalizeList(res));
    } catch (e) {
      console.error("Load properties failed:", e);
      if (e?.response?.status === 401) {
        removeToken(); removeUserProfile();
        showToast("Phiên đăng nhập đã hết hạn.", "warning");
        window.location.href = "/login";
        return;
      }
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isAdmin) loadAll(); else setProperties([]); }, [isAdmin]);

  const filtered = useMemo(() => {
    let list = properties;
    if (statusFilter !== "ALL") {
      list = list.filter((p) => {
        const s = getStatus(p);
        if (statusFilter === "APPROVED") return s.includes("APPROVED") || s.includes("ACTIVE");
        if (statusFilter === "REJECTED") return s.includes("REJECT") || s.includes("DENIED");
        return s.includes(statusFilter);
      });
    }
    const kw = q.trim().toLowerCase();
    if (kw) {
      list = list.filter((p) =>
        [p?.title, p?.propertyId, p?.id, formatAddress(p?.address), String(p?.monthlyRent)]
          .filter(Boolean).join(" ").toLowerCase().includes(kw)
      );
    }
    return list;
  }, [properties, q, statusFilter]);

  const stats = useMemo(() => ({
    total: properties.length,
    pending: properties.filter((p) => getStatus(p).includes("PENDING")).length,
    approved: properties.filter((p) => getStatus(p).includes("APPROVED") || getStatus(p).includes("ACTIVE")).length,
    rejected: properties.filter((p) => getStatus(p).includes("REJECT") || getStatus(p).includes("DENIED")).length,
  }), [properties]);

  const handleApprove = async (id) => {
    try {
      await adminApproveProperty(id);
      showToast("Đã duyệt BĐS", "success");
      await loadAll();
    } catch (e) {
      console.error("Approve failed:", e);
      showToast("Duyệt thất bại", "error");
    }
  };

  const handleReject = async (id) => {
    try {
      await adminRejectProperty(id);
      showToast("Đã từ chối BĐS", "success");
      await loadAll();
    } catch (e) {
      console.error("Reject failed:", e);
      showToast("Từ chối thất bại", "error");
    }
  };

  return (
    <div className="home-v2 home-shell-bg min-h-screen">
      <AdminSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} pageTitle="Quản lý bất động sản" pageSubtitle="Theo dõi, duyệt và quản lý tất cả BĐS trong hệ thống" />
        <main className="w-full px-4 pt-6 pb-8 md:px-8">
          {!isAdmin ? (
            <div className="apple-glass-panel rounded-2xl p-8 text-center">
              <p className="home-text-primary text-lg font-semibold">{t("admin.unauthorized")}</p>
            </div>
          ) : (
            <>
              {/* KPI */}
              <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={Building2} label="Tổng BĐS" value={stats.total} color="blue" />
                <StatCard icon={Sparkles} label="Chờ duyệt" value={stats.pending} color="orange" />
                <StatCard icon={Home} label="Đã duyệt" value={stats.approved} color="green" />
                <StatCard icon={XCircle} label="Từ chối" value={stats.rejected} color="red" />
              </div>

              {/* Filters */}
              <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 home-text-muted" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo tiêu đề, địa chỉ, ID..." className="home-input pl-9 w-full" />
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {statusFilters.map((s) => (
                      <button key={s} type="button" onClick={() => setStatusFilter(s)}
                        className={`apple-glass-pill px-3 py-1.5 text-xs font-semibold transition ${statusFilter === s ? "home-text-accent ring-1 ring-[var(--home-accent)]" : "home-text-muted"}`}
                      >{s === "ALL" ? "Tất cả" : getBadge(s).label}</button>
                    ))}
                  </div>
                </div>
                <div className="apple-glass-pill rounded-full px-3 py-1.5 text-xs font-semibold home-text-muted">
                  Kết quả: <span className="home-text-primary">{filtered.length}</span>
                </div>
              </div>

              {/* Property List */}
              <section className="apple-glass-panel no-hover rounded-2xl p-6">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="apple-glass-soft animate-pulse flex items-center gap-4 rounded-xl p-4">
                        <div className="w-24 h-16 rounded-xl" style={{ background: "var(--home-surface-soft)" }} />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 rounded w-3/4" style={{ background: "var(--home-surface-soft)" }} />
                          <div className="h-3 rounded w-1/2" style={{ background: "var(--home-surface-soft)" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="apple-glass-soft home-text-muted rounded-2xl border-dashed p-8 text-center">Không có BĐS nào</div>
                ) : (
                  <div className="space-y-3">
                    {filtered.map((p) => {
                      const id = p?.propertyId || p?.id || p?._id;
                      const img = pickImage(p);
                      const title = p?.title ?? "—";
                      const status = getStatus(p);
                      const badge = getBadge(status);
                      const created = p?.createdAt ?? p?.createdDate ?? p?.postedAt ?? p?.updatedAt;
                      const price = p?.monthlyRent ?? p?.price ?? p?.rentalPrice ?? p?.monthlyPrice;
                      const addr = formatAddress(p?.address) || [p?.houseNumber, p?.street, p?.ward, p?.district, p?.province].filter(Boolean).join(", ");
                      const isPending = status.includes("PENDING");

                      return (
                        <div key={id} className="apple-glass-table-row flex items-center gap-4 rounded-2xl p-4">
                          {/* Thumbnail */}
                          <div className="w-24 h-16 rounded-xl overflow-hidden apple-glass-soft flex-shrink-0">
                            <img src={img} alt={title} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"; }} />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <span className="home-text-primary font-semibold text-lg truncate">{title}</span>
                              <span className={`${badge.tone} rounded-full border px-3 py-1 text-xs font-semibold`}>{badge.label}</span>
                            </div>
                            <div className="mt-1 text-sm flex flex-wrap items-center gap-x-4 gap-y-1">
                              {created && <span className="home-text-muted">{fmtDate(created)}</span>}
                              {price !== null && price !== undefined && (
                                <span className="home-text-accent font-semibold">{fmtMoney(price)} VND</span>
                              )}
                              {addr && <span className="home-text-muted truncate max-w-[400px]">{addr}</span>}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button type="button" onClick={() => navigate(`/property/${id}`)}
                              className="apple-glass-pill h-10 w-10 rounded-xl flex items-center justify-center home-text-muted hover:home-text-primary hover:bg-white" title="Xem"
                            >
                              <Eye size={18} />
                            </button>
                            {isPending && (
                              <>
                                <button type="button" onClick={() => handleApprove(id)}
                                  className="apple-glass-pill h-10 w-10 rounded-xl flex items-center justify-center text-emerald-600 hover:bg-emerald-50" title="Duyệt"
                                >
                                  <Check size={18} />
                                </button>
                                <button type="button" onClick={() => handleReject(id)}
                                  className="apple-glass-pill h-10 w-10 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50" title="Từ chối"
                                >
                                  <X size={18} />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </section>
            </>
          )}
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminProperties;
