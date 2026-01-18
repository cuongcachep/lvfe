import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface SanPhamGioHang {
  maSach: number;
  sachDto: {
    tenSach: string;
    giaBan: number;
    hinhAnh: string;
  };
  soLuong: number;
  hinhAnh?: string;
}

function KetQuaThanhToan() {
  const [trangThai, setTrangThai] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Lấy toàn bộ query string VNPAY trả về sau khi thanh toán
    const queryString = window.location.search;
    const params = new URLSearchParams(queryString);
    const vnpResp = params.get('vnp_ResponseCode'); // "00" = VNPAY báo thành công

    // Gửi query lên backend để xác thực kết quả thanh toán
    fetch('http://localhost:8080/api/don-hang/vnpay-payment' + queryString, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jwt')}`,
      },
    })
      .then(async (response) => {
        if (response.status === 401) {
          alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để xem trạng thái đơn hàng.');
          navigate('/dang-nhap');
          return null;
        }
        // Backend trả JSON: { status: "success" | "failed" | "error", ... }
        // Fallback: nếu không phải JSON, thử đọc text (hỗ trợ bản cũ trả "ordersuccess")
        const ct = response.headers.get('content-type') || '';
        if (ct.includes('application/json')) {
          return response.json();
        }
        const text = await response.text();
        return { _text: text };
      })
      .then((data) => {
        if (!data) return;

        const vnpResp = params.get('vnp_ResponseCode');
        const backendSuccess =
          typeof data === 'object' && 'status' in data ? data.status === 'success' : false;
        const legacySuccess =
          typeof data === 'object' && '_text' in data
            ? String(data._text).trim().toLowerCase() === 'ordersuccess'
            : false;
        const vnpSuccess = vnpResp === '00';

        const success = backendSuccess || legacySuccess || vnpSuccess;
        setTrangThai(success);

        if (success) {
          // Xóa giỏ hàng sau khi thanh toán thành công
          localStorage.removeItem('gioHang');
          window.dispatchEvent(new Event('storage'));
        } else {
          console.warn('Thanh toán thất bại', { backend: data, vnp_ResponseCode: vnpResp });
          if (vnpResp && vnpResp !== '00') {
            alert('Thanh toán thất bại. Mã phản hồi VNPAY: ' + vnpResp);
          }
        }
      })
      .catch((error) => {
        console.error('Lỗi:', error);
        alert('Không thể xác minh kết quả thanh toán. Vui lòng thử lại hoặc liên hệ hỗ trợ.');
      });
  }, [navigate]);

  return (
    <div className="container py-5">
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-dark text-white">
              <h4 className="mb-0">Trạng thái thanh toán của đơn hàng</h4>
            </div>
            <div className="card-body" style={{ display: 'flex', justifyContent: 'center' }}>
              <div>
                {trangThai ? (
                  <img src="/image/susses.png" alt="Success" />
                ) : (
                  <img src="/image/download.png" alt="Failed" />
                )}
                {trangThai ? <h1>Thanh toán thành công</h1> : <h1>Thanh toán thất bại</h1>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default KetQuaThanhToan;