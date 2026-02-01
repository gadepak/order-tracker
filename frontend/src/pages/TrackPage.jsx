import React, { useState } from "react";
import API from "../api";

const brand = {
  primary: "#088389",
  bg: "#F7F8F5",
  card: "#FFFFFF",
  border: "#E1E4DA",
  text: "#0F172A",
  muted: "#6B7280",
};

export default function TrackPage() {
  const [orderCode, setOrderCode] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const steps = ["CUTTING", "PERFORATED", "BENDING", "COMPLETED"];

  async function handleTrack(e) {
    e.preventDefault();
    setError("");
    setOrder(null);

    if (!orderCode.trim()) {
      setError("Please enter an order code.");
      return;
    }

    try {
      setLoading(true);
      const res = await API.get(`/orders/by-code/${orderCode.trim()}`);
      setOrder(res.data.order);
    } catch {
      setError("Order not found. Please check your Order Code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: brand.bg,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <header
        style={{
          background: brand.card,
          borderBottom: `1px solid ${brand.border}`,
          padding: "20px 32px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 900,
              letterSpacing: 4,
              color: brand.primary,
            }}
          >
            PROHITEN
          </div>
          <div style={{ fontSize: 12, color: brand.muted }}>
            Order Tracking System
          </div>
        </div>

        <button
          onClick={() => (window.location.href = "/admin/login")}
          style={{
            border: `1px solid ${brand.primary}`,
            background: "transparent",
            color: brand.primary,
            padding: "6px 14px",
            borderRadius: 999,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Admin Login
        </button>
      </header>

      {/* MAIN */}
      <main style={{ flex: 1, padding: "48px 16px" }}>
        {/* SEARCH CARD */}
        <div
          style={{
            maxWidth: 520,
            margin: "0 auto",
            background: brand.card,
            borderRadius: 16,
            border: `1px solid ${brand.border}`,
            padding: 32,
          }}
        >
          <h2
            style={{
              textAlign: "center",
              marginBottom: 8,
              color: brand.text,
            }}
          >
            Track Your Order
          </h2>
          <p
            style={{
              textAlign: "center",
              color: brand.muted,
              marginBottom: 24,
            }}
          >
            Enter your order code to see real-time status updates.
          </p>

          <form onSubmit={handleTrack}>
            <input
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
              placeholder="Enter Order Code (e.g. ORD-0005)"
              style={{
                width: "100%",
                padding: "12px 14px",
                borderRadius: 10,
                border: `1px solid ${brand.border}`,
                marginBottom: 12,
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: brand.primary,
                color: "#fff",
                border: "none",
                padding: "12px",
                borderRadius: 999,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {loading ? "Searching..." : "Track Order"}
            </button>

            {error && (
              <div
                style={{
                  marginTop: 16,
                  background: "#FEE2E2",
                  color: "#991B1B",
                  padding: 10,
                  borderRadius: 8,
                  textAlign: "center",
                }}
              >
                {error}
              </div>
            )}
          </form>
        </div>

        {/* ORDER RESULT */}
        {order && (
          <div
            style={{
              maxWidth: 700,
              margin: "32px auto 0",
              background: brand.card,
              borderRadius: 16,
              border: `1px solid ${brand.border}`,
              padding: 32,
            }}
          >
            <h3 style={{ marginBottom: 16 }}>
              Order Code: <strong>{order.order_code}</strong>
            </h3>

            {/* DETAILS */}
            <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
              <div style={{ flex: 1 }}>
                <p><strong>Tray Type:</strong> {order.tray_type}</p>
                <p><strong>S.No:</strong> {order.serial_no}</p>
                <p><strong>Make:</strong> {order.make}</p>
              </div>
              <div style={{ flex: 1 }}>
                <p><strong>Dimensions:</strong> {order.dimensions}</p>
                <p><strong>Nos:</strong> {order.nos}</p>
                <p><strong>Size:</strong> {order.size}</p>
              </div>
            </div>

            {/* TIMELINE */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 32,
              }}
            >
              {steps.map((step, idx) => {
                const active = steps.indexOf(order.status) >= idx;

                return (
                  <div key={step} style={{ textAlign: "center", flex: 1 }}>
                    <div
                      style={{
                        width: 36,
                        height: 36,
                        borderRadius: "50%",
                        margin: "0 auto",
                        background: active ? brand.primary : "#CBD5E1",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div
                      style={{
                        marginTop: 6,
                        fontSize: 12,
                        color: active ? brand.primary : brand.muted,
                        fontWeight: 600,
                      }}
                    >
                      {step}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DATES */}
            <div style={{ marginTop: 24, fontSize: 12, color: brand.muted }}>
              <p>
                <strong>Created:</strong>{" "}
                {new Date(order.created_at).toLocaleString()}
              </p>
              <p>
                <strong>Updated:</strong>{" "}
                {new Date(order.updated_at).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </main>

      {/* FOOTER */}
      <footer
        style={{
          textAlign: "center",
          padding: 16,
          fontSize: 12,
          color: brand.muted,
        }}
      >
        © 2025 Prohiten · Order Tracking System
      </footer>
    </div>
  );
}
