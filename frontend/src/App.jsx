import { useEffect, useRef } from 'react'
import './App.css'

function App() {
  const videoRef = useRef(null)

  useEffect(() => {
    async function startLiveview() {
      try {
        // Xin quyền truy cập camera
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        })

        // Đẩy luồng video vào thẻ video
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (err) {
        console.error("Lỗi bật cam: ", err)
        alert("Không tìm thấy Capture Card hoặc chưa cấp quyền Camera!")
      }
    }

    startLiveview()
  }, [])

  return (
    <div className="app-container" style={{ textAlign: 'center', padding: '20px' }}>
      <h1>Gương soi Photobooth</h1>
      {/* Thẻ video hứng hình ảnh từ Capture Card */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: '100%',
          maxWidth: '800px',
          borderRadius: '12px',
          transform: 'scaleX(-1)', // Lật ngược như gương
          backgroundColor: '#000'
        }}
      />
    </div>
  )
}

export default App