import React, { useRef, useEffect, useState } from "react";

/**
 * Model3DViewer - Interactive 3D model viewer using Google's model-viewer.
 * Renders GLB/GLTF models with camera controls, auto-rotate, and shadow.
 * @param {{ modelUrl: string, propertyTitle: string }} props
 */
const Model3DViewer = ({ modelUrl, propertyTitle }) => {
  const containerRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !modelUrl) return;

    // Clear previous content
    containerRef.current.innerHTML = "";

    // Create model-viewer element directly via DOM API
    const viewer = document.createElement("model-viewer");
    viewer.setAttribute("src", modelUrl);
    viewer.setAttribute("alt", `Mô hình 3D - ${propertyTitle || "Property"}`);
    viewer.setAttribute("camera-controls", "");
    viewer.setAttribute("auto-rotate", "");
    viewer.setAttribute("auto-rotate-delay", "2000");
    viewer.setAttribute("rotation-per-second", "30deg");
    viewer.setAttribute("shadow-intensity", "1.2");
    viewer.setAttribute("shadow-softness", "0.8");
    viewer.setAttribute("environment-image", "neutral");
    viewer.setAttribute("exposure", "1.1");
    viewer.setAttribute("interaction-prompt", "auto");
    viewer.setAttribute("camera-orbit", "45deg 55deg 2.5m");
    viewer.setAttribute("field-of-view", "45deg");
    viewer.setAttribute("loading", "eager");
    viewer.setAttribute("ar", "");
    viewer.setAttribute("ar-modes", "webxr scene-viewer quick-look");
    viewer.style.width = "100%";
    viewer.style.height = "500px";
    viewer.style.borderRadius = "16px";
    viewer.style.background =
      "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)";
    viewer.style.border = "1px solid rgba(255,255,255,0.1)";
    viewer.style.boxShadow = "0 8px 32px rgba(0,0,0,0.3)";
    viewer.style.display = "block";

    viewer.addEventListener("error", () => {
      setError(true);
    });

    containerRef.current.appendChild(viewer);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, [modelUrl, propertyTitle]);

  if (!modelUrl) return null;

  if (error) {
    return (
      <div style={errorStyle}>
        <span style={{ fontSize: "32px" }}>⚠️</span>
        <p style={{ color: "#fca5a5", fontWeight: 600, margin: "12px 0 4px" }}>
          Không thể tải mô hình 3D
        </p>
        <p style={{ color: "#94a3b8", fontSize: "14px", margin: 0 }}>
          File mô hình không hợp lệ hoặc không thể truy cập.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={`Mô hình 3D - ${propertyTitle || 'Phòng trọ'}`}
      style={{ minHeight: "500px" }}
    />
  );
};

const errorStyle = {
  padding: "40px",
  background: "rgba(239,68,68,0.06)",
  border: "1px solid rgba(239,68,68,0.15)",
  borderRadius: "16px",
  textAlign: "center",
};

export default Model3DViewer;
