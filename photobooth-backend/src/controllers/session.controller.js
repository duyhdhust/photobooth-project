const SessionModel = require('../models/session.model');
const { PayOS } = require('@payos/node');

const payOS = new PayOS({
    clientId: process.env.PAYOS_CLIENT_ID,
    apiKey: process.env.PAYOS_API_KEY,
    checksumKey: process.env.PAYOS_CHECKSUM_KEY
});

const SessionController = {
    // [GET] /api/sessions/frames
    getFrames: async (req, res) => {
        try {
            const frames = await SessionModel.getActiveFrames();
            res.json({ success: true, data: frames });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi lấy danh sách khung ảnh' });
        }
    },

    // [POST] /api/sessions/create (ĐÃ CẬP NHẬT THEO LUỒNG MỚI)
    createSession: async (req, res) => {
        const { frame_id, quantity } = req.body;

        // Validation: Bắt buộc phải có khung và số lượng >= 1
        if (!frame_id || !quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: 'Bắt buộc phải chọn khung ảnh và số lượng' });
        }

        try {
            // Lấy giá tiền của chính cái khung đó từ Database
            const frame = await SessionModel.getFrameById(frame_id);

            if (!frame) {
                return res.status(400).json({ success: false, message: 'Khung ảnh không tồn tại hoặc đã bị khóa' });
            }

            // Tính tiền = Số lượng * Giá khung
            const total_amount = frame.price * quantity;

            const orderCode = Number(String(new Date().getTime()).slice(-9));
            const session_id = 'SS' + orderCode;

            // Cất vào DB
            await SessionModel.createSession(session_id, frame_id, quantity, total_amount);

            // Gọi PayOS tạo QR
            const requestData = {
                orderCode: orderCode,
                amount: total_amount,
                description: `Chup anh ${orderCode}`,
                cancelUrl: `http://localhost:${process.env.PORT || 3000}/cancel.html`,
                returnUrl: `http://localhost:${process.env.PORT || 3000}/success.html`
            };
            const paymentLink = await payOS.paymentRequests.create(requestData);

            res.json({ success: true, session_id, total_amount, payment_url: paymentLink.checkoutUrl });

        } catch (error) {
            console.error('Lỗi tạo đơn:', error);
            res.status(500).json({ success: false, message: 'Lỗi server khi tạo thanh toán' });
        }
    },

    // [GET] /api/sessions/:session_id/status
    checkStatus: async (req, res) => {
        try {
            const session = await SessionModel.getStatus(req.params.session_id);
            if (!session) return res.status(404).json({ success: false, message: 'Không tìm thấy phiên chụp' });

            res.json({ success: true, status: session.status });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Lỗi kiểm tra trạng thái' });
        }
    },

    // [GET] /api/sessions/webhook (Dành cho PayOS ping test)
    verifyWebhook: (req, res) => {
        res.json({ error: 0, message: "Ok", data: null });
    },

    // [POST] /api/sessions/webhook (Nhận tiền về thật)
    handleWebhook: async (req, res) => {
        try {
            const body = req.body;
            if (body.data && body.data.orderCode) {
                const session_id = 'SS' + body.data.orderCode;
                await SessionModel.updateStatus(session_id, 'paid');
                console.log(`✅ [TING TING] Đơn hàng ${session_id} đã thanh toán!`);
            }
            return res.json({ error: 0, message: "Ok", data: null });
        } catch (error) {
            console.error('Lỗi Webhook:', error);
            return res.json({ error: 0, message: "Ok", data: null });
        }
    }
};

module.exports = SessionController;