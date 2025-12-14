import React from "react";
import { Camera } from "lucide-react";

const AvatarSection = ({ avatarUrl, onAvatarUpload }) => {
  return (
    <div className="flex flex-col items-center">
      <p className="text-sm text-gray-600 mb-3">Profile Picture</p>
      <div className="relative">
        <img
          src={avatarUrl || "/default-avatar.png"}
          alt="Avatar"
          className="w-40 h-40 rounded-2xl object-cover border-4 border-white shadow-lg bg-gray-100"
        />

        <label className="absolute -bottom-2 -right-2 w-11 h-11 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 cursor-pointer shadow-md border-4 border-white transition-transform transform active:scale-95">
          <Camera className="w-5 h-5" />
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={onAvatarUpload}
          />
        </label>
      </div>
    </div>
  );
};

export default AvatarSection;
