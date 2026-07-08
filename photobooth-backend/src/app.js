const express = require('express');
const cors = require('cors');
require('dotenv').config();

const sessionRoutes = require('./routes/session.route');

const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình Middleware
app.use(cors());
app.use(express.json());

// Trang chủ
app.get('/', (req, res) => {
    res.send('<h1>🔥 Server Backend Photobooth (MVC Pattern) đang chạy rực rỡ!</h1>');
});
app.get('/success.html', (req, res) => {
    res.send('<h2 style="color: green; text-align: center; margin-top: 50px;">✅ Thanh toán thành công!<br>Vui lòng nhìn lên màn hình bốt chụp ảnh để tiếp tục.</h2>');
});

app.get('/cancel.html', (req, res) => {
    res.send('<h2 style="color: red; text-align: center; margin-top: 50px;">❌ Đã hủy thanh toán!</h2>');
});
// Kích hoạt tất cả các Router
app.use('/api/sessions', sessionRoutes);
app.use('/public', express.static('public'));
// Bật Server
app.listen(PORT, () => {
    console.log(`🔥 Server Backend đang chạy tại: http://localhost:${PORT}`);
});
app.use('/public', express.static('public'));

// 2. Import Router của Camera vào hệ thống
const cameraRoutes = require('./routes/camera.route');
app.use('/api/camera', cameraRoutes);