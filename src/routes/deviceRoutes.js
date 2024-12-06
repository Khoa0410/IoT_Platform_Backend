const express = require('express');
const { createDevice, getDevices } = require('../controllers/deviceController');

const router = express.Router();

router.post('/devices', createDevice);
router.get('/devices', getDevices);

module.exports = router;
