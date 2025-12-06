// src/pages/Admin/AdminProperties.jsx

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import ListingCardAdmin from "../../components/layout/layoutAdmin/ListingCardAdmin.jsx";

import {
  adminGetPendingProperties,
  adminApproveProperty,
  adminRejectProperty,
} from "../../services/adminProperty.service";

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("AdminProperties");

  // ---- Chuẩn hoá dữ liệu trả về từ API ----
  const normalizePendingResponse = (response) => {
    console.log("Pending properties API response:", response);

    // Trường hợp BaseService.get đã trả body {code, success, message, result}
    if (response && response.success && response.result) {
      const r = response.result;
      if (Array.isArray(r)) return r;
      if (Array.isArray(r.items)) return r.items;
      if (Array.isArray(r.content)) return r.content;
      return [];
    }

    // Nếu vì lý do nào đó vẫn còn response.data
    if (response && response.data) {
      const data = response.data;
      if (data.result) {
        const r = data.result;
        if (Array.isArray(r)) return r;
        if (Array.isArray(r.items)) return r.items;
        if (Array.isArray(r.content)) return r.content;
      }
      if (Array.isArray(data.items)) return data.items;
      if (Array.isArray(data.content)) return data.content;
      if (Array.isArray(data)) return data;
    }

    // API trả thẳng mảng
    if (Array.isArray(response)) return response;

    return [];
  };

  const loadPending = async () => {
    try {
      setLoading(true);
      const res = await adminGetPendingProperties();
      const list = normalizePendingResponse(res);
      setProperties(list);
    } catch (e) {
      console.error("Error loading pending properties:", e);
      setProperties([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleApprove = async (id) => {
    try {
      await adminApproveProperty(id);
      await loadPending();
    } catch (e) {
      console.error("Approve failed:", e);
    }
  };

  const handleReject = async (id) => {
    try {
      await adminRejectProperty(id);
      await loadPending();
    } catch (e) {
      console.error("Reject failed:", e);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-900">
      <Sidebar
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
          <h1 className="text-3xl font-bold text-white mb-4">
            Pending Properties
          </h1>

          <div className="bg-slate-800 rounded-2xl p-6">
            {loading ? (
              <p className="text-slate-200">Loading...</p>
            ) : properties.length === 0 ? (
              <p className="text-slate-200">No pending properties.</p>
            ) : (
              <div className="space-y-4">
                {properties.map((property) => (
                  <ListingCardAdmin
                    key={property.propertyId || property.id}
                    property={property}
                    onApprove={() =>
                      handleApprove(property.propertyId || property.id)
                    }
                    onReject={() =>
                      handleReject(property.propertyId || property.id)
                    }
                  />
                ))}
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
