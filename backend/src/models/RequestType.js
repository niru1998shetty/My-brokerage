const mongoose = require('mongoose');

const requestTypeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Request type name is required'],
      unique: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('RequestType', requestTypeSchema);
