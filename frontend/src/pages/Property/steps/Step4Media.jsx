import React, { useState } from "react";
import { Upload, Trash2, Image, Camera, Box, Eye, EyeOff } from "lucide-react";
import ImageUploader from "../../../components/domain/property/ImageUploader";
import { requestModel3d } from "../../../services/propertyService";

const Step4Media = ({
  coverImage,
  uploadedImages,
  uploadingImages,
  isEditMode,
  propertyId,
  model3dStatus,
  model3dVisible,
  onCoverUpload,
  onCoverRemove,
  onImageUpload,
  onImageRemove,
  onToggle3dVisibility,
  onRefreshProperty,
}) => {
  const [requesting3d, setRequesting3d] = useState(false);
  const roomImages = uploadedImages.filter(
    (img) => img.category !== "COVER"
  );
  const roomImageCount = roomImages.length;
  const has3dModel = model3dStatus === "COMPLETED";
  const is3dProcessing = model3dStatus === "PROCESSING";

  const handleRequest3D = async () => {
    if (!propertyId) return;
    try {
      setRequesting3d(true);
      await requestModel3d(propertyId);
      if (onRefreshProperty) onRefreshProperty();
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        "Không thể tạo mô hình 3D. Vui lòng thử lại sau.";
      window.alert(msg);
    } finally {
      setRequesting3d(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ===== COVER IMAGE ===== */}
      <div className="home-glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Image className="w-5 h-5 text-[#CC6F4A]" />
          <h2 className="text-xl font-bold">Ảnh bìa</h2>
          <span className="text-sm text-gray-400 ml-2">(Tùy chọn)</span>
        </div>
        <p className="text-sm text-gray-500 mb-4">
          Ảnh đại diện cho bất động sản. Nếu không chọn, ảnh phòng đầu tiên sẽ
          được sử dụng.
        </p>

        {coverImage ? (
          <div className="relative inline-block">
            <img
              src={coverImage.url}
              alt="Cover"
              className="w-72 h-48 object-cover rounded-xl border-2 border-[#CC6F4A]/30"
            />
            <button
              type="button"
              onClick={onCoverRemove}
              className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-2 bg-[#CC6F4A] text-white px-2 py-0.5 rounded text-xs font-semibold">
              Ảnh bìa
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-[#CC6F4A] transition-colors max-w-xs">
            <input
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={onCoverUpload}
              className="hidden"
              id="cover-upload"
            />
            <label htmlFor="cover-upload" className="cursor-pointer">
              <Image className="w-10 h-10 mx-auto mb-3 text-gray-400" />
              <p className="text-sm text-gray-600">Chọn ảnh bìa</p>
              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP</p>
            </label>
          </div>
        )}
      </div>

      {/* ===== ROOM IMAGES ===== */}
      <div className="home-glass-card rounded-xl p-6">
        <div className="flex items-center gap-2 mb-2">
          <Camera className="w-5 h-5 text-[#CC6F4A]" />
          <h2 className="text-xl font-bold">Ảnh phòng</h2>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <p className="text-sm text-gray-500">
            Ảnh chụp các góc phòng — dùng để tạo mô hình 3D.
          </p>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
              roomImageCount >= 8
                ? "bg-green-100 text-green-700"
                : "bg-amber-100 text-amber-700"
            }`}
          >
            {roomImageCount}/8 tối thiểu
          </span>
        </div>

        {/* Photo guide */}
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
          <p className="text-sm font-medium text-blue-800 mb-2">
            📸 Hướng dẫn chụp ảnh cho mô hình 3D:
          </p>
          <ul className="text-xs text-blue-700 space-y-1 pl-1">
            <li>✅ Tối thiểu <strong>8 ảnh</strong> (khuyến nghị 15-20)</li>
            <li>✅ Chụp xoay quanh phòng, mỗi ảnh trùng 60-80%</li>
            <li>✅ Ánh sáng đồng đều, tránh ngược sáng</li>
            <li>❌ Tránh gương, kính, bề mặt phản chiếu</li>
          </ul>
        </div>

        <ImageUploader
          uploadedImages={uploadedImages}
          uploadingImages={uploadingImages}
          onImageUpload={onImageUpload}
          onImageRemove={onImageRemove}
        />
      </div>

      {/* ===== 3D MODEL SECTION (Edit mode only) ===== */}
      {isEditMode && propertyId && (
        <div className="home-glass-card rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Box className="w-5 h-5 text-indigo-500" />
            <h2 className="text-xl font-bold">Mô hình 3D</h2>
          </div>

          {/* Status display */}
          {is3dProcessing && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5 text-center mb-4">
              <div className="inline-block w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
              <p className="text-sm font-medium text-indigo-800">
                Đang tạo mô hình 3D...
              </p>
              <p className="text-xs text-indigo-600 mt-1">
                Quá trình này mất 5-30 phút. Bạn có thể rời trang và quay lại
                sau.
              </p>
            </div>
          )}

          {model3dStatus === "FAILED" && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-4">
              <p className="text-sm text-red-700">
                ⚠️ Tạo mô hình 3D không thành công. Hãy thử lại với ảnh chất
                lượng tốt hơn.
              </p>
            </div>
          )}

          {has3dModel && (
            <div className="bg-green-50 border border-green-100 rounded-xl p-4 mb-4">
              <p className="text-sm text-green-700">
                ✅ Mô hình 3D đã sẵn sàng!
              </p>
            </div>
          )}

          {/* Visibility toggle (only when model exists) */}
          {has3dModel && (
            <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-3">
                {model3dVisible ? (
                  <Eye className="w-5 h-5 text-green-600" />
                ) : (
                  <EyeOff className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    Hiển thị mô hình 3D trên trang chi tiết
                  </p>
                  <p className="text-xs text-gray-500">
                    Người xem sẽ {model3dVisible ? "thấy" : "không thấy"} mô
                    hình 3D khi xem chi tiết phòng trọ
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onToggle3dVisibility}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  model3dVisible ? "bg-green-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                    model3dVisible ? "translate-x-6" : ""
                  }`}
                />
              </button>
            </div>
          )}

          {/* Create/Recreate button */}
          <button
            type="button"
            onClick={handleRequest3D}
            disabled={requesting3d || is3dProcessing || roomImageCount < 8}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm transition-all ${
              roomImageCount < 8 || is3dProcessing
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg hover:shadow-indigo-200"
            }`}
          >
            <Box className="w-4 h-4" />
            {requesting3d
              ? "Đang gửi yêu cầu..."
              : is3dProcessing
                ? "Đang xử lý..."
                : has3dModel
                  ? "🔄 Tạo lại mô hình 3D"
                  : "🧊 Tạo mô hình 3D"}
          </button>

          {roomImageCount < 8 && (
            <p className="text-xs text-amber-600 mt-2">
              ⚠️ Cần thêm {8 - roomImageCount} ảnh phòng nữa để tạo mô hình
              3D
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Step4Media;
