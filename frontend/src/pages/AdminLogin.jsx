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
  IconButton,
  InputAdornment,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

/* ---------- Brand / Design Tokens ---------- */
const brandColors = {
  primary: "#088389",
  background: "#F7F8F5",
  surface: "#FFFFFF",
  border: "#E1E4DA",
  textMain: "#111827",
  textSecondary: "#6B7280",
};

/* ---------- Styled wrappers ---------- */
const PageWrapper = styled("div")(() => ({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: brandColors.background,
  padding: 24,
}));

const CardWrapper = styled(Paper)(() => ({
  width: "100%",
  maxWidth: 420,
  padding: "34px 30px",
  borderRadius: 18,
  border: `1px solid ${brandColors.border}`,
  backgroundColor: brandColors.surface,
  boxShadow: "0 22px 48px rgba(15, 23, 42, 0.06)",
}));

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/admin/dashboard");
    } catch {
      setError("Invalid email or password");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <PageWrapper>
      {/* Brand */}
      <Box sx={{ textAlign: "center", mb: 4 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 800,
            letterSpacing: 7,
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

      {/* Card */}
      <CardWrapper elevation={0}>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, mb: 0.5, color: brandColors.textMain }}
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
            />
          </Box>

          <Box sx={{ mb: 2.5 }}>
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              fullWidth
              size="small"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      edge="end"
                      onClick={() => setShowPassword((p) => !p)}
                      aria-label="toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
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
              py: 1.15,
              fontWeight: 600,
              backgroundColor: brandColors.primary,
              color: "#fff",
              boxShadow: "none",
              "&:hover": {
                backgroundColor: "#066C6C",
                boxShadow: "0 12px 26px rgba(8, 131, 137, 0.3)",
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
