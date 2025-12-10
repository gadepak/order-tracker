const express = require("express");
const router = express.Router();

const {
  createOrder,
  listPending,
  listCompleted,
  listDeleted,
  listPendingPayment, 
  getOrder,
  updateStatus,
  deleteOrder,
  getOrderByCode,
  updatePayment   // ← NEW
} = require("../controllers/ordersController");

const { requireAuth } = require("../middleware/authMiddleware");


// PUBLIC: Track Order
router.get("/by-code/:code", getOrderByCode);

// ADMIN ROUTES
router.get("/pending/all", requireAuth, listPending);
router.get("/completed/all", requireAuth, listCompleted);
router.get("/deleted/all", requireAuth, listDeleted);

router.get("/pending-payment/all", requireAuth, listPendingPayment); 

router.post("/", requireAuth, createOrder);

router.patch("/:id/status", requireAuth, updateStatus);

// NEW — UPDATE PAYMENT STATUS
router.patch("/:id/payment", requireAuth, updatePayment);

router.delete("/:id", requireAuth, deleteOrder);

// KEEP LAST
router.get("/:id", requireAuth, getOrder);

module.exports = router;
