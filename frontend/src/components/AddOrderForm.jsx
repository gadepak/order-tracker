import React, { useState } from "react";
import {
  Box,
  TextField,
  Stack,
  Button,
  MenuItem,
  Typography,
  Divider,
} from "@mui/material";
import API from "../api";

export default function AddOrderForm({ onClose, onCreated }) {
  const [trayType, setTrayType] = useState("");
  const [serialNo, setSerialNo] = useState("");
  const [make, setMake] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [nos, setNos] = useState("");
  const [size, setSize] = useState("");
  const [status, setStatus] = useState("CUTTING");

  const [paymentStatus, setPaymentStatus] = useState("PAID");
  const [creditDays, setCreditDays] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const validatePhone = (p) => {
    const cleaned = p.replace(/\D/g, "");
    return cleaned.length >= 10 && cleaned.length <= 15;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!trayType || !serialNo || !make) {
      alert("Tray Type, S.No, and Make are required");
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (phone && !validatePhone(phone)) {
      alert("Please enter a valid phone number");
      return;
    }

    if (paymentStatus === "NOT_PAID" && (!creditDays || Number(creditDays) < 1)) {
      alert("Please enter valid credit days");
      return;
    }

    try {
      setSubmitting(true);

      await API.post("/orders", {
        tray_type: trayType,
        serial_no: serialNo,
        make,
        dimensions,
        nos,
        size,
        status,
        payment_status: paymentStatus,
        credit_days: paymentStatus === "NOT_PAID" ? Number(creditDays) : null,
        email: email || null,
        phone: phone || null,
      });

      onCreated?.();
      onClose?.();
    } catch (err) {
      console.error(err);
      alert("Failed to create order");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2.5,
        px: 1,
        width: "100%",
        maxWidth: 520,
      }}
    >
      {/* HEADER */}
      <Typography variant="h6" fontWeight={700}>
        Create New Order
      </Typography>

      {/* CUSTOMER DETAILS */}
      <Box>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Customer Contact
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Customer Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            fullWidth
            placeholder="customer@example.com"
          />

          <TextField
            label="Customer Phone (with country code)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            fullWidth
            placeholder="+91XXXXXXXXXX"
          />
        </Stack>
      </Box>

      <Divider />

      {/* ORDER DETAILS */}
      <Box>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Order Details
        </Typography>

        <Stack spacing={2}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Tray Type"
              value={trayType}
              onChange={(e) => setTrayType(e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Serial No"
              value={serialNo}
              onChange={(e) => setSerialNo(e.target.value)}
              fullWidth
              required
            />
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Make"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              fullWidth
              required
            />

            <TextField
              label="Size"
              value={size}
              onChange={(e) => setSize(e.target.value)}
              fullWidth
            />
          </Stack>

          <TextField
            label="Dimensions"
            value={dimensions}
            onChange={(e) => setDimensions(e.target.value)}
            fullWidth
            placeholder="e.g. 100 × 200 mm"
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Nos"
              type="number"
              value={nos}
              onChange={(e) => setNos(e.target.value)}
              fullWidth
            />

            <TextField
              select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              fullWidth
            >
              {["CUTTING", "PERFORATED", "BENDING", "COMPLETED"].map((s) => (
                <MenuItem key={s} value={s}>
                  {s}
                </MenuItem>
              ))}
            </TextField>
          </Stack>
        </Stack>
      </Box>

      <Divider />

      {/* PAYMENT DETAILS */}
      <Box>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Payment Details
        </Typography>

        <Stack spacing={2}>
          <TextField
            select
            label="Payment Status"
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            fullWidth
          >
            <MenuItem value="PAID">Paid</MenuItem>
            <MenuItem value="NOT_PAID">Not Paid</MenuItem>
          </TextField>

          {paymentStatus === "NOT_PAID" && (
            <TextField
              label="Credit Days"
              type="number"
              value={creditDays}
              onChange={(e) => setCreditDays(e.target.value)}
              inputProps={{ min: 1 }}
              fullWidth
              required
            />
          )}
        </Stack>
      </Box>

      {/* ACTIONS */}
      <Stack
        direction="row"
        spacing={1}
        justifyContent="flex-end"
        sx={{ pt: 2 }}
      >
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          type="submit"
          variant="contained"
          disabled={submitting}
        >
          {submitting ? "Creating..." : "Create Order"}
        </Button>
      </Stack>
    </Box>
  );
}
