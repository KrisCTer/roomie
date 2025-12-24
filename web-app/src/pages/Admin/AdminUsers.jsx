import React, { useEffect, useMemo, useState } from "react";
import { Ban, PauseCircle, RefreshCw, Search } from "lucide-react";

import AdminSidebar from "../../components/layout/layoutAdmin/AdminSidebar";
import Header from "../../components/layout/layoutUser/Header";
import Footer from "../../components/layout/layoutUser/Footer";
import { useTranslation } from "react-i18next";

import {
  adminGetUsers,
  adminSuspendUser,
  adminBanUser,
} from "../../services/adminUser.service";

/* =========================
   Helpers
========================= */

const unwrapList = (res) => {
  const candidates = [res?.result, res?.data?.result, res?.data, res];
  for (const c of candidates) if (Array.isArray(c)) return c;
  return [];
};

const getUserId = (u) => u?.id ?? u?._id ?? u?.userId ?? u?.uuid ?? null;

const getStatus = (u) =>
  String(u?.status ?? u?.state ?? u?.accountStatus ?? "UNKNOWN").toUpperCase();

const isAdminUser = (u) => u?.username?.toLowerCase() === "admin";

const badgeClass = (status) => {
  const s = String(status).toUpperCase();
  if (s.includes("BAN")) return "bg-red-500/15 text-red-300 border-red-500/30";
  if (s.includes("SUSPEND"))
    return "bg-yellow-500/15 text-yellow-200 border-yellow-500/30";
  if (s.includes("ACTIVE"))
    return "bg-green-500/15 text-green-200 border-green-500/30";
  return "bg-gray-500/15 text-gray-300 border-gray-500/30";
};

const AdminUsers = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("User Management");

  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");
  const { t } = useTranslation();
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminGetUsers();

      // ✅ ẨN user admin
      const list = unwrapList(res).filter((u) => !isAdminUser(u));
      setUsers(list);
    } catch (e) {
      console.error("Load users failed:", e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return users;
    return users.filter((u) => {
      const hay = [u?.username, u?.email, getStatus(u), getUserId(u)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(kw);
    });
  }, [q, users]);

  const handleSuspend = async (u) => {
    const id = getUserId(u);
    if (!id) return;
    if (!window.confirm(t("admin.confirmSuspend", { name: u?.username ?? id })))
      return;

    try {
      setActionLoadingId(id);
      await adminSuspendUser(id);
      await loadUsers();
    } catch (e) {
      console.error("Suspend failed:", e);
      alert(t("admin.suspendFailed"));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBan = async (u) => {
    const id = getUserId(u);
    if (!id) return;
    if (!window.confirm(t("admin.confirmBan", { name: u?.username ?? id })))
      return;

    try {
      setActionLoadingId(id);
      await adminBanUser(id);
      await loadUsers();
    } catch (e) {
      console.error("Ban failed:", e);
      alert(t("admin.banFailed"));
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <AdminSidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div
        className={`transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* ✅ HEADER */}
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="p-6">
          {/* Page top actions */}
          <div className="flex items-center justify-end mb-6">
            <button
              onClick={loadUsers}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center gap-2"
              disabled={loading}
              type="button"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
              {t("common.refresh")}
            </button>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold">{t("admin.userManagement")}</h1>
            <p className="text-sm text-gray-400">
              {t("admin.userManagementDesc")}
            </p>
          </div>

          <div className="mb-4 flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 w-full max-w-md">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={t("admin.searchUsers")}
                className="bg-transparent outline-none text-sm w-full"
              />
            </div>
            <div className="text-sm text-gray-400">
              {t("admin.total")}:{" "}
              <span className="text-white">{filtered.length}</span>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/80 border-b border-slate-800">
                  <tr className="text-left">
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">{t("auth.username")}</th>
                    <th className="px-4 py-3">{t("auth.email")}</th>
                    <th className="px-4 py-3">{t("common.status")}</th>
                    <th className="px-4 py-3">{t("common.actions")}</th>
                  </tr>
                </thead>

                <tbody>
                  {loading && (
                    <tr>
                      <td className="px-4 py-6 text-gray-400" colSpan={5}>
                        {t("common.loading")}
                      </td>
                    </tr>
                  )}

                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-gray-400" colSpan={5}>
                        {t("admin.noUsers")}
                      </td>
                    </tr>
                  )}

                  {!loading &&
                    filtered.map((u, idx) => {
                      const id = getUserId(u);
                      const status = getStatus(u);
                      const busy = actionLoadingId === id;

                      return (
                        <tr
                          key={id ?? idx}
                          className="border-b border-slate-800 hover:bg-slate-800/40"
                        >
                          <td className="px-4 py-3 text-gray-400">{idx + 1}</td>

                          <td className="px-4 py-3">
                            <div className="font-medium">{u?.username}</div>
                            <div className="text-xs text-gray-400">{id}</div>
                          </td>

                          <td className="px-4 py-3">{u?.email ?? "-"}</td>

                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs ${badgeClass(
                                status
                              )}`}
                            >
                              {status}
                            </span>
                          </td>

                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSuspend(u)}
                                disabled={busy}
                                className={`px-3 py-2 rounded-lg flex items-center gap-2 border ${
                                  busy
                                    ? "opacity-40 cursor-not-allowed border-slate-700"
                                    : "border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-200"
                                }`}
                              >
                                <PauseCircle className="w-4 h-4" />
                                {t("admin.suspend")}
                              </button>

                              <button
                                type="button"
                                onClick={() => handleBan(u)}
                                disabled={busy}
                                className={`px-3 py-2 rounded-lg flex items-center gap-2 border ${
                                  busy
                                    ? "opacity-40 cursor-not-allowed border-slate-700"
                                    : "border-red-500/30 hover:bg-red-500/10 text-red-300"
                                }`}
                              >
                                <Ban className="w-4 h-4" />
                                {t("admin.ban")}
                              </button>

                              {busy && (
                                <span className="text-xs text-gray-400">
                                  {t("common.processing")}
                                </span>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>

          {/* ✅ FOOTER */}
          <Footer />
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
