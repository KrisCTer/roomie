// src/components/Billing/MeterReadingModal.jsx
import React, { useState, useEffect } from "react";
import {
  X,
  Zap,
  Droplet,
  Camera,
  Upload,
  CheckCircle,
  AlertCircle,
  Loader,
  Sparkles,
} from "lucide-react";
import {
  uploadMeterPhotoWithAI,
  createManualMeterReading,
  updateMeterReadingValues,
} from "../../services/meterReading.service";

/**
 * MeterReadingModal
 * Modal for uploading meter photos with AI OCR
 */
const MeterReadingModal = ({
  contract,
  property,
  readingMonth,
  previousReading,
  onClose,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [meterReadingId, setMeterReadingId] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    electricityReading: 0,
    waterReading: 0,
  });

  // File uploads
  const [electricityFile, setElectricityFile] = useState(null);
  const [waterFile, setWaterFile] = useState(null);

  // OCR status
  const [electricityOCR, setElectricityOCR] = useState({
    status: "pending", // pending, processing, success, error
    confidence: 0,
    value: null,
    message: "",
  });

  const [waterOCR, setWaterOCR] = useState({
    status: "pending",
    confidence: 0,
    value: null,
    message: "",
  });

  useEffect(() => {
    // Initialize form with previous readings
    if (previousReading) {
      setFormData({
        electricityReading: previousReading.electricityReading || 0,
        waterReading: previousReading.waterReading || 0,
      });
    }
  }, [previousReading]);

  const handleElectricityFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setElectricityFile(file);
      setElectricityOCR({
        status: "pending",
        confidence: 0,
        value: null,
        message: "",
      });
    }
  };

  const handleWaterFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setWaterFile(file);
      setWaterOCR({
        status: "pending",
        confidence: 0,
        value: null,
        message: "",
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: parseFloat(value) || 0,
    }));
  };

  /**
   * Step 1: Create meter reading record
   */
  const createMeterReading = async () => {
    try {
      const res = await createManualMeterReading(
        contract.id,
        property.propertyId,
        readingMonth,
        {
          electricityReading: formData.electricityReading,
          waterReading: formData.waterReading,
        }
      );

      if (res?.success && res?.result?.id) {
        setMeterReadingId(res.result.id);
        return res.result.id;
      }

      throw new Error("Failed to create meter reading");
    } catch (error) {
      console.error("Error creating meter reading:", error);
      throw error;
    }
  };

  /**
   * Step 2: Upload electricity photo with AI OCR
   */
  const uploadElectricityWithAI = async (readingId) => {
    if (!electricityFile) return;

    try {
      setElectricityOCR({
        status: "processing",
        confidence: 0,
        value: null,
        message: "🤖 AI đang đọc chỉ số điện...",
      });

      const res = await uploadMeterPhotoWithAI(
        readingId,
        electricityFile,
        "ELECTRICITY"
      );

      if (res?.success && res?.result) {
        const reading = res.result;
        const confidence = extractConfidence(reading.notes);

        setElectricityOCR({
          status: "success",
          confidence,
          value: reading.electricityReading,
          message: `✅ AI đọc được: ${reading.electricityReading} kWh (${confidence}% độ chính xác)`,
        });

        // Update form
        setFormData((prev) => ({
          ...prev,
          electricityReading: reading.electricityReading,
        }));
      } else {
        throw new Error("OCR failed");
      }
    } catch (error) {
      console.error("Error uploading electricity photo:", error);
      setElectricityOCR({
        status: "error",
        confidence: 0,
        value: null,
        message: "❌ Không đọc được chỉ số. Vui lòng nhập thủ công.",
      });
    }
  };

  /**
   * Step 3: Upload water photo with AI OCR
   */
  const uploadWaterWithAI = async (readingId) => {
    if (!waterFile) return;

    try {
      setWaterOCR({
        status: "processing",
        confidence: 0,
        value: null,
        message: "🤖 AI đang đọc chỉ số nước...",
      });

      const res = await uploadMeterPhotoWithAI(readingId, waterFile, "WATER");

      if (res?.success && res?.result) {
        const reading = res.result;
        const confidence = extractConfidence(reading.notes);

        setWaterOCR({
          status: "success",
          confidence,
          value: reading.waterReading,
          message: `✅ AI đọc được: ${reading.waterReading} m³ (${confidence}% độ chính xác)`,
        });

        // Update form
        setFormData((prev) => ({
          ...prev,
          waterReading: reading.waterReading,
        }));
      } else {
        throw new Error("OCR failed");
      }
    } catch (error) {
      console.error("Error uploading water photo:", error);
      setWaterOCR({
        status: "error",
        confidence: 0,
        value: null,
        message: "❌ Không đọc được chỉ số. Vui lòng nhập thủ công.",
      });
    }
  };

  /**
   * Extract confidence from notes
   */
  const extractConfidence = (notes) => {
    if (!notes) return 0;
    const match = notes.match(/confidence=(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  /**
   * Submit form
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Step 1: Create meter reading
      let readingId = meterReadingId;
      if (!readingId) {
        readingId = await createMeterReading();
      }

      // Step 2: Upload photos with AI OCR
      await Promise.all([
        uploadElectricityWithAI(readingId),
        uploadWaterWithAI(readingId),
      ]);

      // Step 3: Update final values (in case user edited after OCR)
      await updateMeterReadingValues(readingId, {
        electricityReading: formData.electricityReading,
        waterReading: formData.waterReading,
      });

      alert("✅ Đã lưu chỉ số công tơ thành công!");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error saving meter reading:", error);
      alert("❌ Không thể lưu chỉ số! Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "processing":
        return <Loader className="w-4 h-4 animate-spin text-blue-600" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full my-8 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5 rounded-t-2xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <Camera className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Upload Meter Readings
                </h2>
                <p className="text-blue-100 text-sm flex items-center gap-1">
                  <Sparkles className="w-4 h-4" />
                  AI-powered OCR (95%+ accuracy)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg flex items-center justify-center transition"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 max-h-[70vh] overflow-y-auto"
        >
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>🤖 AI OCR:</strong> Chụp ảnh công tơ rõ nét, AI sẽ tự động
              đọc chỉ số. Bạn có thể chỉnh sửa nếu cần.
            </p>
          </div>

          {/* Previous Reading Info */}
          {previousReading && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                📊 Chỉ số tháng trước:
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Điện:</span>{" "}
                  <span className="font-bold text-gray-900">
                    {previousReading.electricityReading} kWh
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Nước:</span>{" "}
                  <span className="font-bold text-gray-900">
                    {previousReading.waterReading} m³
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Electricity */}
          <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-5 border-2 border-yellow-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">
                Electricity Meter
              </h3>
            </div>

            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📸 Chụp/Tải ảnh công tơ điện
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleElectricityFileChange}
                  className="w-full px-4 py-3 border-2 border-dashed border-yellow-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-yellow-100 file:text-yellow-700 hover:file:bg-yellow-200"
                />
                {electricityFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <Upload className="w-4 h-4 text-green-600" />
                    <span className="text-green-700 font-medium">
                      {electricityFile.name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* OCR Status */}
            {electricityOCR.message && (
              <div
                className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
                  electricityOCR.status === "success"
                    ? "bg-green-50 border border-green-200"
                    : electricityOCR.status === "error"
                    ? "bg-red-50 border border-red-200"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                {getStatusIcon(electricityOCR.status)}
                <span className="text-sm">{electricityOCR.message}</span>
              </div>
            )}

            {/* Manual Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                ⚡ Chỉ số điện (kWh) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="electricityReading"
                value={formData.electricityReading}
                onChange={handleChange}
                required
                min="0"
                step="0.1"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 text-lg font-bold"
                placeholder="1150.5"
              />
            </div>
          </div>

          {/* Water */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-400 rounded-lg flex items-center justify-center">
                <Droplet className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">Water Meter</h3>
            </div>

            {/* File Upload */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📸 Chụp/Tải ảnh công tơ nước
              </label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleWaterFileChange}
                  className="w-full px-4 py-3 border-2 border-dashed border-blue-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-100 file:text-blue-700 hover:file:bg-blue-200"
                />
                {waterFile && (
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <Upload className="w-4 h-4 text-green-600" />
                    <span className="text-green-700 font-medium">
                      {waterFile.name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* OCR Status */}
            {waterOCR.message && (
              <div
                className={`mb-4 p-3 rounded-lg flex items-start gap-2 ${
                  waterOCR.status === "success"
                    ? "bg-green-50 border border-green-200"
                    : waterOCR.status === "error"
                    ? "bg-red-50 border border-red-200"
                    : "bg-blue-50 border border-blue-200"
                }`}
              >
                {getStatusIcon(waterOCR.status)}
                <span className="text-sm">{waterOCR.message}</span>
              </div>
            )}

            {/* Manual Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                💧 Chỉ số nước (m³) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="waterReading"
                value={formData.waterReading}
                onChange={handleChange}
                required
                min="0"
                step="0.1"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-bold"
                placeholder="220.5"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  Save Readings
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MeterReadingModal;
