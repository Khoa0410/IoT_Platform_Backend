require("dotenv").config();

const mongoose = require("mongoose");
const Device = require("../models/device");
const Telemetry = require("../models/telemetry");

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const devices = await Device.find({ "telemetry.0": { $exists: true } });

    for (const device of devices) {
      const telemetryData = device._doc.telemetry || [];

      if (!Array.isArray(telemetryData) || telemetryData.length === 0) continue;

      const records = telemetryData.map((entry) => ({
        deviceId: device._id,
        timestamp: entry.timestamp,
        data: entry.data,
      }));

      await Telemetry.insertMany(records);
      console.log(
        `✔ Transferred ${records.length} records from device ${device.name}`
      );

      // Xoá dữ liệu cũ khỏi device
      await Device.updateOne({ _id: device._id }, { $unset: { telemetry: 1 } });
    }

    console.log("✅ Migration completed.");
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
})();
