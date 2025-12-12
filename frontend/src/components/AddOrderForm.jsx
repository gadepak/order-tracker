import React, { useState } from "react";
import { Box, TextField, Stack, Button, MenuItem } from "@mui/material";
import API from "../api";

export default function AddOrderForm({ onClose, onCreated }) {
  const [trayType, setTrayType] = useState("");
  const [serialNo, setSerialNo] = useState("");
  const [make, setMake] = useState("");
  const [dimensions, setDimensions] = useState("");
  const [nos, setNos] = useState("");
  const [size, setSize] = useState("");
  const [status, setStatus] = useState("CUTTING");

  // NEW PAYMENT FIELDS
  const [paymentStatus, setPaymentStatus] = useState("PAID");
  const [creditDays, setCreditDays] = useState("");

  // NEW CONTACT FIELDS
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState(""); // store as string (include country code)

  const [submitting, setSubmitting] = useState(false);

  const validatePhone = (p) => {
    // very simple validation: must be digits and length 10-15 (with country code)
    const cleaned = p.replace(/\D/g, "");
    return cleaned.length >= 10 && cleaned.length <= 15;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!trayType || !serialNo || !make) {
      alert("Tray Type, S.No, and Make are required");
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))  {
      alert("Please enter a valid email address");
      return;
    }

    if (phone && !validatePhone(phone)) {
      alert("Please enter a valid phone number (include country code)");
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

        // NEW PAYMENT FIELDS
        payment_status: paymentStatus,
        credit_days: paymentStatus === "NOT_PAID" ? Number(creditDays) : null,

        // CONTACT FIELDS
        email:email||null,
        phone:phone||null, // expected in E.164 or at least include country code
      });

      if (onCreated) onCreated();
      if (onClose) onClose();

    } catch (err) {
      console.error("Create order error:", err);
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
        gap: 2,
        mt: 1,
        width: 400,
      }}
    >
      <h4>Add New Order</h4>
      {/* CONTACT FIELDS */}
      <TextField
        label="Customer Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        fullWidth
        placeholder="customer@example.com"
      />

      <TextField
        label="Customer Phone (include country code)"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        fullWidth
        placeholder="+9198XXXXXXXX"
      />

      <TextField
        label="Tray Type"
        value={trayType}
        onChange={(e) => setTrayType(e.target.value)}
        fullWidth
        required
      />

      <TextField
        label="S.No"
        value={serialNo}
        onChange={(e) => setSerialNo(e.target.value)}
        fullWidth
        required
      />

      <TextField
        label="Make"
        value={make}
        onChange={(e) => setMake(e.target.value)}
        fullWidth
        required
      />

      <TextField
        label="Dimensions"
        value={dimensions}
        onChange={(e) => setDimensions(e.target.value)}
        fullWidth
        placeholder="e.g., 100 x 200 mm"
      />

      <TextField
        label="Nos"
        type="number"
        value={nos}
        onChange={(e) => setNos(e.target.value)}
        fullWidth
      />

      <TextField
        label="Size"
        value={size}
        onChange={(e) => setSize(e.target.value)}
        fullWidth
      />

      {/* STATUS DROPDOWN */}
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

      {/* PAYMENT STATUS DROPDOWN */}
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

      {/* CREDIT DAYS FIELD — ONLY SHOW IF NOT PAID */}
      {paymentStatus === "NOT_PAID" && (
        <TextField
          label="Credit Days"
          type="number"
          value={creditDays}
          onChange={(e) => setCreditDays(e.target.value)}
          inputProps={{ min: 1 }}
          required
          fullWidth
        />
      )}

      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 1 }}>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={submitting}>
          {submitting ? "Creating..." : "Create Order"}
        </Button>
      </Stack>
    </Box>
  );
}
