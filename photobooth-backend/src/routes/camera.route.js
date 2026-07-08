const express = require('express');
const router = express.Router();
const cameraController = require('../controllers/camera.controller');

// Luồng bóp cò chụp ảnh
router.post('/capture', cameraController.captureImage);

module.exports = router;