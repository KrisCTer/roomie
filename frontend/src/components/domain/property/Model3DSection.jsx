import React from "react";
import Model3DViewer from "./Model3DViewer";

/**
 * 3D Model Section for Property Detail page.
 * Viewer-only: shows model if COMPLETED + visible, or processing/failed status.
 * No generate button — that's in Edit Property Step 4.
 */
const Model3DSection = ({ property }) => {
  const { model3dStatus, model3dUrl, model3dVisible } = property || {};

  // Only show if owner enabled visibility or model is processing
  if (!model3dStatus || model3dStatus === "NONE") return null;
  if (model3dStatus === "COMPLETED" && !model3dVisible) return null;

  // Processing state
  if (model3dStatus === "PROCESSING") {
    return (
      <div className="model-3d-section" style={sectionStyle}>
        <div style={headerStyle}>
          <div style={titleRowStyle}>
            <span style={iconStyle}>🧊</span>
            <h3 style={titleStyle}>Mô hình 3D</h3>
          </div>
        </div>
        <div style={processingCardStyle}>
          <div style={spinnerContainerStyle}>
            <div style={spinnerStyle} />
          </div>
          <p style={processingTextStyle}>Đang tạo mô hình 3D...</p>
          <p style={processingSubtextStyle}>
            Quá trình này có thể mất 5-30 phút tùy thuộc vào số lượng ảnh.
          </p>
        </div>
        <style>{spinnerCSS}</style>
      </div>
    );
  }

  // Failed state
  if (model3dStatus === "FAILED") {
    return (
      <div className="model-3d-section" style={sectionStyle}>
        <div style={headerStyle}>
          <div style={titleRowStyle}>
            <span style={iconStyle}>🧊</span>
            <h3 style={titleStyle}>Mô hình 3D</h3>
          </div>
        </div>
        <div style={failedCardStyle}>
          <span style={{ fontSize: "32px" }}>⚠️</span>
          <p style={failedTextStyle}>Tạo mô hình 3D không thành công</p>
          <p style={failedSubtextStyle}>
            Chủ phòng trọ đang xử lý lại mô hình 3D.
          </p>
        </div>
      </div>
    );
  }

  // Completed state — show viewer
  if (model3dStatus === "COMPLETED" && model3dUrl) {
    return (
      <div className="model-3d-section" style={sectionStyle}>
        <div style={headerStyle}>
          <div style={titleRowStyle}>
            <span style={iconStyle}>🧊</span>
            <h3 style={titleStyle}>Mô hình 3D</h3>
          </div>
        </div>
        <Model3DViewer modelUrl={model3dUrl} propertyTitle={property?.title} />
        <p style={hintStyle}>
          🖱️ Kéo để xoay • Cuộn để zoom • Click đúp để reset
        </p>
      </div>
    );
  }

  return null;
};

// ===== Styles =====

const spinnerCSS = `
  @keyframes model3d-spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const sectionStyle = { marginTop: "24px", marginBottom: "24px" };

const headerStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "16px",
};

const titleRowStyle = { display: "flex", alignItems: "center", gap: "8px" };
const iconStyle = { fontSize: "24px" };
const titleStyle = {
  margin: 0,
  fontSize: "20px",
  fontWeight: 700,
  color: "#111827",
};

const hintStyle = {
  textAlign: "center",
  color: "#64748b",
  fontSize: "13px",
  marginTop: "12px",
};

const processingCardStyle = {
  padding: "40px",
  background: "rgba(99,102,241,0.06)",
  border: "1px solid rgba(99,102,241,0.15)",
  borderRadius: "16px",
  textAlign: "center",
};

const spinnerContainerStyle = {
  display: "flex",
  justifyContent: "center",
  marginBottom: "16px",
};

const spinnerStyle = {
  width: "40px",
  height: "40px",
  border: "3px solid rgba(99,102,241,0.2)",
  borderTop: "3px solid #6366f1",
  borderRadius: "50%",
  animation: "model3d-spin 1s linear infinite",
};

const processingTextStyle = {
  fontSize: "16px",
  fontWeight: 600,
  color: "#e2e8f0",
  margin: "0 0 8px",
};

const processingSubtextStyle = {
  fontSize: "14px",
  color: "#94a3b8",
  margin: 0,
};

const failedCardStyle = {
  padding: "40px",
  background: "rgba(239,68,68,0.06)",
  border: "1px solid rgba(239,68,68,0.15)",
  borderRadius: "16px",
  textAlign: "center",
};

const failedTextStyle = {
  fontSize: "16px",
  fontWeight: 600,
  color: "#fca5a5",
  margin: "12px 0 8px",
};

const failedSubtextStyle = {
  fontSize: "14px",
  color: "#94a3b8",
  margin: 0,
};

export default Model3DSection;
