// Debug component - Add this temporarily to see JWT contents
// components/TokenDebug.jsx

import React, { useEffect, useState } from "react";
import { getUserInfo, getToken } from "../services/localStorageService";

const TokenDebug = () => {
  const [tokenInfo, setTokenInfo] = useState(null);

  useEffect(() => {
    const token = getToken();
    const userInfo = getUserInfo();

    setTokenInfo({
      hasToken: !!token,
      tokenLength: token ? token.length : 0,
      userInfo: userInfo,
      fields: userInfo ? Object.keys(userInfo) : [],
    });
  }, []);

  if (!tokenInfo) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 10,
        right: 10,
        background: "#1a1a1a",
        color: "#fff",
        padding: "15px",
        borderRadius: "8px",
        fontSize: "12px",
        maxWidth: "400px",
        zIndex: 9999,
        fontFamily: "monospace",
      }}
    >
      <h4 style={{ margin: "0 0 10px 0", color: "#4CAF50" }}>
        🔍 JWT Debug Info
      </h4>

      <div style={{ marginBottom: "8px" }}>
        <strong>Has Token:</strong> {tokenInfo.hasToken ? "✅ Yes" : "❌ No"}
      </div>

      {tokenInfo.hasToken && (
        <>
          <div style={{ marginBottom: "8px" }}>
            <strong>Token Length:</strong> {tokenInfo.tokenLength}
          </div>

          <div style={{ marginBottom: "8px" }}>
            <strong>Available Fields:</strong>
            <div style={{ paddingLeft: "10px", color: "#4CAF50" }}>
              {tokenInfo.fields.join(", ")}
            </div>
          </div>

          <div style={{ marginBottom: "8px" }}>
            <strong>Full User Info:</strong>
            <pre
              style={{
                background: "#2a2a2a",
                padding: "8px",
                borderRadius: "4px",
                overflow: "auto",
                maxHeight: "200px",
                fontSize: "11px",
              }}
            >
              {JSON.stringify(tokenInfo.userInfo, null, 2)}
            </pre>
          </div>

          <div
            style={{
              marginTop: "10px",
              padding: "8px",
              background: "#2a2a2a",
              borderRadius: "4px",
            }}
          >
            <strong>Looking for:</strong>
            <ul style={{ margin: "5px 0", paddingLeft: "20px" }}>
              <li>userId: {tokenInfo.userInfo?.userId || "❌ NOT FOUND"}</li>
              <li>sub: {tokenInfo.userInfo?.sub || "❌ NOT FOUND"}</li>
              <li>user_id: {tokenInfo.userInfo?.user_id || "❌ NOT FOUND"}</li>
              <li>id: {tokenInfo.userInfo?.id || "❌ NOT FOUND"}</li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default TokenDebug;
