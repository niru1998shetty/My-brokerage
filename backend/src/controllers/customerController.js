const Customer = require('../models/Customer');
const ApiError = require('../utils/ApiError');

// Statuses that only ADMIN can set
const ADMIN_ONLY_STATUSES = ['COMPLETED', 'CANCELLED'];

/**
 * @desc    Add a new customer (vendor action)
 * @route   POST /api/customers
 * @access  Vendor
 */
const addCustomer = async (req, res, next) => {
  try {
    const { customerName, mobile, area, typeOfRequest } = req.body;

    const customer = await Customer.create({
      customerName,
      mobile,
      area,
      typeOfRequest,
      vendorId: req.user._id,
      status: 'NEW',
    });

    res.status(201).json({
      success: true,
      message: 'Customer created successfully',
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get logged-in vendor's customers (with pagination & filters)
 * @route   GET /api/customers
 * @access  Vendor
 */
const getVendorCustomers = async (req, res, next) => {
  try {
    const { status, area, search, page = 1, limit = 10 } = req.query;

    const filter = { vendorId: req.user._id };

    if (status) filter.status = status;
    if (area) filter.area = { $regex: area, $options: 'i' };
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-__v'),
      Customer.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: 'Customers fetched successfully',
      count: customers.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get ALL customers across vendors (with pagination & filters)
 * @route   GET /api/customers/all
 * @access  Admin
 */
const getAllCustomers = async (req, res, next) => {
  try {
    const { status, area, vendorId, search, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (area) filter.area = { $regex: area, $options: 'i' };
    if (vendorId) filter.vendorId = vendorId;
    if (search) {
      filter.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10)));
    const skip = (pageNum - 1) * limitNum;

    const [customers, total] = await Promise.all([
      Customer.find(filter)
        .populate('vendorId', 'name mobile platformName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-__v'),
      Customer.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      message: 'All customers fetched successfully',
      count: customers.length,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
      data: customers,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update customer status
 * @route   PATCH /api/customers/:id/status
 * @access  Vendor (limited) / Admin (full)
 */
const updateCustomerStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      throw new ApiError('Customer not found', 404);
    }

    const isAdmin = req.user.role === 'ADMIN';
    const isOwner = customer.vendorId.toString() === req.user._id.toString();

    // Vendors can only update their own customers
    if (!isAdmin && !isOwner) {
      throw new ApiError('Not authorized to update this customer', 403);
    }

    // Vendors cannot set COMPLETED or CANCELLED
    if (!isAdmin && ADMIN_ONLY_STATUSES.includes(status)) {
      throw new ApiError(
        `Vendors cannot set status to ${status}. Only Admin can.`,
        403
      );
    }

    customer.status = status;
    await customer.save();

    res.status(200).json({
      success: true,
      message: `Customer status updated to ${status}`,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addCustomer,
  getVendorCustomers,
  getAllCustomers,
  updateCustomerStatus,
};
