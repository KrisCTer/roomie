// src/pages/Admin/AdminProperties.jsx

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx";
import Header from "../../components/layout/layoutUser/Header.jsx";
import Footer from "../../components/layout/layoutUser/Footer.jsx";
import ListingCardAdmin from "../../components/layout/layoutAdmin/ListingCardAdmin.jsx";



import { 
  adminGetPendingProperties, 
  adminApproveProperty, 
  adminRejectProperty 
} from "../../services/adminProperty.service";

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState("AdminProperties");

  const loadData = async () => {
    setLoading(true);
    try {
      const response = await adminGetPendingProperties();

      console.log("API Pending:", response);

      // Backend trả dạng ApiResponse → FE phải lấy response.result
      setProperties(response?.result ?? []);
    } catch (err) {
      console.error("Load pending error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApprove = async (id) => {
    try {
      await adminApproveProperty(id);
      loadData();
    } catch (e) {
      console.error("Approve failed:", e);
    }
  };

  const handleReject = async (id) => {
    try {
      await adminRejectProperty(id);
      loadData();
    } catch (e) {
      console.error("Reject failed:", e);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
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
          <div className="bg-white shadow rounded-lg p-6">

            <h2 className="text-2xl font-bold mb-6">Pending Properties</h2>

            {loading ? (
              <p>Loading...</p>
            ) : properties.length === 0 ? (
              <p>No pending properties.</p>
            ) : (
              <div className="space-y-4">
                {properties.map((property) => (
                  <ListingCardAdmin
                    key={property.propertyId}
                    property={property}
                    onApprove={() => handleApprove(property.propertyId)}
                    onReject={() => handleReject(property.propertyId)}
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
