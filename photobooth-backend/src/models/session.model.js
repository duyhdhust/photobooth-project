const db = require('../config/db');

const SessionModel = {
    // 1. Lấy danh sách khung ảnh để hiển thị lên màn hình (Kèm theo giá luôn)
    getActiveFrames: async () => {
        const [frames] = await db.query(`SELECT * FROM Frames WHERE status = 'active'`);
        return frames;
    },

    // 2. Lấy giá tiền của 1 khung cụ thể để tính tiền
    getFrameById: async (frame_id) => {
        const [rows] = await db.query(`SELECT price FROM Frames WHERE frame_id = ? AND status = 'active'`, [frame_id]);
        return rows[0]; // Trả về object chứa cột price, hoặc undefined nếu không thấy
    },

    // 3. Tạo phiên chụp mới
    createSession: async (session_id, frame_id, quantity, total_amount) => {
        await db.query(
            `INSERT INTO Sessions (session_id, frame_id, quantity, total_amount) 
             VALUES (?, ?, ?, ?)`,
            [session_id, frame_id, quantity, total_amount]
        );
    },

    // 4. Kiểm tra trạng thái đơn hàng
    getStatus: async (session_id) => {
        const [rows] = await db.query(`SELECT status FROM Sessions WHERE session_id = ?`, [session_id]);
        return rows[0];
    },

    // 5. Cập nhật trạng thái thanh toán
    updateStatus: async (session_id, status) => {
        await db.query(
            `UPDATE Sessions SET status = ? WHERE session_id = ?`,
            [status, session_id]
        );
    }
};

module.exports = SessionModel;