const express = require('express');
const router = express.Router();
const {
  createOrder,
  listOrders,
  getOrder,
  updateStatus,
  getOrderByCode,
  deleteOrder,
  listDeletedOrders
} = require('../controllers/ordersController');
const { requireAuth } = require('../middleware/authMiddleware');

// PUBLIC: customer tracking by order code
router.get('/by-code/:code', getOrderByCode);

// ADMIN ONLY below this line
router.use(requireAuth);

router.get("/deleted/all", requireAuth, listDeletedOrders);
router.post('/', createOrder);
router.get('/', listOrders);
router.get('/:id', getOrder);
router.patch('/:id/status', updateStatus);
router.delete("/:id", deleteOrder);

module.exports = router;
