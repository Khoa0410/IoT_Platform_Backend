const Device = require('../models/device');

exports.createDevice = async (req, res) => {
  const { name } = req.body;

  try {
    const newDevice = new Device({ name, telemetry: [] });
    await newDevice.save();
    res.status(201).json(newDevice);
  } catch (error) {
    res.status(500).json({ message: 'Error creating device', error });
  }
};

exports.getDevices = async (req, res) => {
  try {
    const devices = await Device.find();
    res.status(200).json(devices);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching devices', error });
  }
};
