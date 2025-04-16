const Alert = require("../models/alert");
const { sendAlertEmail } = require("./mailService");

/**
 * Đánh giá điều kiện
 */
const evaluate = (sensorValue, operator, value) => {
  switch (operator) {
    case ">":
      return sensorValue > value;
    case ">=":
      return sensorValue >= value;
    case "<":
      return sensorValue < value;
    case "<=":
      return sensorValue <= value;
    case "==":
      return sensorValue == value;
    case "!=":
      return sensorValue != value;
    default:
      return false;
  }
};

/**
 * Kiểm tra và kích hoạt cảnh báo nếu có
 * @param {String} deviceId - ObjectId của thiết bị
 * @param {Object} telemetryData - Dữ liệu cảm biến mới nhận
 */
const checkAndTriggerAlerts = async (deviceId, telemetryData) => {
  try {
    const alerts = await Alert.find({
      device: deviceId,
      isActive: true,
    }).populate("user device");

    for (const alert of alerts) {
      const { conditions, logic, user, device } = alert;

      if (!user || !device) continue;

      const conditionResults = conditions.map(
        ({ sensorField, operator, value }) => {
          const sensorValue = telemetryData[sensorField];
          if (sensorValue === undefined) return false;
          return evaluate(sensorValue, operator, value);
        }
      );

      const shouldTrigger =
        logic === "AND"
          ? conditionResults.every(Boolean)
          : conditionResults.some(Boolean);

      if (shouldTrigger && alert.emailNotification) {
        await sendAlertEmail(
          user.email,
          alert.name,
          device.name,
          telemetryData
        );
      }
    }
  } catch (error) {
    console.error("Lỗi khi kiểm tra cảnh báo:", error);
  }
};

module.exports = { checkAndTriggerAlerts };
