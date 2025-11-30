import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";
import SearchBar from "../components/SearchBar";
import AddOrderForm from "../components/AddOrderForm";
//jbkj
// MUI importsnklklf
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

// ---------- Styled helpers ----------
const LayoutWrapper = styled("div")(({ theme }) => ({
  minHeight: "100vh",
  background: `linear-gradient(135deg, ${theme.palette.grey[100]}, #ffffff)`,
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(4),
  },
}));

const StatusChip = styled(Chip)(({ theme, status }) => {
  const map = {
    registered: { color: theme.palette.info.main, bg: theme.palette.info.light },
    processing: { color: theme.palette.warning.main, bg: theme.palette.warning.light },
    completing: { color: theme.palette.primary.main, bg: theme.palette.primary.light },
    completed: { color: theme.palette.success.main, bg: theme.palette.success.light },
    deleted: { color: theme.palette.error.main, bg: theme.palette.error.light },
  };

  const cfg = map[status] || {
    color: theme.palette.text.primary,
    bg: theme.palette.grey[200],
  };

  return {
    color: cfg.color,
    backgroundColor: cfg.bg,
    textTransform: "capitalize",
    fontWeight: 500,
  };
});

const DetailLabel = styled(Typography)(({ theme }) => ({
  fontSize: 12,
  fontWeight: 500,
  textTransform: "uppercase",
  letterSpacing: 0.5,
  color: theme.palette.text.secondary,
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

  const navigate = useNavigate();
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down("md"));

  // --------------------------------------------
  // FETCH ORDERS BASED ON ACTIVE TAB
  // --------------------------------------------
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);

      let url = "/orders/pending/all";
      if (activeTab === "completed") url = "/orders/completed/all";
      if (activeTab === "deleted") url = "/orders/deleted/all";

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

  // --------------------------------------------
  // SELECT / UPDATE / DELETE ORDER
  // --------------------------------------------
  const selectOrder = async (order) => {
    try {
      const res = await API.get(`/orders/${order.id}`);
      setSelected(res.data.order);
    } catch {
      alert("Failed to load order");
    }
  };

  const updateStatus = async (id, status) => {
    await API.patch(`/orders/${id}/status`, { status });
    loadOrders();
  };

  const openDeleteDialog = (order) => {
    setOrderToDelete(order);
    setDeleteDialogOpen(true);
  };

  const closeDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setOrderToDelete(null);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    await API.delete(`/orders/${orderToDelete.id}`);
    closeDeleteDialog();
    loadOrders();
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const formatDate = (value) => {
    if (!value) return "-";
    return new Date(value).toLocaleString();
  };

  const tabConfig = [
    { key: "pending", label: "Pending" },
    { key: "completed", label: "Completed" },
    { key: "deleted", label: "Deleted" },
  ];

  const currentTabLabel =
    activeTab === "pending"
      ? "Pending Orders"
      : activeTab === "completed"
      ? "Completed Orders"
      : "Deleted Orders";

  // --------------------------------------------
  // RENDER
  // --------------------------------------------
  return (
    <LayoutWrapper>
      {/* Top AppBar */}
      <AppBar
        position="static"
        elevation={0}
        color="transparent"
        sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          backdropFilter: "blur(10px)",
        }}
      >
        <Toolbar sx={{ px: { xs: 2, md: 4 } }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Admin Console
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Order Management Dashboard
            </Typography>
          </Box>

          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setShowAddOrder(true)}
              sx={{ textTransform: "none", borderRadius: 999 }}
            >
              New Order
            </Button>
            <Tooltip title="Logout">
              <IconButton color="error" onClick={logout}>
                <LogoutIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      <ContentWrapper>
        <Card elevation={0} sx={{ borderRadius: 3, boxShadow: "0 16px 40px rgba(15, 23, 42, 0.08)" }}>
          {/* Card Header */}
          <CardContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", md: "row" },
                justifyContent: "space-between",
                alignItems: { xs: "flex-start", md: "center" },
                gap: 2,
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 600 }}>
                  {currentTabLabel}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track status, update progress and manage order lifecycle.
                </Typography>
              </Box>

              <Stack direction="row" spacing={1} alignItems="center">
                <Tooltip title="Refresh">
                  <IconButton onClick={loadOrders}>
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                {activeTab !== "deleted" && (
                  <Box sx={{ minWidth: 260 }}>
                    {/* Your existing SearchBar component */}
                    <SearchBar onSelect={selectOrder} />
                  </Box>
                )}
              </Stack>
            </Box>

            {/* Tabs */}
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              textColor="primary"
              indicatorColor="primary"
              variant={isSmall ? "scrollable" : "standard"}
              sx={{
                borderRadius: 3,
                backgroundColor: theme.palette.grey[50],
                px: 1,
                py: 0.5,
                mb: 1,
              }}
            >
              {tabConfig.map((t) => (
                <Tab
                  key={t.key}
                  value={t.key}
                  label={
                    <Stack direction="row" spacing={1} alignItems="center">
                      <span>{t.label}</span>
                      {activeTab === t.key && (
                        <Chip
                          size="small"
                          label={orders.length}
                          sx={{ borderRadius: 999, height: 20, fontSize: 11 }}
                        />
                      )}
                    </Stack>
                  }
                  sx={{
                    textTransform: "none",
                    borderRadius: 999,
                    minHeight: 0,
                    py: 0.5,
                    px: { xs: 1, md: 2 },
                  }}
                />
              ))}
            </Tabs>
          </CardContent>

          <Divider />

          {/* Main content row */}
          <CardContent sx={{ pt: 3 }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", lg: "2.2fr 1.1fr" },
                gap: 3,
              }}
            >
              {/* LEFT: TABLE */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    px: 2,
                    pt: 2,
                    pb: 1,
                  }}
                >
                  <Typography variant="subtitle2" color="text.secondary">
                    {orders.length} order{orders.length !== 1 ? "s" : ""} in this view
                  </Typography>
                </Box>

                <Divider />

                {loading ? (
                  <Box sx={{ p: 2 }}>
                    {[1, 2, 3, 4].map((i) => (
                      <Box key={i} sx={{ display: "flex", gap: 2, mb: 2 }}>
                        <Skeleton variant="rounded" width="15%" height={32} />
                        <Skeleton variant="rounded" width="25%" height={32} />
                        <Skeleton variant="rounded" width="20%" height={32} />
                        <Skeleton variant="rounded" width="25%" height={32} />
                        <Skeleton variant="rounded" width="15%" height={32} />
                      </Box>
                    ))}
                  </Box>
                ) : orders.length === 0 ? (
                  <Box sx={{ p: 4, textAlign: "center" }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5 }}>
                      No orders to show
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {activeTab === "deleted"
                        ? "Orders you delete will appear in this list."
                        : "Create a new order or change the filter to see more."}
                    </Typography>
                  </Box>
                ) : (
                  <TableContainer sx={{ maxHeight: 520 }}>
                    <Table stickyHeader size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Order</TableCell>
                          <TableCell>Product</TableCell>
                          <TableCell>Customer</TableCell>
                          <TableCell>Registered</TableCell>
                          <TableCell>Updated</TableCell>
                          <TableCell>Status</TableCell>
                          {activeTab !== "deleted" && <TableCell align="right">Actions</TableCell>}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {orders.map((o) => {
                          const isSelected = selected?.id === o.id;
                          return (
                            <TableRow
                              key={o.id}
                              hover
                              selected={isSelected}
                              sx={{ cursor: "pointer" }}
                              onClick={() => selectOrder(o)}
                            >
                              <TableCell sx={{ fontWeight: 600 }}>{o.order_code}</TableCell>
                              <TableCell>{o.product_name}</TableCell>
                              <TableCell>{o.customer_name}</TableCell>
                              <TableCell>{formatDate(o.created_at)}</TableCell>
                              <TableCell>{formatDate(o.updated_at)}</TableCell>
                              <TableCell>
                                <StatusChip size="small" status={o.status} label={o.status} />
                              </TableCell>
                              {activeTab !== "deleted" && (
                                <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                                  <Tooltip title="Move to Deleted">
                                    <IconButton
                                      size="small"
                                      onClick={() => openDeleteDialog(o)}
                                    >
                                      <DeleteOutlineIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              )}
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>

              {/* RIGHT: DETAIL PANEL */}
              <Paper
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  p: 3,
                  minHeight: 260,
                }}
              >
                {!selected && !loading && (
                  <Box
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 0.5 }}>
                      No order selected
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click an order from the table to inspect details and update status.
                    </Typography>
                  </Box>
                )}

                {selected && (
                  <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          {selected.order_code}
                        </Typography>
                        <StatusChip
                          size="small"
                          status={selected.status}
                          label={selected.status}
                          sx={{ mt: 0.5 }}
                        />
                      </Box>
                    </Box>

                    <Box sx={{ mb: 2.5 }}>
                      <DetailLabel>Product</DetailLabel>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {selected.product_name}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <DetailLabel>Customer</DetailLabel>
                      <Typography variant="body2">{selected.customer_name}</Typography>
                    </Box>

                    <Stack direction="row" spacing={3} sx={{ mb: 2 }}>
                      <Box>
                        <DetailLabel>Registered</DetailLabel>
                        <Typography variant="body2">{formatDate(selected.created_at)}</Typography>
                      </Box>
                      <Box>
                        <DetailLabel>Last Updated</DetailLabel>
                        <Typography variant="body2">{formatDate(selected.updated_at)}</Typography>
                      </Box>
                    </Stack>

                    {activeTab !== "deleted" && (
                      <>
                        <Divider sx={{ my: 2 }} />
                        <DetailLabel>Update Status</DetailLabel>
                        <Stack
                          direction="row"
                          spacing={1}
                          flexWrap="wrap"
                          sx={{ mt: 1, mb: 2 }}
                        >
                          {["registered", "processing", "completing", "completed"].map((s) => (
                            <Button
                              key={s}
                              size="small"
                              variant={selected.status === s ? "contained" : "outlined"}
                              onClick={() => updateStatus(selected.id, s)}
                              sx={{ textTransform: "capitalize", borderRadius: 999 }}
                            >
                              {s}
                            </Button>
                          ))}
                        </Stack>

                        <Button
                          variant="outlined"
                          color="error"
                          startIcon={<DeleteOutlineIcon />}
                          onClick={() => openDeleteDialog(selected)}
                          sx={{ mt: "auto", alignSelf: "stretch", borderRadius: 999 }}
                        >
                          Move to Deleted
                        </Button>
                      </>
                    )}
                  </Box>
                )}
              </Paper>
            </Box>
          </CardContent>
        </Card>
      </ContentWrapper>

      {/* ADD ORDER DIALOG */}
      <Dialog
        open={showAddOrder}
        onClose={() => setShowAddOrder(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Order</DialogTitle>
        <DialogContent dividers>
          <AddOrderForm
            onClose={() => setShowAddOrder(false)}
            onCreated={loadOrders}
          />
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Move order to Deleted?</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2">
            Are you sure you want to move{" "}
            <strong>{orderToDelete?.order_code}</strong> to the Deleted list?
            You can still see it later in the “Deleted” tab.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDeleteDialog} variant="text">
            Cancel
          </Button>
          <Button
            onClick={confirmDelete}
            variant="contained"
            color="error"
            startIcon={<DeleteOutlineIcon />}
          >
            Move to Deleted
          </Button>
        </DialogActions>
      </Dialog>
    </LayoutWrapper>
  );
}
