// src/pages/Admin/AdminProperties.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import AdminSidebar from "../../components/layout/layoutAdmin/AdminSidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";

import {
  adminGetAllProperties,
  adminApproveProperty,
  adminRejectProperty,
} from "../../services/adminProperty.service";

import { Eye, Check, X } from "lucide-react";

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
  if (!m) return "https://via.placeholder.com/120x90?text=No+Image";
  if (typeof m === "string") return m;
  return (
    m?.url ||
    m?.link ||
    m?.path ||
    "https://via.placeholder.com/120x90?text=No+Image"
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

  const loadAll = async () => {
    try {
      setLoading(true);
      const res = await adminGetAllProperties();
      setProperties(normalizeList(res));
    } catch (e) {
      console.error("Load properties failed:", e);
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

  // CHỈ HIỆN PENDING 
  const pendingProperties = useMemo(() => {
    return properties.filter((p) => getStatus(p) === "PENDING");
  }, [properties]);

  const handleView = (id) => navigate(`/property/${id}`);

  const handleApprove = async (id) => {
    try {
      await adminApproveProperty(id);
      // remove khỏi UI ngay (vì không còn pending)
      setProperties((prev) =>
        prev.filter((p) => (p?.propertyId || p?.id || p?._id) !== id)
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
        prev.filter((p) => (p?.propertyId || p?.id || p?._id) !== id)
      );
    } catch (e) {
      console.error("Reject failed:", e);
      await loadAll();
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      <AdminSidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <main className="p-8 w-full">
          <h1 className="text-3xl font-bold text-white mb-6">
            Pending Properties
          </h1>

          <div className="bg-slate-800 rounded-2xl p-6">
            {!isAdmin ? (
              <p className="text-slate-200">Unauthorized.</p>
            ) : loading ? (
              <p className="text-slate-200">Loading...</p>
            ) : pendingProperties.length === 0 ? (
              <p className="text-slate-200">No pending properties.</p>
            ) : (
              <div className="space-y-4">
                {pendingProperties.map((p) => {
                  const id = p?.propertyId || p?.id || p?._id;
                  const img = pickImage(p);

                  const title = p?.title ?? "Untitled";
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

                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-500 text-white">
                            Waiting approval
                          </span>

                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-slate-600 text-white">
                            Inactive
                          </span>
                        </div>

                        <div className="mt-1 text-slate-200 text-sm flex items-center gap-4">
                          <span>{fmtDate(created)}</span>
                          <span className="text-sky-400 font-semibold">
                            {fmtMoney(price)} VND
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleView(id)}
                          className="h-10 w-10 rounded-xl border border-slate-600 bg-slate-900/40 hover:bg-slate-900 flex items-center justify-center text-slate-200"
                          title="View"
                        >
                          <Eye size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApprove(id)}
                          className="h-10 w-10 rounded-xl border border-emerald-500/60 bg-slate-900/40 hover:bg-slate-900 flex items-center justify-center text-emerald-400"
                          title="Approve"
                        >
                          <Check size={18} />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleReject(id)}
                          className="h-10 w-10 rounded-xl border border-red-500/60 bg-slate-900/40 hover:bg-slate-900 flex items-center justify-center text-red-400"
                          title="Reject"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default AdminProperties;
