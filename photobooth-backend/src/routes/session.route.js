const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/session.controller');

// Lấy danh sách khung (có kèm giá)
router.get('/frames', sessionController.getFrames);

// Luồng Thanh toán
router.post('/create', sessionController.createSession);
router.get('/:session_id/status', sessionController.checkStatus);

// Webhook
router.get('/webhook', sessionController.verifyWebhook);
router.post('/webhook', sessionController.handleWebhook);

module.exports = router;