const Chart = require("../models/chart");
const authenticate = require("../middlewares/authenticate");

exports.createChart = async (req, res) => {
  const { name, device, field, type } = req.body;

  try {
    const newChart = new Chart({
      name,
      device,
      field,
      type,
      user: req.user._id, // Lấy từ middleware authenticate
    });

    await newChart.save();
    res
      .status(201)
      .json({ message: "Chart created successfully", chart: newChart });
  } catch (error) {
    res.status(500).json({ message: "Error creating chart", error });
  }
};

exports.getCharts = async (req, res) => {
  try {
    const charts = await Chart.find({ user: req.user._id });
    res.status(200).json(charts);
  } catch (error) {
    res.status(500).json({ message: "Error fetching charts", error });
  }
};
