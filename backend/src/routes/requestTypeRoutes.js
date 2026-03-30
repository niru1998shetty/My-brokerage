const express = require('express');
const router = express.Router();
const { getRequestTypes, createRequestType, deleteRequestType } = require('../controllers/requestTypeController');
const { protect, authorize } = require('../middleware/auth');
const { body } = require('express-validator');
const { validationResult } = require('express-validator');

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

const createValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Request type name is required')
    .matches(/^(Buy|Rent)\s*-\s*.+$/i)
    .withMessage('Format must be "Buy - <type>" or "Rent - <type>" (e.g. Buy - 2BHK, Rent - Studio)'),
  validate,
];

router.use(protect, authorize('ADMIN', 'VENDOR'));

router.route('/')
  .get(getRequestTypes)
  .post(createValidator, createRequestType);

router.route('/:id')
  .delete(deleteRequestType);

module.exports = router;
