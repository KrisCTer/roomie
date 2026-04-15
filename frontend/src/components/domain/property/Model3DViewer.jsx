import React, { useEffect, useRef, useState } from "react";

/**
 * 3D Model Viewer using Google's <model-viewer> web component.
 * Renders a .glb file with orbit controls, auto-rotate, and AR support.
 */
const Model3DViewer = ({ modelUrl, propertyTitle }) => {
  const viewerRef = useRef(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    import("@google/model-viewer");
  }, []);

  useEffect(() => {
    const el = viewerRef.current;
    if (!el) return;

    const onLoad = () => setLoaded(true);
    el.addEventListener("load", onLoad);
    return () => el.removeEventListener("load", onLoad);
  }, [modelUrl]);

  if (!modelUrl) return null;

  return (
    <div style={containerStyle}>
      <model-viewer
        ref={viewerRef}
        src={modelUrl}
        alt={`Mô hình 3D - ${propertyTitle || "Phòng trọ"}`}
        auto-rotate
        camera-controls
        orientation="180deg 0 0"
        shadow-intensity="1"
        exposure="1"
        environment-image="neutral"
        style={viewerStyle}
        camera-orbit="45deg 55deg auto"
        min-camera-orbit="auto 0deg auto"
        max-camera-orbit="auto 180deg auto"
        interaction-prompt="auto"
        loading="eager"
        reveal="auto"
      />

      {/* Loading overlay — hides when model finishes loading */}
      {!loaded && (
        <div style={overlayStyle}>
          <div style={spinnerStyle} />
          <p style={loadingTextStyle}>Đang tải mô hình 3D...</p>
          <style>{spinnerCSS}</style>
        </div>
      )}

      <style>{globalCSS}</style>
    </div>
  );
};

// Hide model-viewer's default progress bar
const globalCSS = `
  model-viewer::part(default-progress-bar) {
    display: none;
  }
`;

const spinnerCSS = `
  @keyframes mv-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const containerStyle = {
  position: "relative",
  width: "100%",
  borderRadius: "16px",
  overflow: "hidden",
  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
  border: "1px solid rgba(255,255,255,0.08)",
  boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
};

const viewerStyle = {
  width: "100%",
  height: "500px",
  backgroundColor: "transparent",
};

const overlayStyle = {
  position: "absolute",
  inset: 0,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
  zIndex: 10,
};

const spinnerStyle = {
  width: "40px",
  height: "40px",
  border: "3px solid rgba(99,102,241,0.2)",
  borderTop: "3px solid #6366f1",
  borderRadius: "50%",
  animation: "mv-spin 1s linear infinite",
};

const loadingTextStyle = {
  color: "#94a3b8",
  fontSize: "14px",
  marginTop: "16px",
};

export default Model3DViewer;
