/* SEO_META: title="Roomie Admin - Logs"; name="description"; property="og:title" */
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ScrollText, Search, Radio, Wifi, WifiOff } from "lucide-react";

import AdminSidebar from "../../components/layout/layoutAdmin/AdminSidebar";
import Header from "../../components/layout/layoutUser/Header";
import Footer from "../../components/layout/layoutUser/Footer";

import { adminGetLogs } from "../../services/adminLogService";
import { CONFIG, API } from "../../configurations/configuration";
import { getToken } from "../../services/localStorageService";

import "../../styles/apple-glass-dashboard.css";
import "../../styles/home-redesign.css";

const typeColors = {
  ERROR: "text-red-600 bg-red-50 border-red-200",
  ALERT: "text-red-600 bg-red-50 border-red-200",
  USER_ACTIVITY: "text-blue-600 bg-blue-50 border-blue-200",
  AUDIT: "text-emerald-600 bg-emerald-50 border-emerald-200",
  PERFORMANCE: "text-amber-600 bg-amber-50 border-amber-200",
  API_USAGE: "text-cyan-600 bg-cyan-50 border-cyan-200",
};

const getTypeStyle = (type) => typeColors[String(type).toUpperCase()] || "text-gray-600 bg-gray-50 border-gray-200";

const fmtTime = (d) => {
  if (!d) return "—";
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return "—";
  return dt.toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit", day: "2-digit", month: "2-digit" });
};

const typeFilters = ["ALL", "USER_ACTIVITY", "ERROR", "PERFORMANCE", "AUDIT"];

const AdminLogs = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("Nhật ký");
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [q, setQ] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [sseConnected, setSseConnected] = useState(false);
  const [liveLogs, setLiveLogs] = useState([]);
  const sseRef = useRef(null);
  const pageSize = 20;

  const load = useCallback(async (p = 0) => {
    try {
      setLoading(true);
      const params = { page: p, size: pageSize };
      if (typeFilter !== "ALL") params.type = typeFilter;
      const res = await adminGetLogs(params);
      const data = res?.result ?? res?.data ?? res;
      setLogs(data?.logs ?? []);
      setTotal(data?.total ?? 0);
      setPage(p);
    } catch (e) {
      console.error("Load logs failed:", e);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => { load(0); }, [load]);

  // SSE real-time stream
  const connectSSE = useCallback(() => {
    if (sseRef.current) sseRef.current.close();
    const token = getToken();
    const url = `${CONFIG.API_GATEWAY}${API.ADMIN_STREAM_LOGS_SSE}${token ? `?token=${token}` : ""}`;
    const es = new EventSource(url);
    sseRef.current = es;

    es.onopen = () => setSseConnected(true);
    es.onmessage = (event) => {
      try {
        const log = JSON.parse(event.data);
        if (log?.message !== "connected") {
          setLiveLogs((prev) => [log, ...prev].slice(0, 50));
        }
      } catch { /* ignore */ }
    };
    es.onerror = () => {
      setSseConnected(false);
      es.close();
    };
  }, []);

  const disconnectSSE = useCallback(() => {
    if (sseRef.current) {
      sseRef.current.close();
      sseRef.current = null;
    }
    setSseConnected(false);
  }, []);

  useEffect(() => () => disconnectSSE(), [disconnectSSE]);

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase();
    if (!kw) return logs;
    return logs.filter((l) =>
      [l?.type, l?.message, l?.source, l?.userId].filter(Boolean).join(" ").toLowerCase().includes(kw)
    );
  }, [logs, q]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="home-v2 home-shell-bg min-h-screen">
      <AdminSidebar activeMenu={activeMenu} setActiveMenu={setActiveMenu} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className={`transition-all duration-300 ${sidebarOpen ? "ml-64" : "ml-0"}`}>
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} pageTitle="Nhật ký hệ thống" pageSubtitle="Audit logs, error logs, và performance metrics" />
        <main className="w-full px-4 pt-6 pb-8 md:px-8">
          {/* Live stream toggle */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 home-text-muted" />
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm trong logs..." className="home-input pl-9 w-full" />
              </div>
              <div className="flex gap-1.5 flex-wrap">
                {typeFilters.map((t) => (
                  <button key={t} type="button" onClick={() => setTypeFilter(t)}
                    className={`apple-glass-pill px-3 py-1.5 text-xs font-semibold transition ${typeFilter === t ? "home-text-accent ring-1 ring-[var(--home-accent)]" : "home-text-muted"}`}
                  >{t === "ALL" ? "Tất cả" : t.replace("_", " ")}</button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={sseConnected ? disconnectSSE : connectSSE} type="button"
                className={`apple-glass-pill flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${sseConnected ? "text-green-600" : "home-text-muted"}`}
              >
                {sseConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                {sseConnected ? "Live" : "Kết nối"}
              </button>

            </div>
          </div>

          {/* Live logs (if connected) */}
          {sseConnected && liveLogs.length > 0 && (
            <section className="apple-glass-panel no-hover rounded-2xl p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Radio className="w-4 h-4 text-green-500 animate-pulse" />
                <span className="text-xs font-semibold home-text-accent uppercase tracking-wider">Live Stream</span>
              </div>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {liveLogs.map((l, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs py-1.5 px-2 rounded-lg hover:bg-white/5">
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${getTypeStyle(l?.type)}`}>{l?.type}</span>
                    <span className="home-text-muted w-24 shrink-0">{fmtTime(l?.timestamp)}</span>
                    <span className="home-text-primary truncate flex-1">{l?.message}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Historical Logs */}
          <section className="apple-glass-panel no-hover rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <ScrollText className="w-5 h-5 home-text-accent" />
              <h2 className="home-text-primary font-bold text-lg">Lịch sử logs</h2>
              <span className="apple-glass-pill px-2.5 py-1 text-xs font-semibold home-text-muted">{total} records</span>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="apple-glass-soft animate-pulse rounded-lg p-3 h-10" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="apple-glass-soft home-text-muted rounded-2xl border-dashed p-8 text-center">Không có logs</div>
            ) : (
              <div className="space-y-1.5">
                {filtered.map((l, i) => (
                  <div key={l?.id || i} className="apple-glass-table-row rounded-lg px-4 py-3 flex items-start gap-3">
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-bold mt-0.5 shrink-0 ${getTypeStyle(l?.type)}`}>{l?.type}</span>
                    <div className="flex-1 min-w-0">
                      <p className="home-text-primary text-sm leading-relaxed">{l?.message}</p>
                      <div className="flex items-center gap-3 mt-1 text-[10px] home-text-muted">
                        <span>{fmtTime(l?.timestamp)}</span>
                        {l?.source && <span>• {l.source}</span>}
                        {l?.userId && <span>• User: {l.userId.slice(0, 8)}...</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button type="button" onClick={() => load(page - 1)} disabled={page === 0}
                  className="apple-glass-pill px-3 py-1.5 text-xs font-semibold home-text-muted disabled:opacity-30"
                >← Trước</button>
                <span className="text-xs home-text-muted px-3">Trang {page + 1} / {totalPages}</span>
                <button type="button" onClick={() => load(page + 1)} disabled={page >= totalPages - 1}
                  className="apple-glass-pill px-3 py-1.5 text-xs font-semibold home-text-muted disabled:opacity-30"
                >Sau →</button>
              </div>
            )}
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminLogs;
