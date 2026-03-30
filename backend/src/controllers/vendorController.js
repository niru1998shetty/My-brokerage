const User = require('../models/User');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Create a new vendor
 * @route   POST /api/vendors
 * @access  Admin
 */
const createVendor = async (req, res, next) => {
  try {
    const { name, mobile, email, password, area, state, platformName } = req.body;

    const existing = await User.findOne({ mobile });
    if (existing) {
      throw new ApiError('A user with this mobile number already exists', 409);
    }

    const vendor = await User.create({
      name,
      mobile,
      email,
      password,
      role: 'VENDOR',
      area,
      state,
      platformName,
    });

    res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      data: {
        _id: vendor._id,
        name: vendor.name,
        mobile: vendor.mobile,
        email: vendor.email,
        role: vendor.role,
        area: vendor.area,
        state: vendor.state,
        platformName: vendor.platformName,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all vendors
 * @route   GET /api/vendors
 * @access  Admin
 */
const getVendors = async (req, res, next) => {
  try {
    const vendors = await User.find({ role: 'VENDOR' }).select('-__v');

    res.status(200).json({
      success: true,
      message: 'Vendors fetched successfully',
      count: vendors.length,
      data: vendors,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single vendor by ID
 * @route   GET /api/vendors/:id
 * @access  Admin
 */
const getVendorById = async (req, res, next) => {
  try {
    const vendor = await User.findById(req.params.id).select('-__v');

    if (!vendor || vendor.role !== 'VENDOR') {
      throw new ApiError('Vendor not found', 404);
    }

    res.status(200).json({
      success: true,
      message: 'Vendor fetched successfully',
      data: vendor,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createVendor, getVendors, getVendorById };
