import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import AddOrderForm from "../components/AddOrderForm";
import { Snackbar, Alert } from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Tabs,
  Tab,
  Card,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from "@mui/material";

import { styled } from "@mui/material/styles";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RefreshIcon from "@mui/icons-material/Refresh";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";

/* ---------------- CONSTANTS ---------------- */
const NAVBAR_HEIGHT = {
  xs: 96,  // mobile
  sm: 76,  // tablet & up
};


/* ---------------- THEME TOKENS ---------------- */
const brand = {
  primary: "#088389",
  light: {
    bg: "#F7F8F5",
    surface: "#FFFFFF",
    surfaceAlt: "#F9FAFB",
    text: "#0F172A",
    textMuted: "#6B7280",
    border: "#E1E4DA",
  },
  dark: {
    bg: "#020617",
    surface: "#020617",
    surfaceAlt: "#020617",
    text: "#E5E7EB",
    textMuted: "#94A3B8",
    border: "#1E293B",
  },
};

/* ---------------- STYLED ---------------- */
const Page = styled(Box)(() => ({
  minHeight: "100vh",
}));

const SectionCard = styled(Card)(() => ({
  borderRadius: 16,
  overflow: "hidden",
}));

/* ---------------- HELPERS ---------------- */
const statusBarColor = (status) => {
  switch (status) {
    case "CUTTING":
      return "#F59E0B";
    case "PERFORATED":
      return "#06B6D4";
    case "BENDING":
      return "#2563EB";
    case "COMPLETED":
      return "#16A34A";
    case "DELETED":
      return "#DC2626";
    default:
      return "#9CA3AF";
  }
};
const remainingCreditDays = (lastDate, creditDays) => {
  if (!lastDate || !creditDays) return null;
  const last = new Date(lastDate);
  const expiry = new Date(last);
  expiry.setDate(expiry.getDate() + creditDays);
  return Math.ceil((expiry - new Date()) / (1000 * 60 * 60 * 24));
};
const tabLabel = (tab) => {
  if (tab === "pending") return "Pending Orders";
  if (tab === "completed") return "Completed Orders";
  if (tab === "Payment") return "Pending Payments";
  if (tab === "deleted") return "Deleted Orders";
  return "";
};


/* ---------------- COMPONENT ---------------- */
export default function AdminDashboard() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [activeTab, setActiveTab] = useState("pending");
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });

  const colors = darkMode ? brand.dark : brand.light;
  const theme = createTheme({
  palette: {
    mode: darkMode ? "dark" : "light",

    primary: {
      main: brand.primary,
    },

    background: {
      default: colors.bg,
      paper: colors.surface,
    },

    text: {
      primary: colors.text,
      secondary: colors.textMuted,
    },

    divider: colors.border,
  },

  components: {
    MuiTypography: {
      styleOverrides: {
        root: {
          color: colors.text,
        },
      },
    },

    MuiTableCell: {
      styleOverrides: {
        root: {
          color: colors.text,
          borderBottom: `1px solid ${colors.border}`,
        },
      },
    },

    MuiTab: {
      styleOverrides: {
        root: {
          color: colors.textMuted,
          "&.Mui-selected": {
            color: brand.primary,
          },
        },
      },
    },
  },
});


  /* ---------------- API ---------------- */
  const loadOrders = useCallback(async () => {
    try {
      let url = "/orders/pending/all";
      if (activeTab === "completed") url = "/orders/completed/all";
      if (activeTab === "deleted") url = "/orders/deleted/all";
      if (activeTab === "Payment") url = "/orders/pending-payment/all";

      const res = await API.get(url);
      setOrders(res.data.orders || []);
      setSelected(null);
    } catch (err) {
      if (err.response?.status === 401) navigate("/admin/login");
    }
  }, [activeTab, navigate]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const selectOrder = async (o) => {
    const res = await API.get(`/orders/${o.id}`);
    setSelected(res.data.order);
  };

  const updateStatus = async (id, status) => {
    await API.patch(`/orders/${id}/status`, { status });
    loadOrders();
    const res = await API.get(`/orders/${id}`);
    setSelected(res.data.order);
  };

  const updatePayment = async (id, payment_status) => {
    await API.patch(`/orders/${id}/payment`, { payment_status });
    loadOrders();
    const res = await API.get(`/orders/${id}`);
    setSelected(res.data.order);
  };

  const confirmDelete = async () => {
    await API.delete(`/orders/${orderToDelete.id}`);
    setDeleteDialogOpen(false);
    loadOrders();
    setSelected(null);
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const statusOptions = ["CUTTING", "PERFORATED", "BENDING", "COMPLETED"];
  const creditDaysLeft =
  selected &&
  remainingCreditDays(
    selected.created_at,
    selected.credit_days
  );

  /* ---------------- RENDER ---------------- */
  return (
     <ThemeProvider theme={theme}>
    <CssBaseline />
    <Page sx={{ background: colors.bg, pt: `${NAVBAR_HEIGHT}px` }}>
      {/* ================= NAVBAR ================= */}
      <AppBar
        elevation={0}
        sx={{
          height: NAVBAR_HEIGHT,
          justifyContent: "center",
          background: brand.primary,
          color: "#fff",
          borderBottom: `1px solid ${colors.border}`,
        }}
      >
        <Toolbar
  sx={{
    display: "flex",
    flexDirection: { xs: "column", sm: "row" },
    alignItems: { xs: "flex-start", sm: "center" },
    gap: { xs: 1, sm: 0 },
    py: { xs: 1.2, sm: 0 },
  }}
>

          {/* LEFT */}
          <Box>
  <Typography
    fontWeight={800}
    letterSpacing={4}
    sx={{ color: "#fff", fontSize: { xs: 16, sm: 18 } }}
  >
    PROHITEN
  </Typography>

  {/* Hide subtitle on phones */}
  <Typography
    variant="caption"
    sx={{
      color: "rgba(255,255,255,0.8)",
      display: { xs: "none", sm: "block" },
    }}
  >
    Admin Console
  </Typography>
</Box>


          {/* CENTER */}
          <Box
  flexGrow={1}
  textAlign="center"
  sx={{ display: { xs: "none", sm: "block" } }}
>
  <Typography sx={{ color: "#fff", fontWeight: 600 }}>
    {tabLabel(activeTab)}
  </Typography>
  <Typography
    variant="caption"
    sx={{ color: "rgba(255,255,255,0.8)" }}
  >
    {orders.length} orders
  </Typography>
</Box>


          {/* RIGHT */}
          <Stack
  direction="row"
  spacing={1}
  alignItems="center"
  sx={{
    width: { xs: "100%", sm: "auto" },
    justifyContent: { xs: "space-between", sm: "flex-end" },
  }}
>
  <Tooltip title={darkMode ? "Light Mode" : "Dark Mode"}>
    <IconButton onClick={() => setDarkMode(!darkMode)} sx={{ color: "#fff" }}>
      {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
    </IconButton>
  </Tooltip>

  {/* Hide text, keep icon on mobile */}
  <Button
    size="small"
    startIcon={<AddIcon />}
    variant="contained"
    sx={{
      background: brand.primary,
      minWidth: { xs: 40, sm: "auto" },
      px: { xs: 1, sm: 2 },
    }}
    onClick={() => setShowAddOrder(true)}
  >
    <Box sx={{ display: { xs: "none", sm: "block" } }}>
      New Order
    </Box>
  </Button>

  <IconButton onClick={logout} sx={{ color: "#fff" }}>
    <LogoutIcon />
  </IconButton>
</Stack>

        </Toolbar>
      </AppBar>
      {/* CONTENT */}
      <Box p={4}>
        {/* HEADER */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={3}>
          <Typography variant="h4" fontWeight={700} sx={{ color: darkMode ? "#fff" : colors.text }}>
            Orders Dashboard
          </Typography>

          <Box flexGrow={1} />

          <Stack direction="row" spacing={1}>
            <IconButton onClick={loadOrders} sx={{ color: darkMode ? "#fff" : colors.text }}
>
              <RefreshIcon />
            </IconButton>

            <Button
              startIcon={<AddIcon />}
              variant="contained"
              sx={{ background: brand.primary }}
              onClick={() => setShowAddOrder(true)}
            >
              New Order
            </Button>
          </Stack>
        </Stack>

        {/* TABS */}
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          sx={{
            mb: 3,
            "& .MuiTab-root": { color: colors.textMuted },
            "& .Mui-selected": { color: brand.primary },
          }}
        >
          <Tab value="pending" label="Pending" />
          <Tab value="completed" label="Completed" />
          <Tab value="Payment" label="Pending Payment" />
          <Tab value="deleted" label="Deleted" />
        </Tabs>

        {/* MAIN GRID */}
        <Box display="grid" gridTemplateColumns={{ xs: "1fr", lg: "3fr 1.3fr" }} gap={3}>
          {/* TABLE */}
          <SectionCard
            sx={{
              background: colors.surface,
              border: `1px solid ${colors.border}`,
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    {["Order", "Tray", "Make", "Status", "Actions"].map((h) => (
                      <TableCell key={h} sx={{ color: colors.textMuted }}>
                        {h}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>

                <TableBody component={motion.tbody} layout>
                  <AnimatePresence>
                    {orders.map((o) => (
                      <TableRow
                        component={motion.tr}
                        key={o.id}
                        hover
                        onClick={() => selectOrder(o)}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <TableCell
  sx={{
    position: "relative",
    pl: 2.5, // space for the strip
  }}
>
  <Box
    sx={{
      position: "absolute",
      left: 0,
      top: 0,
      bottom: 0,
      width: 4,
      backgroundColor: statusBarColor(o.status),
      borderRadius: "2px 0 0 2px",
    }}
  />
  {o.order_code}
</TableCell>

                        <TableCell>{o.tray_type}</TableCell>
                        <TableCell>{o.make}</TableCell>
                        <TableCell>
    <Chip
      label={o.status}
      size="small"
      sx={{
        backgroundColor: statusBarColor(o.status),
        color: "#fff",
        fontWeight: 600,
      }}
    />
  </TableCell>

                        <TableCell
                          align="right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {activeTab !== "deleted" && (
                            <IconButton
                              color="error"
                              onClick={() => {
                                setOrderToDelete(o);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </TableContainer>
          </SectionCard>

          {/* DETAILS */}
          <SectionCard
            component={motion.div}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            sx={{
              p: 3,
              background: colors.surface,
              border: `1px solid ${colors.border}`,
              position: "sticky",
              top: NAVBAR_HEIGHT + 24,
            }}
          >
            {!selected ? (
              <Typography sx={{ color: colors.textMuted }}>
                Select an order to view details
              </Typography>
            ) : (
              <>
                <Typography variant="h6" fontWeight={700} sx={{ color: darkMode ? "#fff" : colors.text }}>
                  {selected.order_code}
                </Typography>

                <Divider sx={{ my: 2, borderColor: colors.border }} />

                <Typography variant="caption" sx={{ color: colors.textMuted }}>
                  Payment Status
                </Typography>
                <Typography sx={{ color: colors.text, mb: 2 }}>
                  {selected.payment_status}
                </Typography>

                {selected.payment_status !== "PAID" && (
                  <Stack direction="row" spacing={1} mb={2}>
                    <Button
                      size="small"
                      variant="contained"
                      onClick={() => updatePayment(selected.id, "PAID")}
                    >
                      Mark Paid
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      sx={{ color: colors.text, borderColor: colors.border }}
                      onClick={() => updatePayment(selected.id, "NOT_PAID")}
                    >
                      Not Paid
                    </Button>
                  </Stack>
                )}

                <Divider sx={{ my: 2, borderColor: colors.border }} />
                {activeTab === "Payment" && (
  <>
  {console.log("SELECTED ORDER:", selected)}
    <Typography variant="caption" sx={{ color: colors.textMuted }}>
      Credit Details
    </Typography>
                {console.log("SELECTED ORDER:", selected)}

    <Typography sx={{ color: colors.text, mt: 0.5 }}>
      Last Credit Date:&nbsp;
      <span style={{ color: brand.primary, fontWeight: 600 }}>
        {new Date(
  selected.last_credit_date || selected.created_at
).toLocaleDateString()}


      </span>
    </Typography>

    <Typography
      sx={{
        mt: 0.5,
        fontWeight: 700,
        color:
          remainingCreditDays(
            selected.last_credit_date,
            selected.credit_days
          ) <= 5
            ? "#DC2626"
            : "#16A34A",
      }}
    >
      Remaining Days:&nbsp;
      {remainingCreditDays(
  selected.last_credit_date || selected.created_at,
  selected.credit_days
)
}
    </Typography>

    <Divider sx={{ my: 2, borderColor: colors.border }} />
    {creditDaysLeft !== null && creditDaysLeft <= 0 && (
  <Button
    fullWidth
    size="small"
    variant="contained"
    sx={{
      mt: 2,
      backgroundColor: "#DC2626",
      fontWeight: 600,
      textTransform: "none",
      "&:hover": {
        backgroundColor: "#B91C1C",
      },
    }}
    onClick={async () => {
      try {
        await API.post(`/orders/${selected.id}/remind`);

        setSnack({
          open: true,
          severity: "success",
          message: "Payment reminder sent (Email & WhatsApp)",
        });
      } catch (err) {
        setSnack({
          open: true,
          severity: "error",
          message:
            err.response?.data?.error ||
            "Failed to send reminder",
        });
      }
    }}
  >
    Send Notification
  </Button>
)}


  </>
)}

                <Typography variant="caption" sx={{ color: colors.textMuted }}>
                  Update Status
                </Typography>

                <Stack
  direction="row"
  spacing={1.2}
  mt={1.5}
  flexWrap="wrap"
  useFlexGap
>
  {statusOptions.map((s) => (
    <Button
      key={s}
      size="small"
      variant={selected.status === s ? "contained" : "outlined"}
      onClick={() => updateStatus(selected.id, s)}
      sx={{
        minWidth: 110,
        height: 36,
        fontWeight: 600,
        textTransform: "none",
        borderRadius: 1.5,
        color: selected.status === s ? "#fff" : colors.text,
        borderColor: colors.border,
        backgroundColor:
          selected.status === s ? brand.primary : "transparent",
        "&:hover": {
          backgroundColor:
            selected.status === s
              ? brand.primary
              : colors.surfaceAlt,
        },
      }}
    >
      {s}
    </Button>
  ))}
</Stack>

              </>
            )}
          </SectionCard>
        </Box>
      </Box>

      {/* ADD ORDER */}
      <Dialog
        open={showAddOrder}
        onClose={() => setShowAddOrder(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: { background: colors.surface, color: colors.text } }}
      >
        <DialogTitle>Create New Order</DialogTitle>
        <DialogContent dividers>
          <AddOrderForm onClose={() => setShowAddOrder(false)} onCreated={loadOrders} />
        </DialogContent>
      </Dialog>

      {/* DELETE */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { background: colors.surface, color: colors.text } }}
      >
        <DialogTitle>Delete Order?</DialogTitle>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert severity={snack.severity} variant="filled">
          {snack.message}
        </Alert>
      </Snackbar>
    </Page>
    </ThemeProvider>
  );
}
