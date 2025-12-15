import React, { useEffect, useState } from "react";
import { User, Mail, Phone, Loader2 } from "lucide-react";
import { getUserProfile } from "../../services/user.service";

const TenantInfoSection = ({ tenantId }) => {
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!tenantId) return;

    const fetchTenant = async () => {
      try {
        setLoading(true);
        const res = await getUserProfile(tenantId);
        setTenant(res?.result || null);
      } catch (err) {
        console.error("Failed to fetch tenant profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTenant();
  }, [tenantId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading tenant information...
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-sm text-gray-500">
        Unable to load tenant information
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <User className="w-5 h-5 text-green-600" />
        <h3 className="font-bold text-gray-900">Tenant Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2 text-sm">
          <span className="text-gray-600 whitespace-nowrap">Full Name:</span>
          <span className="font-semibold text-gray-900">
            {tenant.firstName} {tenant.lastName}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Mail className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600 whitespace-nowrap">Email:</span>
          <span className="flex items-center gap-1 font-medium text-gray-900">
            {tenant.email || "N/A"}
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Phone className="w-4 h-4 text-gray-500" />
          <span className="text-gray-600 whitespace-nowrap">Phone Number:</span>
          <span className="flex items-center gap-1 font-medium text-gray-900">
            {tenant.phoneNumber || "N/A"}
          </span>
        </div>

        {/* 
        <div>
          <span className="text-gray-600">Username:</span>
          <p className="font-medium text-blue-600 mt-1">@{tenant.username}</p>
        </div> */}
      </div>
    </div>
  );
};

export default TenantInfoSection;
