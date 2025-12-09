// src/pages/Admin/AdminProperties.jsx

import React, { useEffect, useState } from "react";
import AdminSidebar from "../../components/layout/layoutAdmin/AdminSidebar.jsx";
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
  const [activeMenu, setActiveMenu] = useState("Admin Properties");

  // Đọc list pending từ API
  const loadPending = async () => {
    try {
      setLoading(true);
      const res = await adminGetPendingProperties();

      console.log("Admin pending properties response:", res);

      // API chuẩn: { code, success, message, result: [...] }
      if (res && res.success && Array.isArray(res.result)) {
        setProperties(res.result);
      }
      // fallback nếu backend trả kiểu khác
      else if (res && res.data && Array.isArray(res.data.result)) {
        setProperties(res.data.result);
      } else if (Array.isArray(res)) {
        setProperties(res);
      } else {
        setProperties([]);
      }
    } catch (error) {
      console.error("Error loading pending properties:", error);
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
    } catch (error) {
      console.error("Approve failed:", error);
    }
  };

  const handleReject = async (id) => {
    try {
      await adminRejectProperty(id);
      await loadPending();
    } catch (error) {
      console.error("Reject failed:", error);
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
            {loading ? (
              <p className="text-slate-200">Loading...</p>
            ) : properties.length === 0 ? (
              <p className="text-slate-200">No pending properties.</p>
            ) : (
              <div className="space-y-4">
                {properties.map((property) => {
                  const id = property.propertyId || property.id;
                  return (
                    <ListingCardAdmin
                      key={id}
                      property={property}
                      onApprove={() => handleApprove(id)}
                      onReject={() => handleReject(id)}
                    />
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
