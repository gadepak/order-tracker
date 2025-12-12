import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import SearchBar from "../components/SearchBar";
import AddOrderForm from "../components/AddOrderForm";
import { Snackbar, Alert } from "@mui/material";

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
  CardContent,
  Chip,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Tooltip,
  useMediaQuery,
} from "@mui/material";

import { styled, useTheme } from "@mui/material/styles";
import LogoutIcon from "@mui/icons-material/Logout";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import RefreshIcon from "@mui/icons-material/Refresh";

// ---------- Brand / Design Tokens ----------
const brandColors = {
  primary: "#088389",
  primarySoft: "#D7F2EE",
  navbar: "#F4F4F0",
  background: "#F7F8F5",
  surface: "#FFFFFF",
  border: "#E1E4DA",
  textMain: "#111827",
  textSecondary: "#6B7280",
};

// ---------- Styled helpers ----------
const LayoutWrapper = styled("div")(() => ({
  minHeight: "100vh",
  backgroundColor: brandColors.background,
  color: brandColors.textMain,
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(4),
  },
}));

const StatusChip = styled(Chip)(({ status }) => {
  const s = (status || "").toLowerCase();
  const map = {
    cutting: { color: "#92400E", bg: "#FEF3C7" },
    perforated: { color: "#0f172a", bg: "#E6F7F5" },
    bending: { color: "#1d4ed8", bg: "#DBEAFE" },
    completed: { color: "#166534", bg: "#DCFCE7" },
    deleted: { color: "#B91C1C", bg: "#FEE2E2" },
  };
  const cfg = map[s] || { color: brandColors.textMain, bg: "#E5E7EB" };
  return {
    color: cfg.color,
    backgroundColor: cfg.bg,
    textTransform: "uppercase",
    fontWeight: 600,
    borderRadius: 999,
    letterSpacing: 0.3,
    fontSize: 12,
    padding: "6px 10px",
  };
});

const DetailLabel = styled(Typography)(() => ({
  fontSize: 11,
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: 0.7,
  color: brandColors.textSecondary,
}));

// ------------------------------------

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [snack, setSnack] = useState({ open: false, message: "", severity: "success" });
  const showMessage = (msg, severity = "success") => {
  setSnack({ open: true, message: msg, severity });
};

  const navigate = useNavigate();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));

  // ---------- Load Orders ----------
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      let url = "/orders/pending/all";
      if (activeTab === "completed") url = "/orders/completed/all";
      if (activeTab === "deleted") url = "/orders/deleted/all";
      if (activeTab === "Payment") url = "/orders/pending-payment/all";

      const res = await API.get(url);
      setOrders(res.data.orders || []);
      setSelected(null);
    } catch (err) {
      if (err.response?.status === 401) navigate("/admin/login");
    } finally {
      setLoading(false);
    }
  }, [activeTab, navigate]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // ---------- Select Order ----------
  const selectOrder = async (order) => {
    try {
      const res = await API.get(`/orders/${order.id}`);
      setSelected(res.data.order);
    } catch {
      alert("Failed to load order");
    }
  };

  // ---------- Update Status ----------
  const updateStatus = async (id, status) => {
    await API.patch(`/orders/${id}/status`, { status });
    await loadOrders();
    const { data } = await API.get(`/orders/${id}`);
    setSelected(data.order);
  };

  // ---------- Update Payment ----------
  const updatePayment = async (id, payment_status) => {
    await API.patch(`/orders/${id}/payment`, { payment_status });
    await loadOrders();
    const { data } = await API.get(`/orders/${id}`);
    setSelected(data.order);
  };

  // ---------- Delete ----------
  const openDeleteDialog = (order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
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

  const formatDate = (val) => (val ? new Date(val).toLocaleString() : "-");
    const isOverdue = (o) => {
    if (!o) return false;
    if ((o.payment_status || "").toUpperCase() !== "NOT_PAID") return false;
    const days = Number(o.credit_days || 0);
    if (!days || days <= 0) return false;
    const created = new Date(o.created_at);
    const due = new Date(created.getTime() + days * 24 * 60 * 60 * 1000);
    return new Date() > due;
  };

  const statusOptions = ["CUTTING", "PERFORATED", "BENDING", "COMPLETED"];

  // --------------------------------------------
  // RENDER
  // --------------------------------------------
  return (
    <LayoutWrapper>
      {/* NAVBAR */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: brandColors.navbar,
          borderBottom: `1px solid ${brandColors.border}`,
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          <Typography variant="caption" color={brandColors.textSecondary}>
            ADMIN CONSOLE
          </Typography>

          <Typography
            variant="h6"
            sx={{
              textTransform: "uppercase",
              fontWeight: 700,
              letterSpacing: 6,
              margin: "0 auto",
            }}
          >
            prohiten
          </Typography>

          <IconButton onClick={logout}>
            <LogoutIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* CONTENT */}
      <ContentWrapper>
        <Card
          elevation={0}
          sx={{
            borderRadius: 3,
            backgroundColor: brandColors.surface,
            border: `1px solid ${brandColors.border}`,
          }}
        >
          <CardContent>
            {/* HEADER */}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                mb: 2,
                flexWrap: "wrap",
                gap: 2,
              }}
            >
              <Typography variant="h5">
                {activeTab === "pending"
                  ? "Pending Orders"
                  : activeTab === "completed"
                  ? "Completed Orders"
                  : "Deleted Orders"}
              </Typography>

              <Stack direction="row" spacing={1}>
                <Tooltip title="Refresh">
                  <IconButton onClick={loadOrders}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={() => setShowAddOrder(true)}
                >
                  New Order
                </Button>
              </Stack>
            </Box>

            {/* TABS */}
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
              <Tab label="Pending" value="pending" />
              <Tab label="Completed" value="completed" />
              <Tab label="Deleted" value="deleted" />
              <Tab label="Pending Payment" value="Payment" />
            </Tabs>
          </CardContent>

          <Divider />

          {/* MAIN GRID */}
          <CardContent>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "2fr 1fr" },
                gap: 3,
              }}
            >
              {/* LEFT TABLE */}
              <Paper sx={{ borderRadius: 3, border: `1px solid ${brandColors.border}` }}>
                <TableContainer sx={{ maxHeight: 520 }}>
                  <Table stickyHeader size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Order</TableCell>
                        <TableCell>Tray</TableCell>
                        <TableCell>S.No</TableCell>
                        <TableCell>Make</TableCell>
                        <TableCell>Payment</TableCell>
                        <TableCell>Credit Days</TableCell>
                        <TableCell>Registered</TableCell>
                        <TableCell>Status</TableCell>
                        {activeTab !== "deleted" && <TableCell>Actions</TableCell>}
                      </TableRow>
                    </TableHead>

                    <TableBody>
  {orders.map((o) => (
    <TableRow
      key={o.id}
      hover
      onClick={() => selectOrder(o)}
      style={{ cursor: "pointer" }}
    >
      <TableCell>{o.order_code}</TableCell>
      <TableCell>{o.tray_type}</TableCell>
      <TableCell>{o.serial_no}</TableCell>
      <TableCell>{o.make}</TableCell>
      <TableCell>{o.payment_status}</TableCell>
      <TableCell>{o.credit_days ?? "-"}</TableCell>
      <TableCell>{formatDate(o.created_at)}</TableCell>
      <TableCell>
        <StatusChip label={o.status} status={o.status} />
      </TableCell>

            {/* ACTIONS */}
      {activeTab !== "deleted" && (
        <TableCell onClick={(e) => e.stopPropagation()}>
          <Stack direction="row" spacing={1} alignItems="center">
            {/* Delete for non-deleted tabs */}
            <Tooltip title="Move to Deleted">
              <IconButton
                size="small"
                color="error"
                onClick={() => openDeleteDialog(o)}
              >
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Pending Payment tab: show reminder button only when overdue */}
            {activeTab === "Payment" && (
              <>
                {isOverdue(o) ? (
                  <Button
                    size="small"
                    variant="contained"
                    onClick={async () => {
                      try {
                        // disable double-click by simple inline guard:
                        // change button to disabled via element reference would be nicer,
                        // but keeping it simple here
                        const res = await API.post(`/orders/${o.id}/remind`);
                        if (res.data?.success) {
                          showMessage("Reminder sent successfully!", "success");
                          loadOrders();
                        } else {
                        showMessage(`Failed: ${res.data?.error || "Unknown error"}`, "error");
                        }
                      } catch (err) {
                        console.error("Send reminder error", err);
                        showMessage("Failed to send reminder", "error");
                      }
                    }}
                  >
                    Send Reminder
                  </Button>
                ) : (
                  <Typography variant="caption">Not due</Typography>
                )}
              </>
            )}
          </Stack>
        </TableCell>
      )}

    </TableRow>
  ))}
</TableBody>

                  </Table>
                </TableContainer>
              </Paper>

              {/* RIGHT DETAIL PANEL */}
              <Paper
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${brandColors.border}`,
                  p: 3,
                }}
              >
                {!selected ? (
                  <Typography>Select an order to view details</Typography>
                ) : (
                  <>
                    <Typography variant="h6">{selected.order_code}</Typography>

                    {/* PAYMENT SECTION */}
                    <Divider sx={{ my: 2 }} />

                    <DetailLabel>Payment Status</DetailLabel>
                    <Typography sx={{ mb: 1 }}>
                      {selected.payment_status}
                    </Typography>

                    {selected.payment_status === "NOT_PAID" && (
                      <>
                        <DetailLabel>Credit Days Remaining</DetailLabel>
                        <Typography sx={{ mb: 2 }}>
                          {selected.credit_days}
                        </Typography>
                      </>
                    )}

                    {/* only show payment action buttons when payment_status is not PAID */}
{selected && (selected.payment_status || "").toUpperCase() !== "PAID" && (
  <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
    <Button
      variant="contained"
      onClick={() => updatePayment(selected.id, "PAID")}
    >
      Mark as PAID
    </Button>

    <Button
      variant="outlined"
      onClick={() => updatePayment(selected.id, "NOT_PAID")}
    >
      Mark as NOT PAID
    </Button>
  </Stack>
)}
                    {/* STATUS UPDATE */}
                    <Divider sx={{ my: 2 }} />
                    <DetailLabel>Update Status</DetailLabel>

                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      {statusOptions.map((s) => (
                        <Button
                          key={s}
                          size="small"
                          variant={selected.status === s ? "contained" : "outlined"}
                          onClick={() => updateStatus(selected.id, s)}
                        >
                          {s}
                        </Button>
                      ))}
                    </Stack>
                  </>
                )}
              </Paper>
            </Box>
          </CardContent>
        </Card>
      </ContentWrapper>

      {/* ADD ORDER DIALOG */}
      <Dialog open={showAddOrder} onClose={() => setShowAddOrder(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Order</DialogTitle>
        <DialogContent dividers>
          <AddOrderForm onClose={() => setShowAddOrder(false)} onCreated={loadOrders} />
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
<Dialog
  open={deleteDialogOpen}
  onClose={() => setDeleteDialogOpen(false)}
  maxWidth="xs"
  fullWidth
>
  <DialogTitle>Move to Deleted?</DialogTitle>

  <DialogContent dividers>
    This order will appear in the <strong>Deleted</strong> tab.  
    You can restore it later manually from database if needed.
  </DialogContent>

  <DialogActions>
    <Button onClick={() => setDeleteDialogOpen(false)}>
      Cancel
    </Button>

    <Button
      color="error"
      variant="contained"
      onClick={confirmDelete}
    >
      Delete
    </Button>
  </DialogActions>
</Dialog>
<Snackbar
  open={snack.open}
  autoHideDuration={3000}
  onClose={() => setSnack({ ...snack, open: false })}
  anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
>
  <Alert
    onClose={() => setSnack({ ...snack, open: false })}
    severity={snack.severity}
    variant="filled"
    sx={{ width: "100%" }}
  >
    {snack.message}
  </Alert>
</Snackbar>

    </LayoutWrapper>
  );
}
