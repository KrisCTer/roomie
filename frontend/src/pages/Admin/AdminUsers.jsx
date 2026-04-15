/* SEO_META: title="Roomie Admin - Users"; name="description"; property="og:title" */
import React, { useEffect, useMemo, useState } from "react";
import { Ban, PauseCircle, Search, Users, CheckCircle2, AlertCircle, UserX } from "lucide-react";

import AdminSidebar from "../../components/layout/layoutAdmin/AdminSidebar";
import Header from "../../components/layout/layoutUser/Header";
import Footer from "../../components/layout/layoutUser/Footer";
import StatCard from "../../components/domain/dashboard/StatCard";
import { useTranslation } from "react-i18next";
import { useDialog } from "../../contexts/DialogContext";

import {
  adminGetUsers,
  adminSuspendUser,
  adminBanUser,
} from "../../services/adminUserService";
import {
  removeToken,
  removeUserProfile,
} from "../../services/localStorageService";

import "../../styles/apple-glass-dashboard.css";
import "../../styles/home-redesign.css";

const unwrapList = (res) => {
  const candidates = [res?.result, res?.data?.result, res?.data, res];
  for (const c of candidates) if (Array.isArray(c)) return c;
  return [];
};

const getUserId = (u) => u?.id ?? u?._id ?? u?.userId ?? u?.uuid ?? null;

const getStatus = (u) =>
  String(u?.status ?? u?.state ?? u?.accountStatus ?? "UNKNOWN").toUpperCase();

const isAdminUser = (u) => u?.username?.toLowerCase() === "admin";

const statusConfig = {
  BAN: { label: "Bị cấm", tone: "home-tone-danger" },
  SUSPEND: { label: "Tạm khóa", tone: "home-tone-warning" },
  ACTIVE: { label: "Hoạt động", tone: "home-tone-success" },
};

const getBadge = (status) => {
  const s = String(status).toUpperCase();
  for (const [key, config] of Object.entries(statusConfig)) {
    if (s.includes(key)) return config;
  }
  return { label: status || "UNKNOWN", tone: "home-tone-info" };
};

const statusFilters = ["ALL", "ACTIVE", "SUSPEND", "BAN"];

const AdminUsers = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Người dùng");

  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { t } = useTranslation();
  const { showToast, showConfirm } = useDialog();

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminGetUsers();
      const list = unwrapList(res).filter((u) => !isAdminUser(u));
      setUsers(list);
    } catch (e) {
      console.error("Load users failed:", e);
      if (e?.response?.status === 401) {
        removeToken();
        removeUserProfile();
        showToast("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.", "warning");
        window.location.href = "/login";
        return;
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  const filtered = useMemo(() => {
    let list = users;
    if (statusFilter !== "ALL") {
      list = list.filter((u) => getStatus(u).includes(statusFilter));
    }
    const kw = q.trim().toLowerCase();
    if (kw) {
      list = list.filter((u) =>
        [u?.username, u?.email, getStatus(u), getUserId(u)]
          .filter(Boolean).join(" ").toLowerCase().includes(kw)
      );
    }
    return list;
  }, [q, users, statusFilter]);

  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter((u) => getStatus(u).includes("ACTIVE")).length,
    suspended: users.filter((u) => getStatus(u).includes("SUSPEND")).length,
    banned: users.filter((u) => getStatus(u).includes("BAN")).length,
  }), [users]);

  const handleSuspend = async (u) => {
    const id = getUserId(u);
    if (!id) return;
    const confirmed = await showConfirm({
      title: t("admin.suspend"),
      message: t("admin.confirmSuspend", { name: u?.username ?? id }),
      confirmText: t("admin.suspend"),
      cancelText: t("common.cancel", "Hủy"),
      type: "warning",
    });
    if (!confirmed) return;
    try {
      setActionLoadingId(id);
      await adminSuspendUser(id);
      await loadUsers();
    } catch (e) {
      console.error("Suspend failed:", e);
      showToast(t("admin.suspendFailed"), "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBan = async (u) => {
    const id = getUserId(u);
    if (!id) return;
    const confirmed = await showConfirm({
      title: t("admin.ban"),
      message: t("admin.confirmBan", { name: u?.username ?? id }),
      confirmText: t("admin.ban"),
      cancelText: t("common.cancel", "Hủy"),
      type: "danger",
    });
    if (!confirmed) return;
    try {
      setActionLoadingId(id);
      await adminBanUser(id);
      await loadUsers();
    } catch (e) {
      console.error("Ban failed:", e);
      showToast(t("admin.banFailed"), "error");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="home-v2 home-shell-bg min-h-screen">
      <AdminSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} pageTitle="Quản lý người dùng" pageSubtitle="Theo dõi và quản lý tài khoản người dùng" />
        <main className="w-full px-4 pt-6 pb-8 md:px-8">
          {/* KPI */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Users} label="Tổng người dùng" value={stats.total} color="blue" />
            <StatCard icon={CheckCircle2} label="Đang hoạt động" value={stats.active} color="green" />
            <StatCard icon={PauseCircle} label="Tạm khóa" value={stats.suspended} color="orange" />
            <StatCard icon={UserX} label="Bị cấm" value={stats.banned} color="red" />
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 home-text-muted" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm theo username, email, ID..." className="home-input pl-9 w-full" />
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

          {/* User List */}
          <section className="apple-glass-panel no-hover rounded-2xl p-6">
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="apple-glass-soft animate-pulse flex items-center gap-4 rounded-xl p-4">
                    <div className="w-10 h-10 rounded-full" style={{ background: "var(--home-surface-soft)" }} />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 rounded w-2/4" style={{ background: "var(--home-surface-soft)" }} />
                      <div className="h-3 rounded w-1/3" style={{ background: "var(--home-surface-soft)" }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="apple-glass-soft home-text-muted rounded-2xl border-dashed p-8 text-center">Không có người dùng nào</div>
            ) : (
              <div className="space-y-2">
                {/* Header */}
                <div className="apple-glass-soft rounded-xl px-4 py-3 hidden md:grid md:grid-cols-12 text-xs font-semibold home-text-muted uppercase tracking-wider">
                  <span className="col-span-1">#</span>
                  <span className="col-span-3">Username</span>
                  <span className="col-span-3">Email</span>
                  <span className="col-span-2">Trạng thái</span>
                  <span className="col-span-3">Hành động</span>
                </div>

                {/* Rows */}
                {filtered.map((u, idx) => {
                  const id = getUserId(u);
                  const status = getStatus(u);
                  const busy = actionLoadingId === id;
                  const badge = getBadge(status);

                  return (
                    <div key={id ?? idx} className="apple-glass-table-row rounded-xl px-4 py-3.5 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-0 items-center">
                      <span className="col-span-1 home-text-muted text-sm hidden md:block">{idx + 1}</span>
                      <div className="col-span-3">
                        <p className="home-text-primary font-semibold">{u?.username}</p>
                        <p className="text-xs home-text-muted truncate">{id}</p>
                      </div>
                      <span className="col-span-3 home-text-muted truncate">{u?.email ?? "—"}</span>
                      <span className="col-span-2">
                        <span className={`${badge.tone} rounded-full border px-2.5 py-1 text-xs font-semibold`}>{badge.label}</span>
                      </span>
                      <div className="col-span-3 flex items-center gap-2">
                        <button type="button" onClick={() => handleSuspend(u)} disabled={busy}
                          className={`apple-glass-pill flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${busy ? "opacity-40 cursor-not-allowed" : "text-amber-700 hover:bg-amber-50"}`}
                        >
                          <PauseCircle className="w-3.5 h-3.5" /> Tạm khóa
                        </button>
                        <button type="button" onClick={() => handleBan(u)} disabled={busy}
                          className={`apple-glass-pill flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${busy ? "opacity-40 cursor-not-allowed" : "text-red-600 hover:bg-red-50"}`}
                        >
                          <Ban className="w-3.5 h-3.5" /> Cấm
                        </button>
                        {busy && <span className="text-xs home-text-muted">Đang xử lý...</span>}
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

export default AdminUsers;
