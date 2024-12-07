const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const mqttService = require('./services/mqttService');
const authRoutes = require('./routes/authRoutes');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

(async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log('Connected to MongoDB');
    } catch (error) {
      console.error('Error connecting to MongoDB:', error);
    }
  })();

const deviceRoutes = require('./routes/deviceRoutes');

// Thêm route quản lý thiết bị
app.use('/api', deviceRoutes);

// Route đăng ký
app.use('/api/auth', authRoutes);

// Khởi chạy server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});