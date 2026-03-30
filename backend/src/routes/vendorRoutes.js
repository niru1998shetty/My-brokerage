const express = require('express');
const router = express.Router();
const { createVendor, getVendors, getVendorById } = require('../controllers/vendorController');
const { protect, authorize } = require('../middleware/auth');
const { createVendorValidator } = require('../middleware/validators');

// All vendor management routes are Admin-only
router.use(protect, authorize('ADMIN'));

router.route('/')
  .post(createVendorValidator, createVendor)
  .get(getVendors);

router.route('/:id')
  .get(getVendorById);

module.exports = router;
