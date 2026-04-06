/* SEO_META: title="Roomie"; name="description"; property="og:title"; property="og:description"; property="og:type" */
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  RefreshCw,
  Search,
  Eye,
  Users,
  Home,
  Sparkles,
  Building2,
  ArrowRight,
} from "lucide-react";
import StatCard from "../../components/domain/dashboard/StatCard";

import AdminSidebar from "../../components/layout/layoutAdmin/AdminSidebar";
import Header from "../../components/layout/layoutUser/Header";
import Footer from "../../components/layout/layoutUser/Footer";

import { adminGetAllProperties } from "../../services/adminPropertyService";
import { adminGetUsers } from "../../services/adminUserService";
import {
  removeToken,
  removeUserProfile,
} from "../../services/localStorageService";
import { useTranslation } from "react-i18next";

import "../../styles/apple-glass-dashboard.css";
import "../../styles/home-redesign.css";

/* =========================
   Helpers
========================= */

const safeJson = (v) => {
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
};

const resolveUsername = () => {
  const ui = safeJson(localStorage.getItem("userInfo") || "{}");
  if (ui?.username) return ui.username;

  const auth = safeJson(localStorage.getItem("auth") || "{}");
  if (auth?.user?.username) return auth.user.username;
  if (auth?.username) return auth.username;

  const raw =
    localStorage.getItem("username") ||
    localStorage.getItem("user_name") ||
    localStorage.getItem("currentUser");
  if (!raw) return "";

  const parsed = safeJson(raw);
  return parsed?.username || raw;
};

const formatAddress = (addr) => {
  if (!addr) return "";
  if (typeof addr === "string") return addr;

  const parts = [
    addr.fullAddress,
    addr.houseNumber,
    addr.street,
    addr.ward,
    addr.district,
    addr.province,
  ].filter(Boolean);

  return addr.fullAddress || parts.join(", ");
};

const normalizeProperties = (res) => {
  const list = Array.isArray(res)
    ? res
    : Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res?.result)
        ? res.result
        : [];

  return list.map((p) => ({
    ...p,
    status:
      p?.status ?? p?.propertyStatus ?? p?.approvalStatus ?? p?.state ?? "",
  }));
};

const getPropertyId = (p) => p?.propertyId ?? p?.id ?? p?._id ?? null;

const getPropertyStatus = (p) =>
  String(p?.status ?? p?.propertyStatus ?? p?.approvalStatus ?? p?.state ?? "")
    .toUpperCase()
    .trim();

const pickImage = (p) => {
  const direct = p?.thumbnail || p?.image || p?.coverImage;
  if (typeof direct === "string" && direct) return direct;

  const img1 = p?.images?.[0];
  if (typeof img1 === "string" && img1) return img1;
  if (img1?.url) return img1.url;

  const m1 = p?.mediaList?.[0];
  if (typeof m1 === "string" && m1) return m1;
  if (m1?.url) return m1.url;
  if (m1?.link) return m1.link;
  if (m1?.path) return m1.path;

  return "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400";
};

const fmtMoney = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return "-";
  return n.toLocaleString("vi-VN");
};

const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "";
  return dt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const statusConfig = {
  PENDING: { label: "Chờ duyệt", tone: "home-tone-warning" },
  APPROVED: { label: "Đã duyệt", tone: "home-tone-success" },
  ACTIVE: { label: "Hoạt động", tone: "home-tone-success" },
  REJECTED: { label: "Từ chối", tone: "home-tone-danger" },
  DENIED: { label: "Từ chối", tone: "home-tone-danger" },
  DRAFT: { label: "Nháp", tone: "home-tone-info" },
};

const getStatusBadge = (status) => {
  const s = String(status).toUpperCase();
  for (const [key, config] of Object.entries(statusConfig)) {
    if (s.includes(key)) return config;
  }
  return { label: status || "UNKNOWN", tone: "home-tone-info" };
};

const unwrapUsers = (res) => {
  const list = res?.result ?? res?.data?.result ?? res?.data ?? res;
  return Array.isArray(list) ? list : [];
};

const getUserId = (u) => u?.id ?? u?._id ?? u?.userId ?? u?.uuid ?? "-";
const getUserStatus = (u) =>
  String(u?.status ?? u?.state ?? "UNKNOWN").toUpperCase();

/* =========================
   Component
========================= */

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Admin Dashboard");
  const [loading, setLoading] = useState(false);
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchProperty, setSearchProperty] = useState("");
  const [searchUser, setSearchUser] = useState("");

  const username = useMemo(() => resolveUsername(), []);
  const isAdmin = String(username).toLowerCase() === "admin";

  const loadAll = async () => {
    try {
      setLoading(true);
      const [pRes, uRes] = await Promise.all([
        adminGetAllProperties(),
        adminGetUsers(),
      ]);
      setProperties(normalizeProperties(pRes));
      const uList = unwrapUsers(uRes);
      setUsers(
        (uList || []).filter((u) => u?.username?.toLowerCase() !== "admin"),
      );
    } catch (e) {
      console.error("AdminDashboard load failed:", e);
      if (e?.response?.status === 401) {
        removeToken();
        removeUserProfile();
        window.location.href = "/login";
        return;
      }
      setProperties([]);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const filteredProperties = useMemo(() => {
    const q = searchProperty.trim().toLowerCase();
    if (!q) return properties;
    return properties.filter((p) =>
      [
        p?.title,
        getPropertyStatus(p),
        formatAddress(p?.address),
        p?.province,
        p?.ownerName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [searchProperty, properties]);

  const filteredUsers = useMemo(() => {
    const q = searchUser.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u?.username, u?.email, getUserStatus(u), getUserId(u)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [searchUser, users]);

  /* ==================== Summary Stats ==================== */
  const summaryStats = useMemo(() => {
    const total = properties.length;
    const pending = properties.filter((p) =>
      getPropertyStatus(p).includes("PENDING"),
    ).length;
    const approved = properties.filter(
      (p) =>
        getPropertyStatus(p).includes("APPROVED") ||
        getPropertyStatus(p).includes("ACTIVE"),
    ).length;
    return { total, pending, approved, totalUsers: users.length };
  }, [properties, users]);

  if (!isAdmin) {
    return (
      <div className="home-v2 home-shell-bg min-h-screen flex items-center justify-center">
        <div className="apple-glass-panel rounded-2xl p-8 text-center">
          <p className="home-text-primary text-lg font-semibold">
            {t("admin.unauthorized")}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="home-v2 home-shell-bg min-h-screen">
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      <div
        className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}
      >
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          pageTitle="Bảng điều khiển quản trị"
          pageSubtitle="Theo dõi nhanh bất động sản, người dùng và trạng thái hệ thống"
        />

        <main className="w-full px-4 pb-8 md:px-8">
          {/* ===== Summary KPI Cards ===== */}
          <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={Building2}
              label="Tổng BĐS"
              value={summaryStats.total}
              color="blue"
            />
            <StatCard
              icon={Sparkles}
              label="Chờ duyệt"
              value={summaryStats.pending}
              color="orange"
            />
            <StatCard
              icon={Home}
              label="Đã duyệt"
              value={summaryStats.approved}
              color="green"
            />
            <StatCard
              icon={Users}
              label="Người dùng"
              value={summaryStats.totalUsers}
              color="teal"
            />
          </div>

          {/* ===== PROPERTIES Section ===== */}
          <section className="apple-glass-panel no-hover rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div>
                <p className="home-text-accent text-xs font-semibold uppercase tracking-[0.12em]">
                  Property Management
                </p>
                <h2 className="home-text-primary text-xl font-bold">
                  {t("admin.properties")}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 home-text-muted" />
                  <input
                    value={searchProperty}
                    onChange={(e) => setSearchProperty(e.target.value)}
                    placeholder={t("admin.searchProperties")}
                    className="home-input pl-9 w-full md:w-[320px]"
                  />
                </div>

                <button
                  onClick={loadAll}
                  disabled={loading}
                  className="apple-glass-pill flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold home-text-accent hover:bg-white disabled:opacity-60"
                  type="button"
                >
                  <RefreshCw
                    className={loading ? "w-4 h-4 animate-spin" : "w-4 h-4"}
                  />
                  {t("admin.refresh")}
                </button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="apple-glass-soft animate-pulse flex items-center gap-4 rounded-xl p-4"
                  >
                    <div
                      className="w-24 h-16 rounded-xl"
                      style={{ background: "var(--home-surface-soft)" }}
                    />
                    <div className="flex-1 space-y-2">
                      <div
                        className="h-4 rounded w-3/4"
                        style={{ background: "var(--home-surface-soft)" }}
                      />
                      <div
                        className="h-3 rounded w-1/2"
                        style={{ background: "var(--home-surface-soft)" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredProperties.length === 0 ? (
              <div className="apple-glass-soft home-text-muted rounded-2xl border-dashed p-8 text-center">
                {t("admin.noProperties")}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProperties.map((p) => {
                  const id = getPropertyId(p);
                  const title = p?.title ?? t("common.noData");
                  const status = getPropertyStatus(p);
                  const img = pickImage(p);
                  const badge = getStatusBadge(status);

                  const created =
                    p?.createdAt ??
                    p?.createdDate ??
                    p?.postedAt ??
                    p?.updatedAt ??
                    null;

                  const price =
                    p?.monthlyRent ??
                    p?.price ??
                    p?.rentalPrice ??
                    p?.monthlyPrice ??
                    null;

                  const addr =
                    formatAddress(p?.address) ||
                    [
                      p?.houseNumber,
                      p?.street,
                      p?.ward,
                      p?.district,
                      p?.province,
                    ]
                      .filter(Boolean)
                      .join(", ");

                  return (
                    <div
                      key={id || title}
                      className="apple-glass-table-row flex items-center gap-4 rounded-2xl p-4"
                    >
                      {/* Thumbnail */}
                      <div className="w-24 h-16 rounded-xl overflow-hidden apple-glass-soft flex-shrink-0">
                        <img
                          src={img}
                          alt={title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400";
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <span className="home-text-primary font-semibold text-lg truncate">
                            {title}
                          </span>
                          <span
                            className={`${badge.tone} rounded-full border px-3 py-1 text-xs font-semibold`}
                          >
                            {badge.label}
                          </span>
                        </div>

                        <div className="mt-1 text-sm flex flex-wrap items-center gap-x-4 gap-y-1">
                          {created && (
                            <span className="home-text-muted">
                              {fmtDate(created)}
                            </span>
                          )}
                          {price !== null && (
                            <span className="home-text-accent font-semibold">
                              {fmtMoney(price)}{" "}
                              {t("common.currency", { defaultValue: "VND" })}
                            </span>
                          )}
                          {addr && (
                            <span className="home-text-muted truncate max-w-[600px]">
                              {addr}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action */}
                      <button
                        onClick={() => id && navigate(`/property/${id}`)}
                        className="apple-glass-pill flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold home-text-accent hover:bg-white"
                        title={t("admin.view")}
                        type="button"
                      >
                        <Eye className="w-4 h-4" />
                        <span className="hidden md:inline">Xem</span>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* ===== USERS Section ===== */}
          <section className="apple-glass-panel no-hover rounded-2xl p-6 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div>
                <p className="home-text-accent text-xs font-semibold uppercase tracking-[0.12em]">
                  User Management
                </p>
                <h2 className="home-text-primary text-xl font-bold">
                  {t("admin.users")}
                </h2>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 home-text-muted" />
                <input
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder={t("admin.searchUsers")}
                  className="home-input pl-9 w-full md:w-[280px]"
                />
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="apple-glass-soft animate-pulse flex items-center gap-4 rounded-xl p-4"
                  >
                    <div
                      className="w-10 h-10 rounded-full"
                      style={{ background: "var(--home-surface-soft)" }}
                    />
                    <div className="flex-1 space-y-2">
                      <div
                        className="h-4 rounded w-2/4"
                        style={{ background: "var(--home-surface-soft)" }}
                      />
                      <div
                        className="h-3 rounded w-1/3"
                        style={{ background: "var(--home-surface-soft)" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="apple-glass-soft home-text-muted rounded-2xl border-dashed p-8 text-center">
                {t("admin.noUsers")}
              </div>
            ) : (
              <div className="space-y-2">
                {/* Table Header */}
                <div className="apple-glass-soft rounded-xl px-4 py-3 grid grid-cols-3 text-xs font-semibold home-text-muted uppercase tracking-wider">
                  <span>{t("auth.username")}</span>
                  <span>{t("auth.email")}</span>
                  <span className="text-right">{t("common.status")}</span>
                </div>

                {/* Table Rows */}
                {filteredUsers.map((u) => {
                  const uStatus = getUserStatus(u);
                  const uBadge = getStatusBadge(uStatus);

                  return (
                    <div
                      key={getUserId(u)}
                      className="apple-glass-table-row rounded-xl px-4 py-3.5 grid grid-cols-3 items-center"
                    >
                      <span className="home-text-primary font-semibold truncate">
                        {u?.username || "-"}
                      </span>
                      <span className="home-text-muted truncate">
                        {u?.email || "-"}
                      </span>
                      <span className="text-right">
                        <span
                          className={`${uBadge.tone} rounded-full border px-3 py-1 text-xs font-semibold`}
                        >
                          {uBadge.label}
                        </span>
                      </span>
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

export default AdminDashboard;
