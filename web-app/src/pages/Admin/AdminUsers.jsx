import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Ban, PauseCircle, RefreshCw, Search, Menu } from "lucide-react";

import AdminSidebar from "../../components/layout/layoutAdmin/AdminSidebar"; // <-- đúng đường dẫn nếu AdminSidebar nằm trong src/components
import {
  adminGetUsers,
  adminSuspendUser,
  adminBanUser,
} from "../../services/adminUser.service";

const AdminUsers = () => {
  const navigate = useNavigate();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("User Management");

  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username !== "admin") navigate("/profile");
  }, [navigate]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminGetUsers();
      const list = res?.result ?? res?.data?.result ?? res ?? [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("Load users failed:", e);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setActiveMenu("User Management");
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getStatus = (u) => {
    const raw =
      u?.status ??
      u?.state ??
      u?.accountStatus ??
      u?.accessStatus ??
      (typeof u?.enabled === "boolean" ? (u.enabled ? "ACTIVE" : "DISABLED") : null) ??
      (typeof u?.active === "boolean" ? (u.active ? "ACTIVE" : "INACTIVE") : null);

    return raw ? String(raw).toUpperCase() : "UNKNOWN";
  };

  const isBanned = (u) => getStatus(u).includes("BAN");
  const isSuspended = (u) =>
    getStatus(u).includes("SUSPEND") || getStatus(u).includes("PAUSE");

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return users;
    return users.filter((u) => {
      const hay = [
        u?.id,
        u?.username,
        u?.email,
        u?.firstName,
        u?.lastName,
        u?.fullName,
        getStatus(u),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return hay.includes(kw);
    });
  }, [q, users]);

  const badgeClass = (status) => {
    const s = String(status).toUpperCase();
    if (s.includes("BAN")) return "bg-red-500/15 text-red-300 border-red-500/30";
    if (s.includes("SUSPEND") || s.includes("PAUSE"))
      return "bg-yellow-500/15 text-yellow-200 border-yellow-500/30";
    if (s.includes("ACTIVE") || s.includes("ENABLE"))
      return "bg-green-500/15 text-green-200 border-green-500/30";
    if (s.includes("INACTIVE") || s.includes("DISABLE"))
      return "bg-gray-500/15 text-gray-300 border-gray-500/30";
    return "bg-blue-500/15 text-blue-200 border-blue-500/30";
  };

  const handleSuspend = async (u) => {
    if (!u?.id) return;
    if (!window.confirm(`Suspend user "${u.username ?? u.id}"?`)) return;

    try {
      setActionLoadingId(u.id);
      await adminSuspendUser(u.id);
      await loadUsers();
    } catch (e) {
      console.error("Suspend failed:", e);
      alert("Suspend failed. Check console/network.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleBan = async (u) => {
    if (!u?.id) return;
    if (!window.confirm(`Ban user "${u.username ?? u.id}"?`)) return;

    try {
      setActionLoadingId(u.id);
      await adminBanUser(u.id);
      await loadUsers();
    } catch (e) {
      console.error("Ban failed:", e);
      alert("Ban failed. Check console/network.");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* SIDEBAR */}
      <AdminSidebar
        activeMenu={activeMenu}
        setActiveMenu={setActiveMenu}
        sidebarOpen={sidebarOpen}
      />

      {/* CONTENT */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
        <div className="p-6">
          {/* Top bar (toggle sidebar) */}
          <div className="flex items-center justify-between mb-6">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800"
              title="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            <button
              onClick={loadUsers}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center gap-2"
              disabled={loading}
              type="button"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
          </div>

          <div className="mb-6">
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="text-sm text-gray-400">
              Admin có thể Suspend hoặc Ban người dùng.
            </p>
          </div>

          {/* Search */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 w-full max-w-md">
              <Search className="w-4 h-4 text-gray-400" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search by username/email/status..."
                className="bg-transparent outline-none text-sm w-full"
              />
            </div>
            <div className="text-sm text-gray-400">
              Total: <span className="text-white">{filtered.length}</span>
            </div>
          </div>

          {/* Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
            <div className="overflow-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-900/80 border-b border-slate-800">
                  <tr className="text-left">
                    <th className="px-4 py-3 whitespace-nowrap">#</th>
                    <th className="px-4 py-3 whitespace-nowrap">Username</th>
                    <th className="px-4 py-3 whitespace-nowrap">Email</th>
                    <th className="px-4 py-3 whitespace-nowrap">Status</th>
                    <th className="px-4 py-3 whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, idx) => {
                    const status = getStatus(u);
                    const busy = actionLoadingId === u.id;
                    const disableSuspend = busy || isBanned(u) || isSuspended(u);
                    const disableBan = busy || isBanned(u);

                    return (
                      <tr
                        key={u?.id ?? idx}
                        className="border-b border-slate-800 hover:bg-slate-800/40"
                      >
                        <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                          {idx + 1}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="font-medium">{u?.username ?? "-"}</div>
                          <div className="text-xs text-gray-400">{u?.id}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">{u?.email ?? "-"}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full border text-xs ${badgeClass(
                              status
                            )}`}
                          >
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleSuspend(u)}
                              disabled={disableSuspend}
                              className={`px-3 py-2 rounded-lg flex items-center gap-2 border
                                ${
                                  disableSuspend
                                    ? "opacity-40 cursor-not-allowed border-slate-700"
                                    : "border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-200"
                                }`}
                            >
                              <PauseCircle className="w-4 h-4" />
                              Suspend
                            </button>

                            <button
                              type="button"
                              onClick={() => handleBan(u)}
                              disabled={disableBan}
                              className={`px-3 py-2 rounded-lg flex items-center gap-2 border
                                ${
                                  disableBan
                                    ? "opacity-40 cursor-not-allowed border-slate-700"
                                    : "border-red-500/30 hover:bg-red-500/10 text-red-300"
                                }`}
                            >
                              <Ban className="w-4 h-4" />
                              Ban
                            </button>

                            {busy && (
                              <span className="text-xs text-gray-400">Processing...</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {!loading && filtered.length === 0 && (
                    <tr>
                      <td className="px-4 py-6 text-gray-400" colSpan={5}>
                        No users found.
                      </td>
                    </tr>
                  )}

                  {loading && (
                    <tr>
                      <td className="px-4 py-6 text-gray-400" colSpan={5}>
                        Loading...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">
            Nếu danh sách vẫn trống: kiểm tra Network xem API GET users có trả về
            `result` hay không, và endpoint có đúng không.
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminUsers;
