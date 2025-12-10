import React, { useState } from "react";
import API from "../api";
import "./TrackPage.css";

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
    } catch (err) {
      setError("Order not found. Please check your Order Code.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="track-page">

      {/* Header */}
      <div className="tp-header d-flex justify-content-between align-items-center px-4">
        <div>
          <div className="tp-logo">PROHITEN</div>
          <div className="tp-subtitle text-muted">Order Tracking System</div>
        </div>

        {/* ADMIN LOGIN BUTTON */}
        <button
          className="btn btn-outline-primary px-3"
          onClick={() => (window.location.href = "/admin/login")}
        >
          Admin
        </button>
      </div>

      {/* Main Section */}
      <div className="container tp-main">

        {/* Search Card */}
        <div className="tp-card mx-auto animate-fade-in" style={{ maxWidth: "520px" }}>
          <h4 className="tp-title mb-2 text-center">Track Your Order</h4>
          <p className="text-center text-muted mb-4">
            Enter your order code to view your order status.
          </p>

          <form onSubmit={handleTrack}>
            <input
              className="form-control tp-input"
              placeholder="Enter order code (e.g. ORD-0005)"
              value={orderCode}
              onChange={(e) => setOrderCode(e.target.value)}
            />

            <button type="submit" className="btn btn-primary w-100 mt-3" disabled={loading}>
              {loading ? "Searching..." : "Track Order"}
            </button>

            {error && <div className="alert alert-danger mt-3">{error}</div>}
          </form>
        </div>

        {/* Order Result */}
        {order && (
          <div
            className="tp-order-card mx-auto mt-4 animate-fade-in"
            style={{ maxWidth: "650px" }}
          >
            <h5>
              Order Code: <strong>{order.order_code}</strong>
            </h5>

            <div className="row mt-3">
              <div className="col-6">
                <p><strong>Tray Type:</strong> {order.tray_type}</p>
                <p><strong>S.No:</strong> {order.serial_no}</p>
                <p><strong>Make:</strong> {order.make}</p>
              </div>

              <div className="col-6">
                <p><strong>Dimensions:</strong> {order.dimensions}</p>
                <p><strong>Nos:</strong> {order.nos}</p>
                <p><strong>Size:</strong> {order.size}</p>
              </div>
            </div>

            {/* Timeline */}
            <div className="tp-timeline mt-4">
              {steps.map((step, idx) => {
                const isActive = steps.indexOf(order.status) >= idx;

                return (
                  <div key={step} className={`tp-step ${isActive ? "tp-step-active" : ""}`}>
                    <div className="tp-step-circle">{idx + 1}</div>
                    <div className="tp-step-label">{step.toLowerCase()}</div>
                    {idx < steps.length - 1 && <div className="tp-step-line"></div>}
                  </div>
                );
              })}
            </div>

            {/* Dates */}
            <div className="text-muted small mt-4">
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

      </div>

      {/* Footer */}
      <div className="tp-footer text-center text-muted">
        © 2025 Prohiten · Order Tracking System
      </div>
    </div>
  );
}
