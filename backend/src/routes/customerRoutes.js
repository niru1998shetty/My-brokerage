const express = require('express');
const router = express.Router();
const {
  addCustomer,
  getVendorCustomers,
  getAllCustomers,
  updateCustomerStatus,
} = require('../controllers/customerController');
const { protect, authorize } = require('../middleware/auth');
const {
  createCustomerValidator,
  updateStatusValidator,
} = require('../middleware/validators');

// All customer routes require authentication
router.use(protect);

// Admin: get ALL customers across vendors
router.get('/all', authorize('ADMIN'), getAllCustomers);

// Vendor: add customer
router.post('/', authorize('VENDOR'), createCustomerValidator, addCustomer);

// Vendor: get own customers
router.get('/', authorize('VENDOR'), getVendorCustomers);

// Vendor (limited) & Admin (full): update customer status
router.patch(
  '/:id/status',
  authorize('ADMIN', 'VENDOR'),
  updateStatusValidator,
  updateCustomerStatus
);

module.exports = router;
