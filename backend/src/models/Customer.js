const mongoose = require('mongoose');

const STATUSES = ['NEW', 'IN_PROGRESS', 'BOOKED', 'COMPLETED', 'CANCELLED'];

const customerSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
    },
    area: {
      type: String,
      trim: true,
    },
    typeOfRequest: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: STATUSES,
      default: 'NEW',
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Vendor ID is required'],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Customer', customerSchema);
