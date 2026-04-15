import React from "react";
import { User, Mail, Phone, Calendar, MapPin } from "lucide-react";

const InfoCard = ({ icon: Icon, iconColor, label, value }) => (
  <div className="apple-glass-table-row flex items-center gap-3 rounded-xl px-4 py-3.5">
    <div className={`w-10 h-10 rounded-xl ${iconColor} flex items-center justify-center`}>
      <Icon className="w-5 h-5" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] home-text-muted uppercase tracking-wider mb-0.5">{label}</p>
      <p className="text-sm font-semibold home-text-primary truncate">{value}</p>
    </div>
  </div>
);

const UserProfileHeaderSection = ({ profile, formatDate, getGenderDisplay, t }) => {
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(" ") || profile.username;
  const initial = (profile.firstName?.[0] || profile.username?.[0] || "U").toUpperCase();

  return (
    <div className="apple-glass-panel no-hover rounded-2xl p-6 md:p-8 mb-8">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Avatar */}
        <div className="flex-shrink-0 flex justify-center md:justify-start">
          <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg"
            style={{ background: "linear-gradient(135deg, var(--home-accent), var(--home-accent-strong))" }}
          >
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.username}
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.style.display = "none"; }}
              />
            ) : (
              <span className="text-5xl font-bold text-white">{initial}</span>
            )}
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl md:text-3xl font-bold home-text-primary mb-1 text-center md:text-left">{fullName}</h1>
          <p className="home-text-muted mb-6 text-center md:text-left">@{profile.username}</p>

          {/* Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {profile.email && (
              <InfoCard icon={Mail} iconColor="bg-sky-100/80 text-sky-700" label={t("userProfile.email")} value={profile.email} />
            )}
            {profile.phoneNumber && (
              <InfoCard icon={Phone} iconColor="bg-emerald-100/80 text-emerald-700" label={t("userProfile.phone")} value={profile.phoneNumber} />
            )}
            {profile.gender && (
              <InfoCard icon={User} iconColor="bg-teal-100/80 text-teal-700" label={t("userProfile.gender")} value={getGenderDisplay(profile.gender)} />
            )}
            {profile.dob && (
              <InfoCard icon={Calendar} iconColor="bg-orange-100/80 text-orange-700" label={t("userProfile.dob")} value={formatDate(profile.dob)} />
            )}
            {(profile.currentAddress || profile.permanentAddress) && (
              <div className="md:col-span-2">
                <InfoCard icon={MapPin} iconColor="bg-indigo-100/80 text-indigo-700" label={t("userProfile.address")} value={profile.currentAddress || profile.permanentAddress} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileHeaderSection;
