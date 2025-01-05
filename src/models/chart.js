const mongoose = require("mongoose");

const ChartSchema = new mongoose.Schema({
  name: { type: String, required: true },
  device: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Device",
    required: true,
  },
  field: { type: String, required: true },
  type: { type: String, enum: ["line", "bar"], required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

ChartSchema.index({ name: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Chart", ChartSchema);
