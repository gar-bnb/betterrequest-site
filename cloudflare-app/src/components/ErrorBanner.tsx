// /cloudflare-app/src/components/ErrorBanner.tsx
//import React from "react";

type Kind = "error" | "success" | "info";

export default function ErrorBanner({
  kind = "error",
  title,
  message,
  onClose,
}: {
  kind?: Kind;
  title?: string;
  message: string;
  onClose?: () => void;
}) {
  const palette: Record<Kind, { bg: string; border: string; text: string }> = {
    error:   { bg: "#fef2f2", border: "#fecaca", text: "#991b1b" },
    success: { bg: "#ecfdf5", border: "#a7f3d0", text: "#065f46" },
    info:    { bg: "#eff6ff", border: "#bfdbfe", text: "#1e40af" },
  };
  const c = palette[kind];

  return (
    <div
      className="card"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        color: c.text,
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: 14,
      }}
      role={kind === "error" ? "alert" : "status"}
    >
      <div style={{ fontWeight: 800, minWidth: 60, textTransform: "uppercase", fontSize: 12 }}>
        {kind}
      </div>
      <div style={{ flex: 1 }}>
        {title && <div style={{ fontWeight: 800 }}>{title}</div>}
        <div className="text-sm" style={{ color: c.text }}>{message}</div>
      </div>
      {onClose && (
        <button
          className="btn"
          onClick={onClose}
          aria-label="Dismiss"
          style={{ background: "#fff", border: `1px solid ${c.border}`, padding: "6px 10px" }}
        >
          ×
        </button>
      )}
    </div>
  );
}
