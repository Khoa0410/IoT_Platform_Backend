const mongoose = require("mongoose");

const TelemetrySchema = new mongoose.Schema(
  {
    deviceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Device",
      required: true,
      index: true,
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      // Format: { field: { value: number, unit: string } }
    },
  },
  {
    strict: false,
    versionKey: false,
  }
);

TelemetrySchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model("Telemetry", TelemetrySchema);
