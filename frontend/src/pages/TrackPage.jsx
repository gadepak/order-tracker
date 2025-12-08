// src/pages/TrackPage.jsx
import React, { useState } from "react";
import API from "../api";
import "bootstrap/dist/css/bootstrap.min.css";

import { styled } from "@mui/material/styles";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Chip,
} from "@mui/material";

const STATUS_STEPS = ["registered", "processing", "completing", "completed"];

// ---------- Brand Colors ----------
const brand = {
  primary: "#088389",
  primarySoft: "#D7F2EE",
  navbar: "#F4F4F0",
  background: "#F7F8F5",
  surface: "#FFFFFF",
  border: "#E1E4DA",
  textMain: "#111827",
  textSecondary: "#6B7280",
};

// ---------- Styled Components ----------
const PageWrapper = styled("div")(() => ({
  minHeight: "100vh",
  backgroundColor: brand.background,
  display: "flex",
  flexDirection: "column",
}));

const Navbar = styled("header")(() => ({
  backgroundColor: brand.navbar,
  borderBottom: `1px solid ${brand.border}`,
  padding: "18px 0",
  textAlign: "center",
  position: "relative",
}));

const NavTitle = styled(Typography)(() => ({
  fontWeight: 700,
  fontSize: 22,
  textTransform: "uppercase",
  letterSpacing: 8,
  color: brand.primary,
}));

const AdminButton = styled("a")(() => ({
  position: "absolute",
  right: 20,
  top: "50%",
  transform: "translateY(-50%)",
  padding: "6px 14px",
  borderRadius: 50,
  textDecoration: "none",
  border: `1px solid ${brand.primary}`,
  color: brand.primary,
  fontSize: 13,
  fontWeight: 600,
  transition: "0.2s",
  "&:hover": {
    backgroundColor: brand.primary,
    color: "#fff",
  },
}));

const CardWrapper = styled(Paper)(() => ({
  borderRadius: 18,
  padding: "28px",
  border: `1px solid ${brand.border}`,
  backgroundColor: brand.surface,
  boxShadow: "0 18px 40px rgba(0,0,0,0.06)",
}));

const Timeline = styled("div")(() => ({
  display: "flex",
  justifyContent: "space-between",
  position: "relative",
  marginBottom: 30,
}));

const Step = styled("div")(({ active }) => ({
  textAlign: "center",
  flex: 1,
  position: "relative",
  color: active ? brand.primary : brand.textSecondary,
}));

const StepCircle = styled("div")(({ active }) => ({
  width: 34,
  height: 34,
  borderRadius: "50%",
  margin: "0 auto",
  backgroundColor: active ? brand.primary : "#E5E7EB",
  color: active ? "#fff" : brand.textSecondary,
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  fontWeight: 600,
  transition: "0.2s",
}));

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

  function indexOfStep() {
    if (!order) return -1;
    return STATUS_STEPS.indexOf(order.status);
  }

  return (
    <PageWrapper>
      {/* NAVBAR */}
      <Navbar>
        <NavTitle>PROHITEN</NavTitle>
        <AdminButton href="/admin/login">Admin</AdminButton>
      </Navbar>

      {/* MAIN */}
      <Box sx={{ padding: "40px 16px", flexGrow: 1 }}>
        <div className="container" style={{ maxWidth: 780 }}>
          <CardWrapper>

            <Typography
              variant="h5"
              sx={{ fontWeight: 700, textAlign: "center", mb: 1 }}
            >
              Track Your Order
            </Typography>

            <Typography
              variant="body2"
              sx={{ textAlign: "center", color: brand.textSecondary, mb: 3 }}
            >
              Enter your order code to view real-time status.
            </Typography>

            {/* Search Bar */}
            <form
              onSubmit={handleTrack}
              style={{ display: "flex", gap: 12, marginBottom: 18 }}
            >
              <TextField
                fullWidth
                variant="outlined"
                size="small"
                placeholder="e.g., ABC_12"
                value={orderCode}
                onChange={(e) => setOrderCode(e.target.value)}
              />
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                sx={{
                  backgroundColor: brand.primary,
                  textTransform: "none",
                  borderRadius: 50,
                  px: 3,
                  "&:hover": { backgroundColor: "#066C6C" },
                }}
              >
                {loading ? "..." : "Track"}
              </Button>
            </form>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {order && (
              <Box sx={{ mt: 3 }}>
                {/* TIMELINE */}
                <Timeline>
                  {STATUS_STEPS.map((step, i) => {
                    const active = i <= indexOfStep();
                    return (
                      <Step key={i} active={active}>
                        <StepCircle active={active}>{i + 1}</StepCircle>
                        <Typography
                          variant="caption"
                          className="text-capitalize"
                          sx={{ mt: 1, display: "block" }}
                        >
                          {step}
                        </Typography>
                      </Step>
                    );
                  })}
                </Timeline>

                {/* ORDER DETAILS */}
                <Box sx={{ mt: 3 }}>
                  <Typography
                    sx={{
                      textTransform: "uppercase",
                      fontSize: 12,
                      fontWeight: 600,
                      mb: 1,
                      color: brand.textSecondary,
                    }}
                  >
                    Order
                  </Typography>
                  <p><strong>Code:</strong> {order.order_code}</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <Chip
                      size="small"
                      label={order.status}
                      sx={{
                        backgroundColor: brand.primarySoft,
                        color: brand.primary,
                        textTransform: "capitalize",
                      }}
                    />
                  </p>
                  <p><strong>Quantity:</strong> {order.quantity}</p>

                  <hr />

                  <Typography
                    sx={{
                      textTransform: "uppercase",
                      fontSize: 12,
                      fontWeight: 600,
                      mb: 1,
                      color: brand.textSecondary,
                    }}
                  >
                    Customer
                  </Typography>
                  <p><strong>Name:</strong> {order.customer_name}</p>
                  <p><strong>Registered:</strong> {new Date(order.created_at).toLocaleString()}</p>
                  <p><strong>Updated:</strong> {new Date(order.updated_at).toLocaleString()}</p>

                  <hr />

                  <Typography
                    sx={{
                      textTransform: "uppercase",
                      fontSize: 12,
                      fontWeight: 600,
                      mb: 1,
                      color: brand.textSecondary,
                    }}
                  >
                    Product
                  </Typography>
                  <p><strong>{order.product_name}</strong></p>
                  {order.product_description && (
                    <p className="text-muted">{order.product_description}</p>
                  )}
                </Box>
              </Box>
            )}
          </CardWrapper>
        </div>
      </Box>

      {/* FOOTER */}
      <footer
        style={{
          background: brand.navbar,
          padding: "14px 0",
          borderTop: `1px solid ${brand.border}`,
          textAlign: "center",
          color: brand.textSecondary,
          fontSize: 13,
        }}
      >
        © {new Date().getFullYear()} Prohiten · Order Tracking System
      </footer>
    </PageWrapper>
  );
}
  