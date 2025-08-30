import { useEffect, useRef } from "react";
import { toCanvas } from "qrcode";

type Props = { text: string; label?: string };

export default function QRCodeCard({ text, label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    // Void the promise to avoid unhandled promise lint noise
    void toCanvas(canvasRef.current, text, { width: 220 });
  }, [text]);

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 12, margin: 8, width: 260 }}>
      <canvas ref={canvasRef} />
      <div style={{ marginTop: 8, fontSize: 12, color: "#444" }}>{label || text}</div>
    </div>
  );
}
