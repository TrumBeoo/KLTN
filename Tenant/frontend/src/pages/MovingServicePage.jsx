import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useScrollToTop } from "../hooks/useScrollToTop";
import { movingServiceAPI } from "../services/movingServiceAPI";

// ─── Design tokens (matching existing system) ─────────────────────────────────
const T = {
  blue: "#006ce4",
  blueDk: "#003f8a",
  blueLt: "#e8f2ff",
  text: "#1a1a1a",
  muted: "#595959",
  bg: "#f2f4f8",
  white: "#ffffff",
  border: "#d4d6d9",
  yellow: "#febb02",
  green: "#008234",
  greenLt: "#e8f5ee",
  red: "#c8102e",
  redLt: "#fde8eb",
  shadow1: "rgba(26,26,26,0.16) 0px 2px 8px 0px",
  motion: "120ms",
};

// ─── Mock Data ────────────────────────────────────────────────────────────────
const SERVICES = [
  {
    ServiceID: "SVC0000001",
    CategoryID: "student",
    CategoryName: "Sinh viên",
    Name: "Chuyển phòng trọ mini",
    Description: "Dành cho sinh viên hoặc người thuê phòng trọ ít đồ. Xe máy hoặc xe ba bánh nhỏ gọn.",
    BasePrice: 150000,
    PricePerKm: 8000,
    FreeDistanceKm: 3,
    MaxDistanceKm: 20,
    ExtraFloorPrice: 30000,
    OvertimePrice: 50000,
    VehicleType: "tricycle",
    EstimatedDuration: 60,
    MaxItems: 20,
    Features: JSON.stringify(["Bốc xếp cơ bản", "1 nhân viên", "Bảo hiểm hàng hóa"]),
    IsPopular: false,
  },
  {
    ServiceID: "SVC0000002",
    CategoryID: "basic",
    CategoryName: "Cơ bản",
    Name: "Chuyển nhà tiêu chuẩn",
    Description: "Phù hợp cho căn hộ studio hoặc phòng nhỏ. Xe van đời mới, đội ngũ chuyên nghiệp.",
    BasePrice: 350000,
    PricePerKm: 12000,
    FreeDistanceKm: 5,
    MaxDistanceKm: 50,
    ExtraFloorPrice: 50000,
    OvertimePrice: 80000,
    VehicleType: "van",
    EstimatedDuration: 120,
    MaxItems: 50,
    Features: JSON.stringify(["Bốc xếp chuyên nghiệp", "2 nhân viên", "Bảo hiểm toàn diện", "Bao bì miễn phí"]),
    IsPopular: true,
  },
  {
    ServiceID: "SVC0000003",
    CategoryID: "premium",
    CategoryName: "Cao cấp",
    Name: "Chuyển nhà VIP",
    Description: "Dịch vụ cao cấp với xe tải lớn, đội ngũ 4 người, đóng gói toàn bộ đồ đạc.",
    BasePrice: 650000,
    PricePerKm: 15000,
    FreeDistanceKm: 10,
    MaxDistanceKm: 100,
    ExtraFloorPrice: 80000,
    OvertimePrice: 100000,
    VehicleType: "truck",
    EstimatedDuration: 240,
    MaxItems: null,
    Features: JSON.stringify(["Đóng gói toàn bộ", "4 nhân viên", "Bảo hiểm cao cấp", "Tháo lắp nội thất", "Dọn dẹp sau chuyển"]),
    IsPopular: false,
  },
  {
    ServiceID: "SVC0000004",
    CategoryID: "family",
    CategoryName: "Gia đình",
    Name: "Chuyển nhà gia đình",
    Description: "Thiết kế cho hộ gia đình 2-4 người. Xe tải vừa, đội 3 nhân viên có kinh nghiệm.",
    BasePrice: 500000,
    PricePerKm: 13000,
    FreeDistanceKm: 8,
    MaxDistanceKm: 80,
    ExtraFloorPrice: 60000,
    OvertimePrice: 90000,
    VehicleType: "truck",
    EstimatedDuration: 180,
    MaxItems: 100,
    Features: JSON.stringify(["Tháo lắp nội thất", "3 nhân viên", "Bảo hiểm toàn diện", "Xe tải sạch sẽ"]),
    IsPopular: false,
  },
  {
    ServiceID: "SVC0000005",
    CategoryID: "basic",
    CategoryName: "Cơ bản",
    Name: "Chuyển văn phòng nhỏ",
    Description: "Phù hợp cho văn phòng dưới 10 người. Xe pickup hoặc van, đội 2-3 người.",
    BasePrice: 420000,
    PricePerKm: 13000,
    FreeDistanceKm: 6,
    MaxDistanceKm: 60,
    ExtraFloorPrice: 55000,
    OvertimePrice: 85000,
    VehicleType: "pickup",
    EstimatedDuration: 150,
    MaxItems: 60,
    Features: JSON.stringify(["Tháo lắp bàn ghế", "3 nhân viên", "Bảo hiểm thiết bị", "Làm ngoài giờ"]),
    IsPopular: false,
  },
  {
    ServiceID: "SVC0000006",
    CategoryID: "student",
    CategoryName: "Sinh viên",
    Name: "Chuyển đồ xe máy",
    Description: "Chỉ 1-2 thùng đồ nhỏ, di chuyển trong nội thành. Nhanh, gọn, tiết kiệm.",
    BasePrice: 80000,
    PricePerKm: 5000,
    FreeDistanceKm: 2,
    MaxDistanceKm: 15,
    ExtraFloorPrice: 20000,
    OvertimePrice: 30000,
    VehicleType: "motorbike",
    EstimatedDuration: 30,
    MaxItems: 5,
    Features: JSON.stringify(["1 nhân viên", "Nhanh gọn"]),
    IsPopular: false,
  },
];

// ─── Vehicle Icons ────────────────────────────────────────────────────────────
const VehicleIcon = ({ type, size = 24 }) => {
  const icons = {
    motorbike: "🛵",
    tricycle: "🛺",
    van: "🚐",
    truck: "🚚",
    pickup: "🛻",
  };
  return <span style={{ fontSize: size }}>{icons[type] || "🚐"}</span>;
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const config = {
    pending: { bg: "#fef6e8", color: "#a16100", label: "Chờ xác nhận" },
    confirmed: { bg: T.blueLt, color: T.blue, label: "Đã xác nhận" },
    moving: { bg: "#f0e6ff", color: "#6a1b9a", label: "Đang chuyển" },
    completed: { bg: T.greenLt, color: T.green, label: "Hoàn thành" },
    cancelled: { bg: T.redLt, color: T.red, label: "Đã hủy" },
  };
  const c = config[status] || config.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 10px", borderRadius: 4,
      background: c.bg, color: c.color,
      fontSize: 12, fontWeight: 700,
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c.color, display: "inline-block" }} />
      {c.label}
    </span>
  );
};

// ─── Service Card ─────────────────────────────────────────────────────────────
const ServiceCard = ({ service, onViewDetail, onBook, userRole }) => {
  const [hovered, setHovered] = useState(false);
  const features = JSON.parse(service.Features || "[]");
  const fmt = (n) => n.toLocaleString("vi-VN");

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: T.white,
        border: `1px solid ${hovered ? T.blue : T.border}`,
        borderRadius: 8,
        overflow: "hidden",
        transition: `all ${T.motion} ease`,
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        boxShadow: hovered ? "rgba(26,26,26,0.18) 0px 8px 24px" : T.shadow1,
        display: "flex",
        flexDirection: "column",
        position: "relative",
      }}
    >
      {service.IsPopular && (
        <div style={{
          position: "absolute", top: 12, right: 12,
          background: T.yellow, color: T.text,
          fontSize: 11, fontWeight: 700, padding: "3px 9px",
          borderRadius: 20, zIndex: 1,
        }}>
          Phổ biến nhất
        </div>
      )}

      {/* Header */}
      <div style={{ padding: "20px 20px 14px", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "flex-start", gap: 12, marginBottom: 10 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 10,
            background: T.blueLt, display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <VehicleIcon type={service.VehicleType} size={26} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 3, lineHeight: 1.3 }}>
              {service.Name}
            </div>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "2px 8px",
              borderRadius: 4, background: T.blueLt, color: T.blue,
            }}>
              {service.CategoryName}
            </span>
          </div>
        </div>
        <p style={{ fontSize: 13, color: T.muted, margin: 0, lineHeight: 1.5 }}>
          {service.Description}
        </p>
      </div>

      {/* Pricing */}
      <div style={{ padding: "14px 20px", background: "#fafbfc", borderBottom: `1px solid ${T.border}` }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 6 }}>
          <span style={{ fontSize: 22, fontWeight: 800, color: T.text }}>{fmt(service.BasePrice)}đ</span>
          <span style={{ fontSize: 12, color: T.muted }}>/ chuyến</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <div style={{ fontSize: 12, color: T.muted, display: "flex", justifyContent: "space-between" }}>
            <span>Miễn phí {service.FreeDistanceKm}km đầu</span>
            <span style={{ color: T.blue, fontWeight: 600 }}>+{fmt(service.PricePerKm)}đ/km</span>
          </div>
          <div style={{ fontSize: 12, color: T.muted, display: "flex", justifyContent: "space-between" }}>
            <span>Thời gian ước tính</span>
            <span style={{ fontWeight: 600, color: T.text }}>~{service.EstimatedDuration} phút</span>
          </div>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: "14px 20px", flex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {features.slice(0, 3).map((f, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: T.text }}>
              <span style={{ color: T.green, fontSize: 13 }}>✓</span>
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div style={{ padding: "14px 20px", display: "flex", gap: 8, borderTop: `1px solid ${T.border}` }}>
        <button
          onClick={() => onViewDetail(service)}
          style={{
            flex: 1, padding: "8px 0", borderRadius: 4,
            border: `1px solid ${T.border}`, background: T.white,
            color: T.text, fontSize: 13, fontWeight: 600,
            cursor: "pointer", transition: `all ${T.motion} ease`,
          }}
          onMouseEnter={e => { e.target.style.borderColor = T.blue; e.target.style.color = T.blue; }}
          onMouseLeave={e => { e.target.style.borderColor = T.border; e.target.style.color = T.text; }}
        >
          Chi tiết
        </button>
        {userRole !== 'Provider' && (
          <button
            onClick={() => onBook(service)}
            style={{
              flex: 2, padding: "8px 0", borderRadius: 4,
              border: "none", background: T.blue,
              color: T.white, fontSize: 13, fontWeight: 700,
              cursor: "pointer", transition: `all ${T.motion} ease`,
            }}
            onMouseEnter={e => { e.target.style.background = T.blueDk; }}
            onMouseLeave={e => { e.target.style.background = T.blue; }}
          >
            Đặt ngay →
          </button>
        )}
      </div>
    </div>
  );
};

// ─── Detail Drawer ────────────────────────────────────────────────────────────
const DetailDrawer = ({ service, onClose, onBook, userRole }) => {
  if (!service) return null;
  const features = JSON.parse(service.Features || "[]");
  const fmt = (n) => n.toLocaleString("vi-VN");

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
          zIndex: 1000, backdropFilter: "blur(2px)",
          animation: "fadeIn 0.2s ease",
        }}
      />
      <div style={{
        position: "fixed", top: 0, right: 0, bottom: 0,
        width: "min(460px, 100%)", background: T.white,
        zIndex: 1001, overflowY: "auto",
        boxShadow: "-4px 0 32px rgba(0,0,0,0.15)",
        animation: "slideIn 0.25s ease",
      }}>
        {/* Header */}
        <div style={{ padding: "20px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>Chi tiết dịch vụ</div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: T.muted, lineHeight: 1 }}>✕</button>
        </div>

        <div style={{ padding: 24 }}>
          {/* Service header */}
          <div style={{ display: "flex", gap: 14, marginBottom: 20 }}>
            <div style={{ width: 56, height: 56, borderRadius: 12, background: T.blueLt, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <VehicleIcon type={service.VehicleType} size={30} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 800, color: T.text, marginBottom: 4 }}>{service.Name}</div>
              <span style={{ fontSize: 12, fontWeight: 600, padding: "2px 8px", borderRadius: 4, background: T.blueLt, color: T.blue }}>{service.CategoryName}</span>
            </div>
          </div>

          <p style={{ fontSize: 14, color: T.muted, lineHeight: 1.6, marginBottom: 20 }}>{service.Description}</p>

          {/* Price breakdown */}
          <div style={{ background: "#f8fafc", border: `1px solid ${T.border}`, borderRadius: 8, padding: 18, marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>Bảng giá</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 14 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: T.text }}>{service.BasePrice.toLocaleString("vi-VN")}đ</span>
              <span style={{ fontSize: 13, color: T.muted }}>giá mở đầu</span>
            </div>
            {[
              { label: `Miễn phí ${service.FreeDistanceKm}km đầu`, value: "Miễn phí", highlight: true },
              { label: "Chi phí mỗi km tiếp theo", value: `+${fmt(service.PricePerKm)}đ/km` },
              service.MaxDistanceKm && { label: "Khoảng cách tối đa", value: `${service.MaxDistanceKm}km` },
              { label: "Phụ phí thêm tầng", value: `+${fmt(service.ExtraFloorPrice)}đ/tầng` },
              { label: "Phụ phí ngoài giờ", value: `+${fmt(service.OvertimePrice)}đ/giờ` },
            ].filter(Boolean).map((row, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "7px 0", borderTop: `1px solid ${T.border}` }}>
                <span style={{ fontSize: 13, color: T.muted }}>{row.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600, color: row.highlight ? T.green : T.text }}>{row.value}</span>
              </div>
            ))}
          </div>

          {/* Features */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 12 }}>Bao gồm</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {features.map((f, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: T.text }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: T.greenLt, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, color: T.green, flexShrink: 0 }}>✓</span>
                  {f}
                </div>
              ))}
            </div>
          </div>

          {/* Info chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
            <div style={{ padding: "6px 12px", borderRadius: 6, background: T.blueLt, color: T.blue, fontSize: 12, fontWeight: 600 }}>
              ⏱ ~{service.EstimatedDuration} phút
            </div>
            {service.MaxItems && (
              <div style={{ padding: "6px 12px", borderRadius: 6, background: "#fef6e8", color: "#a16100", fontSize: 12, fontWeight: 600 }}>
                📦 Tối đa {service.MaxItems} kiện
              </div>
            )}
          </div>

          {userRole !== 'Provider' && (
            <button
              onClick={() => onBook(service)}
              style={{
                width: "100%", padding: "14px", borderRadius: 6,
                border: "none", background: T.blue, color: T.white,
                fontSize: 15, fontWeight: 700, cursor: "pointer",
                transition: `all ${T.motion} ease`,
              }}
              onMouseEnter={e => { e.target.style.background = T.blueDk; }}
              onMouseLeave={e => { e.target.style.background = T.blue; }}
            >
              Đặt dịch vụ này →
            </button>
          )}
        </div>
      </div>
    </>
  );
};

// ─── Booking Wizard ────────────────────────────────────────────────────────────
const STEPS = ["Địa chỉ", "Ngày giờ", "Chi tiết", "Xem giá", "Xác nhận"];

const BookingWizard = ({ service, onClose, onSuccess }) => {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    pickupAddress: "",
    destinationAddress: "",
    distanceKm: "",
    movingDate: "",
    movingTime: "",
    floorFrom: 0,
    floorTo: 0,
    hasElevator: false,
    note: "",
  });

  const upd = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  // Price calculation
  const calcPrice = () => {
    const dist = parseFloat(form.distanceKm) || 0;
    const base = service.BasePrice;
    const extraDist = Math.max(0, dist - service.FreeDistanceKm);
    const distPrice = extraDist * service.PricePerKm;
    const floorDiff = Math.abs((parseInt(form.floorFrom) || 0) - (parseInt(form.floorTo) || 0));
    const floorFee = floorDiff > 0 && !form.hasElevator ? floorDiff * service.ExtraFloorPrice : 0;
    const total = base + distPrice + floorFee;
    return { base, distPrice, floorFee, total };
  };

  const fmt = (n) => Math.round(n).toLocaleString("vi-VN");
  const price = calcPrice();

  const canNext = () => {
    if (step === 0) return form.pickupAddress && form.destinationAddress;
    if (step === 1) return form.movingDate && form.movingTime;
    return true;
  };

  const handleSubmitBooking = async () => {
    try {
      setSubmitting(true);
      const bookingData = {
        serviceId: service.ServiceID,
        pickupAddress: form.pickupAddress,
        destinationAddress: form.destinationAddress,
        distanceKm: parseFloat(form.distanceKm) || 0,
        movingDate: form.movingDate,
        movingTime: form.movingTime,
        floorFrom: parseInt(form.floorFrom) || 0,
        floorTo: parseInt(form.floorTo) || 0,
        hasElevator: form.hasElevator,
        note: form.note,
        basePriceSnapshot: price.base,
        distancePriceSnapshot: price.distPrice,
        extraFeeSnapshot: price.floorFee,
        finalPrice: price.total
      };

      await movingServiceAPI.createBooking(bookingData);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('Có lỗi xảy ra khi đặt dịch vụ. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "10px 12px", borderRadius: 6,
    border: `1px solid ${T.border}`, fontSize: 14, color: T.text,
    outline: "none", boxSizing: "border-box", background: T.white,
    transition: `border-color ${T.motion} ease`,
  };

  const labelStyle = { fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 6, display: "block" };

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1000, backdropFilter: "blur(2px)" }} />
      <div style={{
        position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 1001, padding: 16,
      }}>
        <div style={{
          background: T.white, borderRadius: 12, width: "min(700px, 100%)",
          maxHeight: "92vh", overflow: "hidden", display: "flex", flexDirection: "column",
          boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
          animation: "popIn 0.22s cubic-bezier(0.34,1.56,0.64,1)",
        }}>
          {/* Modal header */}
          <div style={{ padding: "18px 24px", borderBottom: `1px solid ${T.border}`, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: T.text }}>{service.Name}</div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>Đặt dịch vụ chuyển nhà</div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: T.muted }}>✕</button>
          </div>

          {/* Step tabs */}
          <div style={{ padding: "14px 24px", borderBottom: `1px solid ${T.border}`, overflowX: "auto" }}>
            <div style={{ display: "flex", gap: 0, minWidth: "max-content" }}>
              {STEPS.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center" }}>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "4px 10px", borderRadius: 6,
                    background: i === step ? T.blueLt : "transparent",
                    color: i < step ? T.green : i === step ? T.blue : T.muted,
                    fontSize: 12, fontWeight: i === step ? 700 : 500,
                  }}>
                    <span style={{
                      width: 20, height: 20, borderRadius: "50%", display: "flex",
                      alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700,
                      background: i < step ? T.green : i === step ? T.blue : T.border,
                      color: i <= step ? T.white : T.muted,
                    }}>
                      {i < step ? "✓" : i + 1}
                    </span>
                    {s}
                  </div>
                  {i < STEPS.length - 1 && <div style={{ width: 20, height: 1, background: T.border, margin: "0 2px" }} />}
                </div>
              ))}
            </div>
          </div>

          {/* Two-column layout: form + price summary */}
          <div style={{ display: "flex", flex: 1, overflow: "hidden", minHeight: 0 }}>
            {/* Form area */}
            <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
              {/* STEP 0: Addresses */}
              {step === 0 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: T.text }}>Địa điểm chuyển</h3>
                  <div>
                    <label style={labelStyle}>📍 Địa chỉ lấy đồ</label>
                    <input
                      style={inputStyle} placeholder="Nhập địa chỉ điểm đi..."
                      value={form.pickupAddress}
                      onChange={e => upd("pickupAddress", e.target.value)}
                      onFocus={e => { e.target.style.borderColor = T.blue; }}
                      onBlur={e => { e.target.style.borderColor = T.border; }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>🏁 Địa chỉ giao đồ</label>
                    <input
                      style={inputStyle} placeholder="Nhập địa chỉ điểm đến..."
                      value={form.destinationAddress}
                      onChange={e => upd("destinationAddress", e.target.value)}
                      onFocus={e => { e.target.style.borderColor = T.blue; }}
                      onBlur={e => { e.target.style.borderColor = T.border; }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>📏 Khoảng cách ước tính (km)</label>
                    <input
                      style={inputStyle} type="number" placeholder="Ví dụ: 8.5"
                      value={form.distanceKm}
                      onChange={e => upd("distanceKm", e.target.value)}
                      onFocus={e => { e.target.style.borderColor = T.blue; }}
                      onBlur={e => { e.target.style.borderColor = T.border; }}
                    />
                    <p style={{ fontSize: 12, color: T.muted, marginTop: 4 }}>Miễn phí {service.FreeDistanceKm}km đầu tiên</p>
                  </div>
                </div>
              )}

              {/* STEP 1: Date/Time */}
              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: T.text }}>Thời gian chuyển</h3>
                  <div>
                    <label style={labelStyle}>📅 Ngày chuyển</label>
                    <input
                      type="date" style={inputStyle}
                      min={new Date().toISOString().split("T")[0]}
                      value={form.movingDate}
                      onChange={e => upd("movingDate", e.target.value)}
                      onFocus={e => { e.target.style.borderColor = T.blue; }}
                      onBlur={e => { e.target.style.borderColor = T.border; }}
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>⏰ Giờ chuyển</label>
                    <select
                      style={{ ...inputStyle, cursor: "pointer" }}
                      value={form.movingTime}
                      onChange={e => upd("movingTime", e.target.value)}
                    >
                      <option value="">-- Chọn khung giờ --</option>
                      {["07:00", "08:00", "09:00", "10:00", "13:00", "14:00", "15:00", "16:00"].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* STEP 2: Floor/Details */}
              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: T.text }}>Thông tin thêm</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div>
                      <label style={labelStyle}>🏢 Tầng điểm đi</label>
                      <input type="number" min="0" max="50" style={inputStyle} value={form.floorFrom}
                        onChange={e => upd("floorFrom", e.target.value)}
                        onFocus={e => { e.target.style.borderColor = T.blue; }}
                        onBlur={e => { e.target.style.borderColor = T.border; }}
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>🏢 Tầng điểm đến</label>
                      <input type="number" min="0" max="50" style={inputStyle} value={form.floorTo}
                        onChange={e => upd("floorTo", e.target.value)}
                        onFocus={e => { e.target.style.borderColor = T.blue; }}
                        onBlur={e => { e.target.style.borderColor = T.border; }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                      <input type="checkbox" checked={form.hasElevator} onChange={e => upd("hasElevator", e.target.checked)}
                        style={{ width: 16, height: 16, accentColor: T.blue }}
                      />
                      <span style={{ fontSize: 14, color: T.text }}>🛗 Có thang máy (miễn phụ phí tầng)</span>
                    </label>
                  </div>
                  <div>
                    <label style={labelStyle}>📝 Ghi chú (tùy chọn)</label>
                    <textarea
                      style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
                      placeholder="Đồ dễ vỡ, thời điểm cần giao, lưu ý đặc biệt..."
                      value={form.note}
                      onChange={e => upd("note", e.target.value)}
                      onFocus={e => { e.target.style.borderColor = T.blue; }}
                      onBlur={e => { e.target.style.borderColor = T.border; }}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: Price review */}
              {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <h3 style={{ margin: "0 0 4px", fontSize: 15, fontWeight: 700, color: T.text }}>Xem lại chi phí</h3>
                  <div style={{ background: "#f8fafc", border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden" }}>
                    {[
                      { label: "Giá cơ bản", value: `${fmt(price.base)}đ` },
                      { label: `Phụ phí quãng đường${form.distanceKm ? ` (${Math.max(0, parseFloat(form.distanceKm) - service.FreeDistanceKm).toFixed(1)}km)` : ""}`, value: `${fmt(price.distPrice)}đ` },
                      { label: "Phụ phí tầng", value: `${fmt(price.floorFee)}đ` },
                    ].map((row, i) => (
                      <div key={i} style={{ padding: "12px 16px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontSize: 13, color: T.muted }}>{row.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{row.value}</span>
                      </div>
                    ))}
                    <div style={{ padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: T.blueLt }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: T.blue }}>Tổng ước tính</span>
                      <span style={{ fontSize: 20, fontWeight: 800, color: T.blue }}>{fmt(price.total)}đ</span>
                    </div>
                  </div>
                  <div style={{ padding: 12, borderRadius: 6, background: "#fffbea", border: "1px solid #febb0233", fontSize: 12, color: "#a16100" }}>
                    💡 Giá cuối cùng có thể thay đổi dựa trên khoảng cách thực tế và tình trạng đồ đạc.
                  </div>

                  {/* Summary */}
                  <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, padding: 16 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}>Tóm tắt đặt dịch vụ</div>
                    {[
                      { icon: "📍", label: form.pickupAddress },
                      { icon: "🏁", label: form.destinationAddress },
                      { icon: "📅", label: `${form.movingDate} lúc ${form.movingTime}` },
                    ].filter(r => r.label).map((r, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, padding: "5px 0", fontSize: 13, color: T.text, borderBottom: i < 2 ? `1px solid ${T.border}` : "none" }}>
                        <span>{r.icon}</span>
                        <span style={{ wordBreak: "break-word" }}>{r.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: Confirm */}
              {step === 4 && (
                <div style={{ textAlign: "center", padding: "16px 0" }}>
                  <div style={{ fontSize: 56, marginBottom: 16 }}>🎉</div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: "0 0 8px" }}>Xác nhận đặt dịch vụ</h3>
                  <p style={{ fontSize: 14, color: T.muted, marginBottom: 20 }}>
                    Nhấn xác nhận để hoàn tất. Chúng tôi sẽ liên hệ trong vòng 30 phút.
                  </p>
                  <div style={{ background: T.blueLt, border: `1px solid ${T.blue}22`, borderRadius: 8, padding: "16px", display: "inline-block", textAlign: "left", minWidth: 240 }}>
                    <div style={{ fontSize: 12, color: T.muted, marginBottom: 6 }}>Tổng thanh toán</div>
                    <div style={{ fontSize: 28, fontWeight: 800, color: T.blue }}>{fmt(price.total)}đ</div>
                  </div>
                </div>
              )}
            </div>

            {/* Right sticky price panel */}
            <div style={{
              width: 220, flexShrink: 0, padding: "24px 18px",
              borderLeft: `1px solid ${T.border}`,
              background: "#fafbfc", display: "flex", flexDirection: "column", gap: 10,
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase" }}>Tóm tắt giá</div>
              {[
                { label: "Giá cơ bản", value: fmt(price.base) + "đ" },
                { label: "Phụ phí đường", value: "+" + fmt(price.distPrice) + "đ" },
                { label: "Phụ phí tầng", value: "+" + fmt(price.floorFee) + "đ" },
              ].map((r, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, padding: "4px 0", borderBottom: `1px solid ${T.border}` }}>
                  <span style={{ color: T.muted }}>{r.label}</span>
                  <span style={{ fontWeight: 600, color: T.text }}>{r.value}</span>
                </div>
              ))}
              <div style={{ paddingTop: 8, borderTop: `2px solid ${T.blue}` }}>
                <div style={{ fontSize: 11, color: T.muted }}>Tổng ước tính</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: T.blue }}>{fmt(price.total)}đ</div>
              </div>
              <div style={{ marginTop: 8, padding: 10, borderRadius: 6, background: T.greenLt, fontSize: 11, color: T.green, fontWeight: 500 }}>
                ✓ Bảo hiểm hàng hóa<br />✓ Thanh toán sau khi nhận
              </div>
            </div>
          </div>

          {/* Footer nav */}
          <div style={{ padding: "16px 24px", borderTop: `1px solid ${T.border}`, display: "flex", gap: 10 }}>
            {step > 0 && (
              <button
                onClick={() => setStep(s => s - 1)}
                style={{
                  flex: 1, padding: "11px", borderRadius: 6,
                  border: `1px solid ${T.border}`, background: T.white,
                  color: T.text, fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}
              >
                ← Quay lại
              </button>
            )}
            <button
              disabled={!canNext() || submitting}
              onClick={() => {
                if (step === 4) { 
                  handleSubmitBooking();
                }
                else setStep(s => s + 1);
              }}
              style={{
                flex: 2, padding: "11px", borderRadius: 6,
                border: "none",
                background: (canNext() && !submitting) ? T.blue : T.border,
                color: (canNext() && !submitting) ? T.white : T.muted,
                fontSize: 14, fontWeight: 700,
                cursor: (canNext() && !submitting) ? "pointer" : "not-allowed",
                transition: `all ${T.motion} ease`,
              }}
            >
              {submitting ? 'Đang xử lý...' : step === 4 ? "✓ Xác nhận đặt dịch vụ" : "Tiếp theo →"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// ─── Booking History ──────────────────────────────────────────────────────────
const BookingHistory = ({ bookings }) => {
  const [expanded, setExpanded] = useState(null);
  const fmt = (n) => n.toLocaleString("vi-VN");

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 700, color: T.muted, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 14 }}>
        Lịch sử đặt dịch vụ ({bookings.length})
      </div>
      {bookings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "40px 20px", color: T.muted, fontSize: 14, background: T.white, borderRadius: 8, border: `1px solid ${T.border}` }}>
          Bạn chưa có lịch sử đặt dịch vụ
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {bookings.map(b => (
            <div key={b.BookingID} style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden" }}>
              <div
                onClick={() => setExpanded(expanded === b.BookingID ? null : b.BookingID)}
                style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, cursor: "pointer" }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 3 }}>{b.ServiceName}</div>
                  <div style={{ fontSize: 12, color: T.muted }}>
                    {b.MovingDate} lúc {b.MovingTime} · #{b.BookingID}
                  </div>
                </div>
                <StatusBadge status={b.Status} />
                <div style={{ fontSize: 15, fontWeight: 800, color: T.blue, whiteSpace: "nowrap" }}>
                  {fmt(b.FinalPrice)}đ
                </div>
                <span style={{ color: T.muted, fontSize: 12 }}>{expanded === b.BookingID ? "▲" : "▼"}</span>
              </div>
              {expanded === b.BookingID && (
                <div style={{ padding: "0 18px 16px", borderTop: `1px solid ${T.border}`, paddingTop: 14 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      { icon: "📍", label: "Điểm đi", value: b.PickupAddress },
                      { icon: "🏁", label: "Điểm đến", value: b.DestinationAddress },
                      { icon: "📏", label: "Khoảng cách", value: `${b.DistanceKm}km` },
                    ].map((r, i) => (
                      <div key={i} style={{ display: "flex", gap: 8, fontSize: 13 }}>
                        <span style={{ fontSize: 14 }}>{r.icon}</span>
                        <span style={{ color: T.muted, minWidth: 80 }}>{r.label}:</span>
                        <span style={{ color: T.text, fontWeight: 500 }}>{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Skeleton Loader ──────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div style={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 8, overflow: "hidden" }}>
    {[{ h: 80, mb: 0 }, { h: 60, mb: 0 }, { h: 100, mb: 0 }, { h: 48, mb: 0 }].map((s, i) => (
      <div key={i} style={{ height: s.h, background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)", backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite", borderBottom: `1px solid ${T.border}` }} />
    ))}
  </div>
);

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function MovingServicePage() {
  useScrollToTop()
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeCategory, setActiveCategory] = useState("all");
  const [categories, setCategories] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailService, setDetailService] = useState(null);
  const [bookingService, setBookingService] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("services");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [myServices, setMyServices] = useState([]);
  const [loadingMyServices, setLoadingMyServices] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesRes, servicesRes] = await Promise.all([
          movingServiceAPI.getCategories(),
          movingServiceAPI.getServices()
        ]);
        
        const allCategory = { CategoryID: "all", Name: "Tất cả", Icon: "" };
        setCategories([allCategory, ...(categoriesRes.data || [])]);
        
        // Kết hợp dữ liệu từ API với mock data
        const apiServices = servicesRes.data || [];
        const combinedServices = [...SERVICES, ...apiServices];
        setServices(combinedServices);
      } catch (error) {
        console.error('Error fetching data:', error);
        // Nếu API lỗi, vẫn hiển thị mock data
        const allCategory = { CategoryID: "all", Name: "Tất cả", Icon: "" };
        setCategories([allCategory]);
        setServices(SERVICES);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch bookings khi chuyển sang tab history
  useEffect(() => {
    const fetchBookings = async () => {
      if (activeTab === "history" && user && user.role !== 'Provider') {
        try {
          setLoadingBookings(true);
          const response = await movingServiceAPI.getBookings();
          setBookings(response.data || []);
        } catch (error) {
          console.error('Error fetching bookings:', error);
          setBookings([]);
        } finally {
          setLoadingBookings(false);
        }
      }
    };
    fetchBookings();
  }, [activeTab, user, showSuccess]);

  // Fetch my services khi Provider chuyển sang tab myservices
  useEffect(() => {
    const fetchMyServices = async () => {
      if (activeTab === "myservices" && user && user.role === 'Provider') {
        try {
          setLoadingMyServices(true);
          const response = await movingServiceAPI.getProviderServices();
          setMyServices(response.data || []);
        } catch (error) {
          console.error('Error fetching my services:', error);
          setMyServices([]);
        } finally {
          setLoadingMyServices(false);
        }
      }
    };
    fetchMyServices();
  }, [activeTab, user]);

  const filteredServices = activeCategory === "all"
    ? services
    : services.filter(s => s.CategoryID === activeCategory);

  const handleBook = (service) => {
    // Chặn Provider khỏi đặt dịch vụ
    if (user?.role === 'Provider') {
      alert('Nhà cung cấp không thể đặt dịch vụ. Vui lòng sử dụng tài khoản Tenant.');
      return;
    }
    // Kiểm tra đăng nhập
    if (!user) {
      alert('Vui lòng đăng nhập để đặt dịch vụ');
      navigate('/login');
      return;
    }
    setDetailService(null);
    setBookingService(service);
  };

  return (
    <div style={{ background: T.bg, minHeight: "100vh", fontFamily: 'BlinkMacSystemFont, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
      <style>{`
        @keyframes shimmer { from { background-position: -200% 0; } to { background-position: 200% 0; } }
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes slideIn { from { transform: translateX(100%) } to { transform: translateX(0) } }
        @keyframes popIn { from { opacity: 0; transform: scale(0.94) translateY(8px) } to { opacity: 1; transform: scale(1) translateY(0) } }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: ${T.bg}; }
        ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
      `}</style>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 20px" }}>

        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: T.text, margin: "0 0 6px", letterSpacing: "-0.3px" }}>
                Dịch vụ chuyển nhà
              </h1>
              <p style={{ fontSize: 13, color: T.muted, margin: 0 }}>
                Đặt dịch vụ chuyển phòng / chuyển nhà ngay trong vài phút
              </p>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {user?.role === 'Provider' ? (
                /* Hiển thị 2 tab cho Provider: Tất cả dịch vụ và Dịch vụ của tôi */
                <>
                  <button
                    onClick={() => setActiveTab("services")}
                    style={{
                      padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer",
                      border: `1px solid ${activeTab === "services" ? T.blue : T.border}`,
                      background: activeTab === "services" ? T.blueLt : T.white,
                      color: activeTab === "services" ? T.blue : T.text,
                      transition: `all ${T.motion} ease`,
                    }}
                  >
                    Tất cả dịch vụ
                  </button>
                  <button
                    onClick={() => setActiveTab("myservices")}
                    style={{
                      padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer",
                      border: `1px solid ${activeTab === "myservices" ? T.blue : T.border}`,
                      background: activeTab === "myservices" ? T.blueLt : T.white,
                      color: activeTab === "myservices" ? T.blue : T.text,
                      transition: `all ${T.motion} ease`,
                    }}
                  >
                    Dịch vụ của tôi
                  </button>
                  <button
                    onClick={() => navigate('/provider/dashboard')}
                    style={{
                      padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer",
                      border: `1px solid ${T.blue}`,
                      background: T.blue,
                      color: T.white,
                      transition: `all ${T.motion} ease`,
                    }}
                    onMouseEnter={e => { e.target.style.background = T.blueDk; }}
                    onMouseLeave={e => { e.target.style.background = T.blue; }}
                  >
                    Quản lý
                  </button>
                </>
              ) : (
                /* Hiển thị tab Dịch vụ và Lịch sử cho Tenant */
                <>
                  <button
                    onClick={() => setActiveTab("services")}
                    style={{
                      padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer",
                      border: `1px solid ${activeTab === "services" ? T.blue : T.border}`,
                      background: activeTab === "services" ? T.blueLt : T.white,
                      color: activeTab === "services" ? T.blue : T.text,
                      transition: `all ${T.motion} ease`,
                    }}
                  >
                    Dịch vụ
                  </button>
                  <button
                    onClick={() => setActiveTab("history")}
                    style={{
                      padding: "8px 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer",
                      border: `1px solid ${activeTab === "history" ? T.blue : T.border}`,
                      background: activeTab === "history" ? T.blueLt : T.white,
                      color: activeTab === "history" ? T.blue : T.text,
                      transition: `all ${T.motion} ease`,
                    }}
                  >
                    Lịch sử {user && bookings.length > 0 ? `(${bookings.length})` : ''}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* ── Services Tab ─────────────────────────────────────────────── */}
        {activeTab === "services" && (
          <>
            {/* Category Filter */}
            <div style={{
              background: T.white, border: `1px solid ${T.border}`,
              borderRadius: 8, padding: "4px", display: "flex",
              gap: 4, marginBottom: 20, overflowX: "auto",
              boxShadow: T.shadow1, justifyContent: "center",
            }}>
              {categories.map(cat => (
                <button
                  key={cat.CategoryID}
                  onClick={() => setActiveCategory(cat.CategoryID)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 16px", borderRadius: 6, border: "none",
                    background: activeCategory === cat.CategoryID ? T.blue : "transparent",
                    color: activeCategory === cat.CategoryID ? T.white : T.muted,
                    fontSize: 13, fontWeight: activeCategory === cat.CategoryID ? 700 : 500,
                    cursor: "pointer", whiteSpace: "nowrap", flexShrink: 0,
                    transition: `all ${T.motion} ease`,
                  }}
                >
                  <span style={{ fontSize: 15 }}>{cat.Icon}</span>
                  {cat.Name}
                </button>
              ))}
            </div>

            {/* Service count */}
            <div style={{ fontSize: 13, color: T.muted, marginBottom: 14 }}>
              Tìm thấy <strong style={{ color: T.text }}>{filteredServices.length}</strong> gói dịch vụ
            </div>

            {/* Grid */}
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: 16, marginBottom: 32,
            }}>
              {loading
                ? [1, 2, 3].map(i => <SkeletonCard key={i} />)
                : filteredServices.map(svc => (
                    <ServiceCard
                      key={svc.ServiceID}
                      service={svc}
                      onViewDetail={setDetailService}
                      onBook={handleBook}
                      userRole={user?.role}
                    />
                  ))
              }
            </div>

            {/* Empty state */}
            {!loading && filteredServices.length === 0 && (
              <div style={{ textAlign: "center", padding: "60px 20px", color: T.muted }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Không có dịch vụ nào</div>
                <div style={{ fontSize: 13 }}>Hãy thử danh mục khác</div>
              </div>
            )}
          </>
        )}

        {/* ── History Tab ──────────────────────────────────────────────── */}
        {activeTab === "history" && user?.role !== 'Provider' && (
          loadingBookings ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔄</div>
              <div style={{ fontSize: 14, color: T.muted }}>Đang tải lịch sử...</div>
            </div>
          ) : !user ? (
            <div style={{ textAlign: "center", padding: "60px 20px", background: T.white, borderRadius: 8, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔒</div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: T.text }}>Vui lòng đăng nhập</div>
              <div style={{ fontSize: 13, color: T.muted, marginBottom: 20 }}>Đăng nhập để xem lịch sử đặt dịch vụ của bạn</div>
              <button
                onClick={() => navigate('/login')}
                style={{
                  padding: "10px 24px", borderRadius: 6, fontSize: 14, fontWeight: 600,
                  border: "none", background: T.blue, color: T.white, cursor: "pointer",
                  transition: `all ${T.motion} ease`,
                }}
                onMouseEnter={e => { e.target.style.background = T.blueDk; }}
                onMouseLeave={e => { e.target.style.background = T.blue; }}
              >
                Đăng nhập ngay
              </button>
            </div>
          ) : (
            <BookingHistory bookings={bookings} />
          )
        )}

        {/* ── My Services Tab (Provider only) ──────────────────────────── */}
        {activeTab === "myservices" && user?.role === 'Provider' && (
          loadingMyServices ? (
            <div style={{ textAlign: "center", padding: "60px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔄</div>
              <div style={{ fontSize: 14, color: T.muted }}>Đang tải dịch vụ của bạn...</div>
            </div>
          ) : (
            <>
              {/* Service count */}
              <div style={{ fontSize: 13, color: T.muted, marginBottom: 14 }}>
                Bạn có <strong style={{ color: T.text }}>{myServices.length}</strong> dịch vụ
              </div>

              {/* Grid */}
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: 16, marginBottom: 32,
              }}>
                {myServices.map(svc => (
                  <ServiceCard
                    key={svc.ServiceID}
                    service={svc}
                    onViewDetail={setDetailService}
                    onBook={handleBook}
                    userRole={user?.role}
                  />
                ))}
              </div>

              {/* Empty state */}
              {myServices.length === 0 && (
                <div style={{ textAlign: "center", padding: "60px 20px", color: T.muted, background: T.white, borderRadius: 8, border: `1px solid ${T.border}` }}>
                  <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
                  <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>Chưa có dịch vụ nào</div>
                  <div style={{ fontSize: 13, marginBottom: 20 }}>Bạn chưa tạo dịch vụ chuyển nhà nào</div>
                  <button
                    onClick={() => navigate('/provider/dashboard')}
                    style={{
                      padding: "10px 24px", borderRadius: 6, fontSize: 14, fontWeight: 600,
                      border: "none", background: T.blue, color: T.white, cursor: "pointer",
                      transition: `all ${T.motion} ease`,
                    }}
                    onMouseEnter={e => { e.target.style.background = T.blueDk; }}
                    onMouseLeave={e => { e.target.style.background = T.blue; }}
                  >
                    Tạo dịch vụ đầu tiên
                  </button>
                </div>
              )}
            </>
          )
        )}
      </div>

      {/* ── Detail Drawer ─────────────────────────────────────────────── */}
      {detailService && (
        <DetailDrawer
          service={detailService}
          onClose={() => setDetailService(null)}
          onBook={handleBook}
          userRole={user?.role}
        />
      )}

      {/* ── Booking Wizard ────────────────────────────────────────────── */}
      {bookingService && (
        <BookingWizard
          service={bookingService}
          onClose={() => setBookingService(null)}
          onSuccess={() => setShowSuccess(true)}
        />
      )}

      {/* ── Success Toast ─────────────────────────────────────────────── */}
      {showSuccess && (
        <div
          style={{
            position: "fixed", bottom: 24, right: 24, zIndex: 2000,
            background: T.green, color: T.white,
            padding: "14px 20px", borderRadius: 8, fontSize: 14, fontWeight: 600,
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            display: "flex", alignItems: "center", gap: 10,
            animation: "popIn 0.3s ease",
          }}
        >
          <span style={{ fontSize: 18 }}>✓</span>
          Đặt dịch vụ thành công! Chúng tôi sẽ liên hệ sớm.
          <button
            onClick={() => setShowSuccess(false)}
            style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 16, marginLeft: 8 }}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── Login Modal ────────────────────────────────────────────────── */}
      {showLoginModal && (
        <>
          <div
            onClick={() => setShowLoginModal(false)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)",
              zIndex: 1000, backdropFilter: "blur(2px)",
              animation: "fadeIn 0.2s ease",
            }}
          />
          <div style={{
            position: "fixed", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 1001, padding: 16,
          }}>
            <div style={{
              background: T.white, borderRadius: 12, width: "min(500px, 100%)",
              padding: 40, textAlign: "center",
              boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
              animation: "popIn 0.22s cubic-bezier(0.34,1.56,0.64,1)",
            }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>🏢</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: T.text, margin: "0 0 12px" }}>
                Bạn muốn thêm dịch vụ?
              </h2>
              <p style={{ fontSize: 14, color: T.muted, margin: "0 0 24px", lineHeight: 1.6 }}>
                Để thêm dịch vụ chuyển nhà của bạn, vui lòng đăng nhập hoặc tạo tài khoản nhà cung cấp dịch vụ.
              </p>
              <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                <button
                  onClick={() => setShowLoginModal(false)}
                  style={{
                    padding: "12px 24px", borderRadius: 6, fontSize: 14, fontWeight: 600,
                    border: `1px solid ${T.border}`, background: T.white,
                    color: T.text, cursor: "pointer",
                    transition: `all ${T.motion} ease`,
                  }}
                  onMouseEnter={e => { e.target.style.borderColor = T.blue; e.target.style.color = T.blue; }}
                  onMouseLeave={e => { e.target.style.borderColor = T.border; e.target.style.color = T.text; }}
                >
                  Hủy
                </button>
                <button
                  onClick={() => navigate('/login')}
                  style={{
                    padding: "12px 24px", borderRadius: 6, fontSize: 14, fontWeight: 600,
                    border: "none", background: T.blue,
                    color: T.white, cursor: "pointer",
                    transition: `all ${T.motion} ease`,
                  }}
                  onMouseEnter={e => { e.target.style.background = T.blueDk; }}
                  onMouseLeave={e => { e.target.style.background = T.blue; }}
                >
                  Đăng nhập / Đăng ký
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}