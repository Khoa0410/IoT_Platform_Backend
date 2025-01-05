const Chart = require("../models/chart");
const authenticate = require("../middlewares/authenticate");

exports.createChart = async (req, res) => {
  const { name, device, field, type } = req.body;

  try {
    // Kiểm tra nếu tên biểu đồ đã tồn tại cho user
    const existingChart = await Chart.findOne({ name, user: req.user._id });
    if (existingChart) {
      return res.status(400).json({ message: "Chart name already exists." });
    }

    const newChart = new Chart({
      name,
      device,
      field,
      type,
      user: req.user._id,
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

exports.updateChart = async (req, res) => {
  const { chartId } = req.params;
  const { name, device, field, type } = req.body;

  try {
    const chart = await Chart.findById(chartId);

    if (!chart) {
      return res.status(404).json({ message: "Chart not found" });
    }

    // Kiểm tra nếu biểu đồ thuộc về người dùng hiện tại
    if (chart.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this chart" });
    }

    // Kiểm tra nếu tên mới đã tồn tại (trừ chính biểu đồ đang chỉnh sửa)
    if (name && name !== chart.name) {
      const nameExists = await Chart.findOne({
        name,
        user: req.user._id,
        _id: { $ne: chartId },
      });

      if (nameExists) {
        return res
          .status(400)
          .json({
            message: "Chart name already exists. Please choose another name.",
          });
      }
    }

    // Cập nhật các trường
    if (name) chart.name = name;
    if (device) chart.device = device;
    if (field) chart.field = field;
    if (type) chart.type = type;

    await chart.save();
    res.status(200).json({ message: "Chart updated successfully", chart });
  } catch (error) {
    console.error("Error updating chart:", error);
    res.status(500).json({ message: "Error updating chart", error });
  }
};

exports.deleteChart = async (req, res) => {
  const { chartId } = req.params;

  try {
    const chart = await Chart.findById(chartId);

    if (!chart) {
      return res.status(404).json({ message: "Chart not found" });
    }

    // Kiểm tra nếu chart thuộc về người dùng hiện tại
    if (chart.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this chart" });
    }

    // Xóa chart
    await chart.deleteOne();
    res.status(200).json({ message: "Chart deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting chart", error });
  }
};
