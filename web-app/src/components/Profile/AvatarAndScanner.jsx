import React from "react";
import AvatarSection from "./AvatarSection";
import IdCardScanner from "./IdCardScanner";

const AvatarAndScanner = ({
  avatarUrl,
  onAvatarUpload,
  onIdCardFileSelect,
  onOpenCamera,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
      <h2 className="text-xl font-bold mb-6">Avatar & ID Card Scanner</h2>

      <div className="flex items-start gap-8">
        {/* Avatar Section */}
        <AvatarSection avatarUrl={avatarUrl} onAvatarUpload={onAvatarUpload} />

        {/* ID Card Scanner Section */}
        <IdCardScanner
          onFileSelect={onIdCardFileSelect}
          onOpenCamera={onOpenCamera}
        />
      </div>
    </div>
  );
};

export default AvatarAndScanner;
