const RequestType = require('../models/RequestType');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Get all request types
 * @route   GET /api/request-types
 * @access  Authenticated (Admin + Vendor)
 */
const getRequestTypes = async (req, res, next) => {
  try {
    const types = await RequestType.find().sort({ name: 1 }).select('-__v');
    res.status(200).json({
      success: true,
      message: 'Request types fetched successfully',
      count: types.length,
      data: types,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new request type
 * @route   POST /api/request-types
 * @access  Authenticated (Admin + Vendor)
 */
const createRequestType = async (req, res, next) => {
  try {
    const { name } = req.body;

    const existing = await RequestType.findOne({ name: name.trim() });
    if (existing) {
      throw new ApiError('This request type already exists', 409);
    }

    const type = await RequestType.create({ name: name.trim() });

    res.status(201).json({
      success: true,
      message: 'Request type added successfully',
      data: type,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getRequestTypes, createRequestType };
