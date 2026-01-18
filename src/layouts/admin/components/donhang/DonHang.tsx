import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

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

function DonHang() {
    const navigate = useNavigate();
    const [donHangList, setDonHangList] = useState<any[]>([]);
    const [dangTaiDuLieu, setDangTaiDuLieu] = useState(true);
    const [baoLoi, setBaoLoi] = useState<string | null>(null);

    useEffect(() => {
        initData();
    }, []);

    const initData = () => {
        setDangTaiDuLieu(true);
        setBaoLoi(null);

        fetch("http://localhost:8080/api/don-hang/findAll?page=0", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('jwt')}`,
            },
        })
        .then((response) => {
            console.log("Status:", response.status);
            
            // Xử lý lỗi 401 - chưa đăng nhập hoặc token hết hạn
            if (response.status === 401) {
                alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
                localStorage.removeItem('jwt');
                navigate("/dang-nhap");
                throw new Error('Unauthorized');
            }

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response.json();
        })
        .then((response) => {
            setDonHangList(response.content || []);
            setDangTaiDuLieu(false);
            console.log("Danh sách đơn hàng:", response.content);
        })
        .catch((error) => {
            console.error("Lỗi:", error);
            if (error.message !== 'Unauthorized') {
                setBaoLoi(error.message);
            }
            setDangTaiDuLieu(false);
        });
    }

    // Hiển thị trạng thái loading
    if (dangTaiDuLieu) {
        return (
            <div className="container py-5">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-2">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    // Hiển thị lỗi
    if (baoLoi) {
        return (
            <div className="container py-5">
                <div className="alert alert-danger" role="alert">
                    {baoLoi}
                </div>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row">
                <div className="col-12">
                    <div className="card shadow-sm">
                        <div className="card-header bg-dark text-white">
                            <h4 className="mb-0">Quản lý đơn hàng</h4>
                        </div>
                        <div className="card-body">
                     
                                    <div className="table-responsive">
                                        <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                                <tr>
                                                    <th scope="col" style={{ width: '100px' }}>Mã đơn hàng</th>
                                                    <th scope="col">Ngày tạo</th>
                                                    <th scope="col">Địa chỉ nhận hàng</th>
                                                    <th scope="col" >Trạng thái thanh toán</th>
                                                    <th scope="col" >Trạng thái giao hàng</th>
                                                    <th scope="col" className="text-end">Tổng tiền</th>
                                                
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {donHangList.map((item) => (
                                                    <tr key={item.maDonHang}>
                                                        <td>
                                                            {item.maDonHang}
                                                        </td>
                                                        <td>
                                                            {item.ngayTao}
                                                        </td>
                                                        <td>
                                                            {item.diaChiNhanHang}
                                                        </td>
                                                        <td>
                                                            <button className="btn btn-susses me-2">
                                                                {item.trangThaiThanhToan === 0 ?"Chưa thanh toán":"Đã thanh toán"}
                                                            </button>
                                                        </td>
                                                        <td>
                                                            <button onClick={item.trangThaiGiaoHang !== 2 ?async ()=>{
                                                                if (window.confirm('Bạn có chắc chắn muốn cập nhật trạng thái giao hàng?')) {
                                                                    await fetch("http://localhost:8080/api/don-hang/cap-nhat-trang-thai-giao-hang/"+item.maDonHang, {
                                                                        method: "POST",
                                                                        headers: {
                                                                            "Authorization": `Bearer ${localStorage.getItem('jwt')}`,
                                                                        },
                                                                    })
                                                                        .then( (response) => {
                                                                           
                                                                            return response.json();
                                                                        })
                                                                        .then((response) => {
                                                                          
                                                                          
                                                                        })
                                                                        .catch((error) => {
                                                                            console.error("Lỗi:", error);
                                                                            
                                                                        });  
                                                                        await   initData();  
                                                                }
                                                                
                                                            }:undefined} className="btn btn-primary me-2">
                                                                { item.trangThaiGiaoHang === 2  ?"Đã nhận hàng":"Chưa nhận hàng"}
                                                            </button>
                                                            
                                                        </td>
                                                    
                                                        <td className="text-end">
                                                            {item.tongTien}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                                
                                        </table>
                                    </div>
                            
                                       
                                    </div>
                   

                        </div>
                    </div>
                </div>
            </div>
    );
}

export default DonHang;