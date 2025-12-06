// src/pages/Admin/DashboardAdmin.jsx

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/layout/layoutUser/Sidebar.jsx"; 
import Header from "../../components/layout/layoutUser/Header.jsx";

import { adminGetPendingProperties } from "../../services/adminProperty.service";
import ListingCardAdmin from "../../components/layout/layoutAdmin/ListingCardAdmin.jsx";

const DashboardAdmin = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pendingList, setPendingList] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadPending = async () => {
    setLoading(true);
    try {
      const res = await adminGetPendingProperties();
      setPendingList(res?.result || []);
    } catch (err) {
      console.error("Error loading pending:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadPending();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      {/* USER SIDEBAR — giữ nguyên */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "ml-64" : "ml-0"
        }`}
      >
        <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>

          <div className="bg-white p-6 rounded-xl shadow mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                Pending Listings ({pendingList.length})
              </h2>
              <button
                onClick={loadPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Refresh
              </button>
            </div>

            {loading ? (
              <p className="text-gray-500">Loading...</p>
            ) : pendingList.length === 0 ? (
              <p className="text-gray-500 italic">No pending listings.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {pendingList.map((item) => (
                  <ListingCardAdmin
                    key={item.propertyId}
                    property={item}
                    onApprove={() => {}}
                    onReject={() => {}}
                  />
                ))}
              </div>
            )}
          </div>

          {/* FOOTER GIỐNG USER */}
          <footer className="text-center py-4 text-sm text-gray-500 border-t mt-8">
            © 2025 Roomie. All rights reserved.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;
