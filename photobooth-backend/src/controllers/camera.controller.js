const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

const CameraController = {
    captureImage: (req, res) => {
        const fileName = `shot_${Date.now()}.jpg`;
        const dirPath = path.join(__dirname, '../../public/raw_images');

        // 1. Kiểm tra folder tồn tại chưa, chưa thì tạo ngay
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        const savePath = path.join(dirPath, fileName);

        // 2. Thêm timeout (ví dụ 10 giây) để tránh việc máy ảnh treo làm chết backend
        // Và đảm bảo lệnh kill PTPCamera chạy xong rồi mới chụp
        const command = `killall -9 PTPCamera 2>/dev/null && gphoto2 --capture-image-and-download --force-overwrite --filename="${savePath}"`;

        console.log(`📸 Đang ra lệnh chụp ảnh...`);

        exec(command, { timeout: 15000 }, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Lỗi hệ thống khi chụp:`, error.message);
                return res.status(500).json({
                    success: false,
                    message: 'Lỗi chụp ảnh: Máy ảnh không phản hồi. Kiểm tra lại cáp hoặc bật nguồn.',
                    details: error.message
                });
            }

            // Kiểm tra xem file có thực sự được tạo ra không
            if (fs.existsSync(savePath)) {
                console.log(`✅ Tách! Ảnh lưu tại: ${savePath}`);
                const imageUrl = `${req.protocol}://${req.get('host')}/raw_images/${fileName}`;

                res.json({
                    success: true,
                    message: 'Chụp thành công!',
                    data: { file_name: fileName, url: imageUrl }
                });
            } else {
                res.status(500).json({ success: false, message: 'Ảnh chụp không được lưu xuống ổ cứng.' });
            }
        });
    }
};

module.exports = CameraController;