const mongoose = require("mongoose");

const TelemetrySchema = new mongoose.Schema(
  {
    timestamp: { type: Date, required: true },
    data: { type: mongoose.Schema.Types.Mixed, required: true },
  },
  { _id: false }
);

const DeviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  topic: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
  telemetry: [TelemetrySchema],
});

module.exports = mongoose.model("Device", DeviceSchema);
