const mongoose = require("mongoose");

const AlertSchema = new mongoose.Schema({
  name: { type: String, required: true },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Device",
    required: true,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  // Một cảnh báo có thể bao gồm nhiều điều kiện
  conditions: [
    {
      sensorField: { type: String, required: true },
      operator: {
        type: String,
        enum: [">", ">=", "<", "<=", "==", "!="],
        required: true,
      },
      value: { type: Number, required: true },
    },
  ],

  // Mối quan hệ giữa các điều kiện trong mảng: AND hoặc OR
  logic: {
    type: String,
    enum: ["OR"],
    default: "OR",
  },

  emailNotification: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Alert", AlertSchema);
