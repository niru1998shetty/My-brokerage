const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const ApiError = require('../utils/ApiError');

/**
 * @desc    Login user (mobile + password)
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { mobile, password } = req.body;

    // Find user by mobile and explicitly select password
    const user = await User.findOne({ mobile }).select('+password');

    if (!user) {
      throw new ApiError('Invalid mobile number or password', 401);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError('Invalid mobile number or password', 401);
    }

    // Determine role — override to ADMIN if credentials match admin
    const adminMobile = process.env.ADMIN_MOBILE;
    const adminEmail = process.env.ADMIN_EMAIL;

    if (user.mobile === adminMobile || user.email === adminEmail) {
      if (user.role !== 'ADMIN') {
        user.role = 'ADMIN';
        await user.save({ validateModifiedOnly: true });
      }
    }

    const token = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        _id: user._id,
        name: user.name,
        mobile: user.mobile,
        email: user.email,
        role: user.role,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { login };
