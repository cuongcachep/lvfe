import React, { useEffect, useState, useCallback } from "react";
import HinhAnhModel from "../../../models/HinhAnhModel";
import { getAllImageOfOneBook } from "../../../api/HinhAnhApi";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

interface HinhAnhSanPhamProps {
  maSach: number;
  className?: string;
  style?: React.CSSProperties;
}

const HinhAnhSanPham: React.FC<HinhAnhSanPhamProps> = ({ maSach, className, style }) => {
  const [danhSachAnh, setDanhSachAnh] = useState<HinhAnhModel[]>([]);
  const [dangTaiDuLieu, setDangTaiDuLieu] = useState(true);
  const [baoLoi, setBaoLoi] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(
    () => {
      const loadFirstImage = async () => {
        getAllImageOfOneBook(maSach)
          .then((danhSach) => {
            console.log(danhSach);
            setDanhSachAnh(danhSach);
            setDangTaiDuLieu(false);
          })
          .catch((error) => {
            setDangTaiDuLieu(false);
            setBaoLoi(error.message);
          });
      };
      loadFirstImage();
    },
    [maSach]
  );

  // Mở modal khi click vào hình
  const openModal = (index: number) => {
    setCurrentImageIndex(index);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
    setIsModalOpen(true);
  };

  // Đóng modal
  const closeModal = () => {
    setIsModalOpen(false);
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  };

  // Chuyển sang hình trước
  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? danhSachAnh.length - 1 : prev - 1
    );
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  }, [danhSachAnh.length]);

  // Chuyển sang hình tiếp theo
  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) => 
      prev === danhSachAnh.length - 1 ? 0 : prev + 1
    );
    setZoomLevel(1);
    setPosition({ x: 0, y: 0 });
  }, [danhSachAnh.length]);

  // Xử lý zoom bằng scroll
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.2 : 0.2;
    setZoomLevel((prev) => {
      const newZoom = Math.min(Math.max(prev + delta, 1), 5);
      if (newZoom === 1) {
        setPosition({ x: 0, y: 0 });
      }
      return newZoom;
    });
  }, []);

  // Xử lý kéo hình khi đã zoom
  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Reset zoom khi double click
  const handleDoubleClick = () => {
    if (zoomLevel > 1) {
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
    } else {
      setZoomLevel(2.5);
    }
  };

  // Xử lý phím bấm
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isModalOpen) return;
      
      if (e.key === "Escape") {
        closeModal();
      } else if (e.key === "ArrowLeft") {
        prevImage();
      } else if (e.key === "ArrowRight") {
        nextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, prevImage, nextImage]);

  // Ngăn scroll khi modal mở
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  if (dangTaiDuLieu) {
    return (
      <div>
        <h1>Đang tải dữ liệu</h1>
      </div>
    );
  }

  if (baoLoi) {
    return (
      <div>
        <h1>Gặp lỗi: {baoLoi}</h1>
      </div>
    );
  }

  return (
    <>
      <div className={`row ${className}`} style={style}>
        <div className="col-12">
          <Carousel 
            showArrows={true} 
            showIndicators={true}
            selectedItem={currentImageIndex}
            onChange={(index) => setCurrentImageIndex(index)}
          >
            {danhSachAnh.map((hinhAnh, index) => (
              <div 
                key={index} 
                onClick={() => openModal(index)}
                style={{ cursor: "zoom-in" }}
              >
                <img
                  src={hinhAnh.urlHinh}
                  alt={`${hinhAnh.tenHinhAnh}`}
                  style={{ maxWidth: "250px" }}
                />
              </div>
            ))}
          </Carousel>
        </div>
      </div>

      {/* Modal Zoom */}
      {isModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.9)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={closeModal}
        >
          {/* Nút đóng */}
          <button
            onClick={closeModal}
            style={{
              position: "absolute",
              top: "20px",
              right: "30px",
              background: "none",
              border: "none",
              color: "white",
              fontSize: "40px",
              cursor: "pointer",
              zIndex: 10001,
            }}
          >
            &times;
          </button>

          {/* Nút trái */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            style={{
              position: "absolute",
              left: "20px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              color: "white",
              fontSize: "30px",
              padding: "15px 20px",
              cursor: "pointer",
              borderRadius: "50%",
              zIndex: 10001,
              transition: "background 0.3s",
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.4)"}
            onMouseOut={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"}
          >
            &#10094;
          </button>

          {/* Hình ảnh zoom */}
          <div
            onClick={(e) => e.stopPropagation()}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onDoubleClick={handleDoubleClick}
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: zoomLevel > 1 ? (isDragging ? "grabbing" : "grab") : "zoom-in",
              userSelect: "none",
            }}
          >
            <img
              src={danhSachAnh[currentImageIndex]?.urlHinh}
              alt={danhSachAnh[currentImageIndex]?.tenHinhAnh}
              style={{
                maxWidth: "100%",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: "8px",
                transform: `scale(${zoomLevel}) translate(${position.x / zoomLevel}px, ${position.y / zoomLevel}px)`,
                transition: isDragging ? "none" : "transform 0.1s ease-out",
              }}
              draggable={false}
            />
            {/* Số thứ tự hình và zoom level */}
            <div
              style={{
                color: "white",
                marginTop: "15px",
                fontSize: "16px",
                display: "flex",
                gap: "20px",
                alignItems: "center",
              }}
            >
              <span>{currentImageIndex + 1} / {danhSachAnh.length}</span>
              <span style={{ opacity: 0.7 }}>Zoom: {Math.round(zoomLevel * 100)}%</span>
            </div>
          </div>

          {/* Nút phải */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            style={{
              position: "absolute",
              right: "20px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              color: "white",
              fontSize: "30px",
              padding: "15px 20px",
              cursor: "pointer",
              borderRadius: "50%",
              zIndex: 10001,
              transition: "background 0.3s",
            }}
            onMouseOver={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.4)"}
            onMouseOut={(e) => e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)"}
          >
            &#10095;
          </button>

          {/* Thumbnail bar */}
          <div
            style={{
              position: "absolute",
              bottom: "20px",
              display: "flex",
              gap: "10px",
              overflowX: "auto",
              maxWidth: "80%",
              padding: "10px",
            }}
          >
            {danhSachAnh.map((hinhAnh, index) => (
              <img
                key={index}
                src={hinhAnh.urlHinh}
                alt={hinhAnh.tenHinhAnh}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                style={{
                  width: "60px",
                  height: "60px",
                  objectFit: "cover",
                  cursor: "pointer",
                  border: currentImageIndex === index ? "3px solid #fff" : "3px solid transparent",
                  borderRadius: "4px",
                  opacity: currentImageIndex === index ? 1 : 0.6,
                  transition: "all 0.3s",
                }}
              />
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default HinhAnhSanPham;
