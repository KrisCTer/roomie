import React from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
} from "lucide-react";

const UserProfileHeaderSection = ({ profile, formatDate, getGenderDisplay, t }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
    <div className="flex flex-col md:flex-row gap-8">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-32 h-32 rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-teal-600 flex items-center justify-center shadow-lg">
          {profile.avatar ? (
            <img
              src={profile.avatar}
              alt={profile.username}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.innerHTML = `
                  <span class="text-5xl font-bold text-white">
                    ${(
                      profile.firstName?.[0] ||
                      profile.username?.[0] ||
                      "U"
                    ).toUpperCase()}
                  </span>
                `;
              }}
            />
          ) : (
            <span className="text-5xl font-bold text-white">
              {(
                profile.firstName?.[0] ||
                profile.username?.[0] ||
                "U"
              ).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Profile Info */}
      <div className="flex-1">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {[profile.firstName, profile.lastName]
            .filter(Boolean)
            .join(" ") || profile.username}
        </h1>
        <p className="text-gray-600 mb-6">@{profile.username}</p>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.email && (
            <InfoCard
              icon={<Mail className="w-5 h-5 text-blue-600" />}
              bgColor="bg-blue-100"
              label={t("userProfile.email")}
              value={profile.email}
            />
          )}
          {profile.phoneNumber && (
            <InfoCard
              icon={<Phone className="w-5 h-5 text-green-600" />}
              bgColor="bg-green-100"
              label={t("userProfile.phone")}
              value={profile.phoneNumber}
            />
          )}
          {profile.gender && (
            <InfoCard
              icon={<User className="w-5 h-5 text-teal-600" />}
              bgColor="bg-teal-100"
              label={t("userProfile.gender")}
              value={getGenderDisplay(profile.gender)}
            />
          )}
          {profile.dob && (
            <InfoCard
              icon={<Calendar className="w-5 h-5 text-orange-600" />}
              bgColor="bg-orange-100"
              label={t("userProfile.dob")}
              value={formatDate(profile.dob)}
            />
          )}
          {(profile.currentAddress || profile.permanentAddress) && (
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl md:col-span-2">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">
                  {t("userProfile.address")}
                </p>
                <p className="text-sm font-medium text-gray-900">
                  {profile.currentAddress || profile.permanentAddress}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);

const InfoCard = ({ icon, bgColor, label, value }) => (
  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
    <div className={`w-10 h-10 rounded-lg ${bgColor} flex items-center justify-center`}>
      {icon}
    </div>
    <div>
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-900">{value}</p>
    </div>
  </div>
);

export default UserProfileHeaderSection;
