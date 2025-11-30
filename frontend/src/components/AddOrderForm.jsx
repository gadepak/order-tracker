import React, { useState } from "react";
import { Box, TextField, Stack, Button } from "@mui/material";
import API from "../api";
//khif
export default function AddOrderForm({ onClose, onCreated }) {
  const [productName, setProductName] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [productDescription, setProductDescription] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!productName || !customerName||!customerEmail) return;

    try {
      setSubmitting(true);

      await API.post("/orders", {
        product_name: productName,
        customer_name: customerName,
        quantity: Number(quantity) || 1,
        product_description: productDescription,
        customer_email: customerEmail ,
        customer_phone: customerPhone ,
      });

      if (typeof onCreated === "function") {
        onCreated();
      }
      if (typeof onClose === "function") {
        onClose();
      }
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
      sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}
    >
      <TextField
        label="Product Name"
        value={productName}
        onChange={(e) => setProductName(e.target.value)}
        fullWidth
        required
      />

      <TextField
        label="Customer Name"
        value={customerName}
        onChange={(e) => setCustomerName(e.target.value)}
        fullWidth
        required
      />

      {/* NEW: Customer Email */}
      <TextField
        label="Customer Email"
        type="email"
        value={customerEmail}
        onChange={(e) => setCustomerEmail(e.target.value)}
        fullWidth
        placeholder="customer@example.com"
      />

      {/* NEW: Customer Phone (WhatsApp) */}
      <TextField
        label="Customer Phone (WhatsApp)"
        type="tel"
        value={customerPhone}
        onChange={(e) => setCustomerPhone(e.target.value)}
        fullWidth
        placeholder="+91XXXXXXXXXX"
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
        <TextField
          label="Quantity"
          type="number"
          inputProps={{ min: 1 }}
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          fullWidth
        />
      </Stack>

      <TextField
        label="Product Description"
        value={productDescription}
        onChange={(e) => setProductDescription(e.target.value)}
        fullWidth
        multiline
        minRows={3}
      />

      <Stack
        direction="row"
        spacing={1}
        justifyContent="flex-end"
        sx={{ mt: 1 }}
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
