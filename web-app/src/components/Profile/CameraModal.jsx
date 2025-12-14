import React, { useRef, useEffect } from "react";
import { X } from "lucide-react";
import jsQR from "jsqr";

const CameraModal = ({ show, onClose, onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const processCanvasRef = useRef(null); // Canvas để xử lý ảnh
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    if (show) startCamera();
    return () => stopCamera();
  }, [show]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });

      videoRef.current.srcObject = stream;
      streamRef.current = stream;

      setTimeout(() => startAutoScan(), 500);
    } catch (err) {
      alert("Không thể truy cập camera!");
      onClose();
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
    }
  };

  const startAutoScan = () => {
    scanIntervalRef.current = setInterval(() => detectQRCode(), 300);
  };

  const detectQRCode = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // 👉 Tăng độ sáng và tương phản
    enhanceImage(imageData);

    const qr = jsQR(imageData.data, canvas.width, canvas.height);

    if (qr) {
      console.log("QR detected:", qr.data);
      autoCapture();
    }
  };

  // =======================================
  // 🚀 FILTER NÂNG CẤP CHẤT LƯỢNG HÌNH ẢNH
  // =======================================
  const enhanceImage = (imageData) => {
    const data = imageData.data;

    const brightness = 20; // tăng sáng
    const contrast = 1.3; // tăng tương phản
    const sharpenStrength = 0.6;

    // Brightness + Contrast
    for (let i = 0; i < data.length; i += 4) {
      // RGB
      data[i] = (data[i] - 128) * contrast + 128 + brightness;
      data[i + 1] = (data[i + 1] - 128) * contrast + 128 + brightness;
      data[i + 2] = (data[i + 2] - 128) * contrast + 128 + brightness;
    }

    // Sharpen (make image clearer)
    applySharpenFilter(imageData, sharpenStrength);
  };

  // Sharpen Filter (làm nét hình)
  const applySharpenFilter = (imageData, strength = 0.5) => {
    const width = imageData.width;
    const height = imageData.height;
    const src = imageData.data;

    const copy = new Uint8ClampedArray(src);

    const kernel = [
      0,
      -strength,
      0,
      -strength,
      1 + strength * 4,
      -strength,
      0,
      -strength,
      0,
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let idx = (y * width + x) * 4;

        for (let c = 0; c < 3; c++) {
          // R G B
          let newVal = 0;
          let k = 0;

          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              let pixelIndex = ((y + ky) * width + (x + kx)) * 4 + c;
              newVal += copy[pixelIndex] * kernel[k++];
            }
          }

          src[idx + c] = Math.min(255, Math.max(0, newVal));
        }
      }
    }
  };

  const autoCapture = () => {
    const video = videoRef.current;
    const canvas = processCanvasRef.current || canvasRef.current;

    const ctx = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 👉 Lấy ảnh đã xử lý, rõ nét
    canvas.toBlob(
      (blob) => {
        const file = new File([blob], "id-card-enhanced.jpg", {
          type: "image/jpeg",
        });

        stopCamera();
        onCapture(file);
        onClose();
      },
      "image/jpeg",
      0.95
    );
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xl font-bold">Scanning ID Card…</h3>
          <button onClick={onClose}>
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full rounded-lg"
        />
        <canvas ref={canvasRef} className="hidden" />
        <canvas ref={processCanvasRef} className="hidden" />

        <p className="text-center text-sm mt-2 text-gray-500">
          👀 Automatically detecting QR code... Please hold the CCCD steady and
          bright enough
        </p>

        <button
          onClick={onClose}
          className="mt-4 px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default CameraModal;
