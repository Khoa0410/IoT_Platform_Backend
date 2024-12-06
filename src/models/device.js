const mongoose = require('mongoose');

const TelemetrySchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
}, { _id: false });

const DeviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  telemetry: [TelemetrySchema]
});

module.exports = mongoose.model('Device', DeviceSchema);
