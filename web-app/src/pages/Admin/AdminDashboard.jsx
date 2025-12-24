import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { RefreshCw, Search, Eye } from "lucide-react";

import AdminSidebar from "../../components/layout/layoutAdmin/AdminSidebar";
import Header from "../../components/layout/layoutUser/Header";
import Footer from "../../components/layout/layoutUser/Footer";

import { adminGetAllProperties } from "../../services/adminProperty.service";
import { adminGetUsers } from "../../services/adminUser.service";
import { useTranslation } from "react-i18next";
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
  // ưu tiên: images/mediaList/thumbnail
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

  return "https://via.placeholder.com/120x90?text=No+Image";
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

const statusBadgeClass = (status) => {
  const s = String(status).toUpperCase();
  if (s.includes("PENDING")) return "bg-orange-500 text-white";
  if (s.includes("APPROVED") || s.includes("ACTIVE"))
    return "bg-green-500 text-white";
  if (s.includes("REJECT") || s.includes("DENY"))
    return "bg-red-500 text-white";
  if (s.includes("DRAFT")) return "bg-slate-600 text-white";
  return "bg-blue-500 text-white";
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

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Admin Dashboard");

  const [loading, setLoading] = useState(false);

  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);

  const [searchProperty, setSearchProperty] = useState("");
  const [searchUser, setSearchUser] = useState("");

  const username = useMemo(() => resolveUsername(), []);
  const isAdmin = String(username).toLowerCase() === "admin";
  const { t } = useTranslation();

  const loadAll = async () => {
    try {
      setLoading(true);
      const [pRes, uRes] = await Promise.all([
        adminGetAllProperties(),
        adminGetUsers(),
      ]);

      setProperties(normalizeProperties(pRes));

      // ✅ Ẩn user admin
      const uList = unwrapUsers(uRes);
      setUsers(
        (uList || []).filter((u) => u?.username?.toLowerCase() !== "admin")
      );
    } catch (e) {
      console.error("AdminDashboard load failed:", e);
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
        .includes(q)
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
        .includes(q)
    );
  }, [searchUser, users]);

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-slate-950">
        {t("admin.unauthorized")}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AdminSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
      />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="p-8">
          {/* ===== PROPERTIES (CARD LIKE AdminProperties) ===== */}
          <div className="bg-slate-800/40 rounded-2xl p-6 mb-8 border border-slate-700/40">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-2xl font-bold">{t("admin.properties")}</h2>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                  <input
                    value={searchProperty}
                    onChange={(e) => setSearchProperty(e.target.value)}
                    placeholder={t("admin.searchProperties")}
                    className="pl-9 pr-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-100 placeholder:text-slate-400 outline-none w-[320px]"
                  />
                </div>

                <button
                  onClick={loadAll}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/60 border border-slate-700 hover:bg-slate-900 disabled:opacity-60"
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
              <div className="text-slate-200">{t("common.loading")}</div>
            ) : filteredProperties.length === 0 ? (
              <div className="text-slate-200">{t("admin.noProperties")}</div>
            ) : (
              <div className="space-y-4">
                {filteredProperties.map((p) => {
                  const id = getPropertyId(p);
                  const title = p?.title ?? t("common.noData");
                  const status = getPropertyStatus(p);
                  const img = pickImage(p);

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
                      className="bg-slate-900/50 border border-slate-700 rounded-2xl p-4 flex items-center gap-4"
                    >
                      {/* Thumbnail */}
                      <div className="w-24 h-16 rounded-xl overflow-hidden bg-slate-700 flex-shrink-0">
                        <img
                          src={img}
                          alt={title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src =
                              "https://via.placeholder.com/120x90?text=No+Image";
                          }}
                        />
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="text-white font-semibold text-lg truncate">
                            {title}
                          </div>

                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${statusBadgeClass(
                              status
                            )}`}
                          >
                            {status || "UNKNOWN"}
                          </span>
                        </div>

                        <div className="mt-1 text-slate-200 text-sm flex flex-wrap items-center gap-x-4 gap-y-1">
                          {created ? <span>{fmtDate(created)}</span> : null}
                          {price !== null ? (
                            <span className="text-sky-400 font-semibold">
                              {fmtMoney(price)}{" "}
                              {t("common.currency", { defaultValue: "VND" })}
                            </span>
                          ) : null}
                          {addr ? (
                            <span className="truncate max-w-[780px] text-slate-300">
                              {addr}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* View only */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => id && navigate(`/property/${id}`)}
                          className="p-3 rounded-xl border border-slate-600 hover:bg-slate-800"
                          title={t("admin.view")}
                          type="button"
                        >
                          <Eye className="w-5 h-5 text-slate-200" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ===== USERS (giữ bảng) ===== */}
          <div className="bg-slate-800/40 rounded-2xl p-6 border border-slate-700/40">
            <div className="flex items-center justify-between gap-4 mb-4">
              <h2 className="text-2xl font-bold">{t("admin.users")}</h2>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                <input
                  value={searchUser}
                  onChange={(e) => setSearchUser(e.target.value)}
                  placeholder={t("admin.searchUsers")}
                  className="pl-9 pr-3 py-2 rounded-lg bg-slate-900/60 border border-slate-700 text-slate-100 placeholder:text-slate-400 outline-none w-[280px]"
                />
              </div>
            </div>

            {loading ? (
              <div className="text-slate-200">{t("common.loading")}</div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-slate-200">{t("admin.noUsers")}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-200 bg-slate-900/40">
                      <th className="py-3 px-3 rounded-l-lg">
                        {t("auth.username")}
                      </th>
                      <th className="py-3 px-3">{t("auth.email")}</th>
                      <th className="py-3 px-3 rounded-r-lg text-right">
                        {t("common.status")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr
                        key={getUserId(u)}
                        className="border-b border-slate-700/60"
                      >
                        <td className="py-4 px-3 font-semibold">
                          {u?.username || "-"}
                        </td>
                        <td className="py-4 px-3 text-slate-200">
                          {u?.email || "-"}
                        </td>
                        <td className="py-4 px-3 text-right text-slate-100">
                          {getUserStatus(u)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <Footer />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
