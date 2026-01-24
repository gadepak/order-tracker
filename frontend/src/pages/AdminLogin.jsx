import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

import {
  Box,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
} from "@mui/material";
import { styled } from "@mui/material/styles";

// ---------- Brand / Design Tokens ----------
const brandColors = {
  primary: "#088389",       // main accent
  primarySoft: "#D7F2EE",   // soft teal background
  background: "#F7F8F5",    // page background
  surface: "#FFFFFF",       // card
  border: "#E1E4DA",        // light border
  textMain: "#111827",      // dark text
  textSecondary: "#6B7280", // muted text
};

// ---------- Styled wrappers ----------
const PageWrapper = styled("div")(() => ({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: brandColors.background,
  padding: "24px",
}));

const CardWrapper = styled(Paper)(() => ({
  width: "100%",
  maxWidth: 420,
  padding: "32px 28px",
  borderRadius: 16,
  border: `1px solid ${brandColors.border}`,
  backgroundColor: brandColors.surface,
  boxShadow: "0 18px 40px rgba(15, 23, 42, 0.05)",
}));

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await API.post("/auth/login", { email, password });
      console.log("Login success:", res.data);
      localStorage.setItem("token", res.data.token);
      navigate("/admin/dashboard");
    } catch (err) {
      console.log("Login error:", err.response ? err.response.data : err);
      setError("Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageWrapper>
      {/* Centered Brand Title */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: brandColors.primary,
          }}
        >
          prohiten
        </Typography>
        <Typography
          variant="body2"
          sx={{ mt: 0.5, color: brandColors.textSecondary }}
        >
          Admin Console
        </Typography>
      </Box>

      {/* Login Card */}
      <CardWrapper elevation={0}>
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            mb: 0.5,
            color: brandColors.textMain,
          }}
        >
          Admin Login
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: brandColors.textSecondary, mb: 3 }}
        >
          Sign in to manage and track orders.
        </Typography>

        <form onSubmit={handleLogin}>
          <Box sx={{ mb: 2 }}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              size="small"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          <Box sx={{ mb: 2.5 }}>
            <TextField
              label="Password"
              type="password"
              fullWidth
              size="small"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputLabelProps={{ shrink: true }}
            />
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{ mb: 2.5, borderRadius: 2 }}
            >
              {error}
            </Alert>
          )}

          <Button
            type="submit"
            fullWidth
            disabled={submitting}
            sx={{
              mt: 1,
              mb: 2,
              textTransform: "none",
              borderRadius: 999,
              paddingY: 1.1,
              fontWeight: 600,
              backgroundColor: brandColors.primary,
              color: "#FFFFFF",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#066C6C",
                boxShadow: "0 10px 22px rgba(8, 131, 137, 0.28)",
              },
            }}
          >
            {submitting ? "Logging in..." : "Login"}
          </Button>
        </form>

        <Box sx={{ textAlign: "center", mt: 1 }}>
          <Typography
            variant="body2"
            component="a"
            href="/"
            sx={{
              textDecoration: "none",
              color: brandColors.textSecondary,
              "&:hover": { color: brandColors.primary },
              cursor: "pointer",
            }}
          >
            Back to tracking
          </Typography>
        </Box>
      </CardWrapper>
    </PageWrapper>
  );
}
