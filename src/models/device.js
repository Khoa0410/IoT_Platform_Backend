const mongoose = require("mongoose");

const DeviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  topic: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

DeviceSchema.index({ name: 1, user: 1 }, { unique: true });

module.exports = mongoose.model("Device", DeviceSchema);
