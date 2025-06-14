const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Gửi email cảnh báo tới người dùng
 * @param {String} to - Địa chỉ email người nhận
 * @param {String} alertName - Tên cảnh báo
 * @param {String} deviceName - Tên thiết bị
 * @param {Object} data - Dữ liệu cảm biến thực tế
 */
const sendAlertEmail = async (to, alertName, deviceName, data) => {
  const htmlContent = `
    <h3>Cảnh báo: ${alertName}</h3>
    <p>Thiết bị: <strong>${deviceName}</strong></p>
    <p>Dữ liệu cảm biến vượt ngưỡng:</p>
    <pre>${JSON.stringify(data, null, 2)}</pre>
    <p>Thời gian: ${new Date().toLocaleString("vi-VN", {
      timeZone: "Asia/Ho_Chi_Minh",
    })}</p>
  `;

  const mailOptions = {
    from: `"IoT Platform" <${process.env.EMAIL_USERNAME}>`,
    to,
    subject: `⚠️ Cảnh báo từ thiết bị ${deviceName}`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Đã gửi email cảnh báo tới ${to}`);
  } catch (error) {
    console.error("❌ Gửi email thất bại:", error);
  }
};

module.exports = { sendAlertEmail };
