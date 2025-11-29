// src/pages/TrackPage.jsx
import React, { useState } from "react";
import API from "../api";
import "bootstrap/dist/css/bootstrap.min.css";
import "./TrackPage.css";

const STATUS_STEPS = ["registered", "processing", "completing", "completed"];

export default function TrackPage() {
  const [orderCode, setOrderCode] = useState("");
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleTrack(e) {
    e.preventDefault();
    if (!orderCode.trim()) return;

    setError("");
    setOrder(null);
    setLoading(true);

    try {
      const res = await API.get(`/orders/by-code/${orderCode.trim()}`);
      setOrder(res.data.order);
    } catch (err) {
      console.error(err);
      setError("Order not found. Please check your Order Code.");
    } finally {
      setLoading(false);
    }
  }

  function currentStepIndex() {
    if (!order) return -1;
    const idx = STATUS_STEPS.indexOf(order.status);
    return idx === -1 ? 0 : idx;
  }

  return (
    <div className="track-page">

      {/* Header */}
      <header className="tp-header shadow-sm">
        <div className="container d-flex align-items-center justify-content-between">
          <div className="d-flex flex-column">
            <span className="tp-logo">OrderTracker</span>
            <small className="text-muted tp-subtitle">
              Simple, secure order status tracking
            </small>
          </div>

          {/* Admin login button */}
          <a href="/admin/login" className="btn btn-outline-primary btn-sm tp-admin-btn">
            Admin Login
          </a>
        </div>
      </header>

      {/* Main content */}
      <main className="tp-main">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-7 col-md-9">
              <div className="tp-card shadow-sm">
                <h3 className="tp-title mb-3 text-center">Track Your Order</h3>
                <p className="text-muted text-center mb-4">
                  Enter your order code to view live status and details.
                </p>

                {/* Input + button */}
                <form onSubmit={handleTrack} className="d-flex gap-2 mb-3">
                  <input
                    className="form-control tp-input"
                    placeholder="Enter Order Code (e.g., ABC_2)"
                    value={orderCode}
                    onChange={(e) => setOrderCode(e.target.value)}
                  />
                  <button className="btn btn-primary px-4" type="submit" disabled={loading}>
                    {loading ? (
                      <span className="spinner-border spinner-border-sm" role="status" />
                    ) : (
                      "Track"
                    )}
                  </button>
                </form>

                {/* Helper text */}
                <div className="d-flex justify-content-between small text-muted mb-3">
                  <span>Tip: Use the code shared on your receipt.</span>
                  {order && (
                    <span>
                      Last updated: {new Date(order.updated_at).toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Error */}
                {error && <div className="alert alert-danger py-2">{error}</div>}

                {/* Order found */}
                {order && (
                  <div className="tp-order-card animate-fade-in mt-3">

                    {/* Status timeline */}
                    <div className="tp-timeline mb-4">
                      {STATUS_STEPS.map((step, index) => {
                        const activeIndex = currentStepIndex();
                        const isActive = index <= activeIndex;

                        return (
                          <div key={step} className={`tp-step ${isActive ? "tp-step-active" : ""}`}>
                            <div className="tp-step-circle">{index + 1}</div>
                            <span className="tp-step-label text-capitalize">{step}</span>
                            {index < STATUS_STEPS.length - 1 && <div className="tp-step-line" />}
                          </div>
                        );
                      })}
                    </div>

                    {/* Details layout */}
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <h6 className="text-muted text-uppercase small mb-2">Order</h6>
                        <p className="mb-1"><strong>Code:</strong> {order.order_code}</p>
                        <p className="mb-1">
                          <strong>Status:</strong> <span className="badge bg-info text-dark">{order.status}</span>
                        </p>
                        <p className="mb-0"><strong>Quantity:</strong> {order.quantity}</p>
                      </div>

                      <div className="col-md-6 mb-3">
                        <h6 className="text-muted text-uppercase small mb-2">Customer</h6>
                        <p className="mb-1"><strong>Name:</strong> {order.customer_name}</p>
                        <p className="mb-1"><strong>Registered:</strong> {new Date(order.created_at).toLocaleString()}</p>
                        <p className="mb-0"><strong>Last updated:</strong> {new Date(order.updated_at).toLocaleString()}</p>
                      </div>
                    </div>

                    <hr />

                    <div>
                      <h6 className="text-muted text-uppercase small mb-2">Product</h6>
                      <p className="mb-1"><strong>{order.product_name}</strong></p>
                      {order.product_description && (
                        <p className="mb-0 text-muted">{order.product_description}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="tp-footer">
        <div className="container d-flex justify-content-between small text-muted">
          <span>© {new Date().getFullYear()} OrderTracker</span>
          <span>Powered by Railway · Internal Tool</span>
        </div>
      </footer>
    </div>
  );
}
