const { exec } = require('child_process');
const path = require('path');

const CameraController = {
    // [POST] /api/camera/capture
    captureImage: (req, res) => {
        // 1. Tạo tên file ngẫu nhiên theo thời gian
        const fileName = `shot_${Date.now()}.jpg`;

        // 2. Trỏ đường dẫn lưu ảnh vào thư mục public/raw_images của project
        const savePath = path.join(__dirname, '../../public/raw_images', fileName);

        // 3. Lệnh gphoto2 (đã chốt: trảm PTPCamera không cần pass + bóp cò)
        const command = `killall -9 PTPCamera 2>/dev/null; gphoto2 --capture-image-and-download --force-overwrite --filename="${savePath}"`;

        console.log(`📸 Đang ra lệnh chụp ảnh...`);

        // 4. Kích hoạt Terminal ngầm chạy lệnh
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ Lỗi máy ảnh:`, error.message);
                return res.status(500).json({
                    success: false,
                    message: 'Không thể chụp ảnh. Vui lòng kiểm tra lại cáp kết nối.'
                });
            }

            console.log(`✅ Tách! Ảnh đã lưu tại: ${fileName}`);

            // 5. Trả về cái link URL để Frontend lấy ảnh lên màn hình
            const imageUrl = `http://localhost:${process.env.PORT || 3000}/public/raw_images/${fileName}`;

            res.json({
                success: true,
                message: 'Chụp thành công!',
                data: {
                    file_name: fileName,
                    url: imageUrl
                }
            });
        });
    }
};

module.exports = CameraController;