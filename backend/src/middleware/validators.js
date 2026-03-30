const { body, param, query } = require('express-validator');
const { validationResult } = require('express-validator');

/**
 * Middleware that checks express-validator results and returns errors if any.
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ─── Auth Validators ─────────────────────────────────────

const loginValidator = [
  body('mobile')
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(/^\d{10}$/)
    .withMessage('Mobile must be a 10-digit number'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  validate,
];

// ─── Vendor Validators ───────────────────────────────────

const createVendorValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('mobile')
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(/^\d{10}$/)
    .withMessage('Mobile must be a 10-digit number'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('email').optional().isEmail().withMessage('Invalid email format'),
  body('area').optional().trim(),
  body('state').optional().trim(),
  body('platformName').optional().trim(),
  validate,
];

// ─── Customer Validators ─────────────────────────────────

const createCustomerValidator = [
  body('customerName').trim().notEmpty().withMessage('Customer name is required'),
  body('mobile')
    .notEmpty()
    .withMessage('Mobile number is required')
    .matches(/^\d{10}$/)
    .withMessage('Mobile must be a 10-digit number'),
  body('area').optional().trim(),
  body('typeOfRequest').optional().trim(),
  validate,
];

const updateStatusValidator = [
  param('id').isMongoId().withMessage('Invalid customer ID'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(['NEW', 'IN_PROGRESS', 'BOOKED', 'COMPLETED', 'CANCELLED'])
    .withMessage(
      'Status must be one of: NEW, IN_PROGRESS, BOOKED, COMPLETED, CANCELLED'
    ),
  validate,
];

module.exports = {
  loginValidator,
  createVendorValidator,
  createCustomerValidator,
  updateStatusValidator,
};
