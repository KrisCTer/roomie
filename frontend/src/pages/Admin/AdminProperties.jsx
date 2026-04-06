/* SEO_META: title="Roomie"; name="description"; property="og:title"; property="og:description"; property="og:type" */
// src/pages/Admin/AdminProperties.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminSidebar from "../../components/layout/layoutAdmin/AdminSidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
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

import { Eye, Check, X } from "lucide-react";

import "../../styles/apple-glass-dashboard.css";
import "../../styles/home-redesign.css";

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

  const direct =
    localStorage.getItem("username") ||
    localStorage.getItem("user_name") ||
    localStorage.getItem("currentUser");
  if (direct) {
    const dJson = safeJson(direct);
    if (dJson?.username) return dJson.username;
    return direct;
  }

  return "";
};

const normalizeList = (res) => {
  const list = Array.isArray(res)
    ? res
    : Array.isArray(res?.data)
      ? res.data
      : Array.isArray(res?.result)
        ? res.result
        : [];

  return list.map((p) => ({
    ...p,
    status: p?.status ?? p?.propertyStatus ?? p?.approvalStatus ?? p?.state,
  }));
};

const getStatus = (p) =>
  String(p?.status ?? "")
    .toUpperCase()
    .trim();

const fmtMoney = (v) => {
  const n = Number(v);
  if (Number.isNaN(n)) return v ?? "";
  return n.toLocaleString("vi-VN");
};

const fmtDate = (d) => {
  if (!d) return "";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return String(d);
  return dt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

const pickImage = (p) => {
  const m = p?.mediaList?.[0];
  if (!m)
    return "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400";
  if (typeof m === "string") return m;
  return (
    m?.url ||
    m?.link ||
    m?.path ||
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400"
  );
};

const AdminProperties = () => {
  const navigate = useNavigate();

  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Admin Properties");

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
        removeToken();
        removeUserProfile();
        showToast(
          "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.",
          "warning",
        );
        window.location.href = "/login";
        return;
      }
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) loadAll();
    else setProperties([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  const pendingProperties = useMemo(() => {
    return properties.filter((p) => getStatus(p) === "PENDING");
  }, [properties]);

  const handleView = (id) => navigate(`/property/${id}`);

  const handleApprove = async (id) => {
    try {
      await adminApproveProperty(id);
      setProperties((prev) =>
        prev.filter((p) => (p?.propertyId || p?.id || p?._id) !== id),
      );
    } catch (e) {
      console.error("Approve failed:", e);
      await loadAll();
    }
  };

  const handleReject = async (id) => {
    try {
      await adminRejectProperty(id);
      setProperties((prev) =>
        prev.filter((p) => (p?.propertyId || p?.id || p?._id) !== id),
      );
    } catch (e) {
      console.error("Reject failed:", e);
      await loadAll();
    }
  };

  return (
    <div className="home-v2 home-shell-bg min-h-screen">
      <AdminSidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div
        className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}
      >
        <Header
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          pageTitle={t("admin.pendingProperties")}
          pageSubtitle="Duyệt hoặc từ chối bất động sản đang chờ phê duyệt."
        />

        <main className="w-full px-4 pb-8 md:px-8">
          <section className="apple-glass-panel no-hover rounded-2xl p-6">
            {!isAdmin ? (
              <p className="home-text-muted">{t("admin.unauthorized")}</p>
            ) : loading ? (
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
            ) : pendingProperties.length === 0 ? (
              <div className="apple-glass-soft home-text-muted rounded-2xl border-dashed p-8 text-center">
                {t("admin.noPendingProperties")}
              </div>
            ) : (
              <div className="space-y-3">
                {pendingProperties.map((p) => {
                  const id = p?.propertyId || p?.id || p?._id;
                  const img = pickImage(p);
                  const title = p?.title ?? t("common.noData");
                  const created =
                    p?.createdAt ??
                    p?.createdDate ??
                    p?.postedAt ??
                    p?.updatedAt;
                  const price =
                    p?.monthlyRent ??
                    p?.price ??
                    p?.rentalPrice ??
                    p?.monthlyPrice;

                  return (
                    <div
                      key={id}
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
                          <span className="home-tone-warning rounded-full border px-3 py-1 text-xs font-semibold">
                            {t("admin.waitingApproval")}
                          </span>
                        </div>

                        <div className="mt-1 text-sm flex items-center gap-4">
                          <span className="home-text-muted">
                            {fmtDate(created)}
                          </span>
                          <span className="home-text-accent font-semibold">
                            {fmtMoney(price)}{" "}
                            {t("common.currency", { defaultValue: "VND" })}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleView(id)}
                          className="apple-glass-pill h-10 w-10 rounded-xl flex items-center justify-center home-text-muted hover:home-text-primary hover:bg-white"
                          title={t("common.view")}
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApprove(id)}
                          className="apple-glass-pill h-10 w-10 rounded-xl flex items-center justify-center text-emerald-600 hover:bg-emerald-50"
                          title={t("admin.approve")}
                        >
                          <Check size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReject(id)}
                          className="apple-glass-pill h-10 w-10 rounded-xl flex items-center justify-center text-red-500 hover:bg-red-50"
                          title={t("admin.reject")}
                        >
                          <X size={18} />
                        </button>
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

export default AdminProperties;
