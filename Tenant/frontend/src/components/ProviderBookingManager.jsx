import { useState, useEffect } from 'react';
import { movingServiceAPI } from '../services/movingServiceAPI';

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
  orange: "#ff6b35",
  orangeLt: "#fff4f0",
  shadow1: "rgba(26,26,26,0.16) 0px 2px 8px 0px",
  motion: "120ms",
};

const StatusBadge = ({ status }) => {
  const config = {
    pending: { bg: T.orangeLt, color: T.orange, label: "Chờ xác nhận", icon: "⏳" },
    confirmed: { bg: T.blueLt, color: T.blue, label: "Đã xác nhận", icon: "✓" },
    moving: { bg: "#f0e6ff", color: "#6a1b9a", label: "Đang chuyển", icon: "🚚" },
    completed: { bg: T.greenLt, color: T.green, label: "Hoàn thành", icon: "✓" },
    cancelled: { bg: T.redLt, color: T.red, label: "Đã hủy", icon: "✕" },
  };
  const c = config[status] || config.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6,
      padding: "4px 12px", borderRadius: 6,
      background: c.bg, color: c.color,
      fontSize: 13, fontWeight: 700,
    }}>
      <span>{c.icon}</span>
      {c.label}
    </span>
  );
};

const BookingCard = ({ booking, onConfirm, onReject, onComplete }) => {
  const [expanded, setExpanded] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const fmt = (n) => n?.toLocaleString("vi-VN") || '0';

  const handleConfirm = async () => {
    if (!window.confirm('Xác nhận đơn đặt dịch vụ này?')) return;
    setProcessing(true);
    try {
      await onConfirm(booking.BookingID);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert('Vui lòng nhập lý do từ chối');
      return;
    }
    setProcessing(true);
    try {
      await onReject(booking.BookingID, rejectReason);
      setShowRejectModal(false);
      setRejectReason('');
    } finally {
      setProcessing(false);
    }
  };

  const handleComplete = async () => {
    if (!window.confirm('Đánh dấu đơn này đã hoàn thành?')) return;
    setProcessing(true);
    try {
      await onComplete(booking.BookingID);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div style={{
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        overflow: "hidden",
        marginBottom: 12,
      }}>
        {/* Header */}
        <div
          onClick={() => setExpanded(!expanded)}
          style={{
            padding: "16px 20px",
            display: "flex",
            alignItems: "center",
            gap: 14,
            cursor: "pointer",
            borderBottom: expanded ? `1px solid ${T.border}` : "none",
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 16, fontWeight: 700, color: T.text }}>
                #{booking.BookingID}
              </span>
              <StatusBadge status={booking.Status} />
            </div>
            <div style={{ fontSize: 13, color: T.muted }}>
              {booking.ServiceName} • {booking.MovingDate} lúc {booking.MovingTime}
            </div>
            <div style={{ fontSize: 13, color: T.text, marginTop: 4 }}>
              👤 {booking.TenantName} • 📞 {booking.TenantPhone}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 18, fontWeight: 800, color: T.blue }}>
              {fmt(booking.FinalPrice)}đ
            </div>
            <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
              {expanded ? "▲" : "▼"} Chi tiết
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div style={{ padding: "16px 20px" }}>
            {/* Địa chỉ */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                Thông tin chuyển
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", gap: 8, fontSize: 13 }}>
                  <span style={{ fontSize: 14 }}>📍</span>
                  <span style={{ color: T.muted, minWidth: 80 }}>Điểm đi:</span>
                  <span style={{ color: T.text, fontWeight: 500 }}>{booking.PickupAddress}</span>
                </div>
                <div style={{ display: "flex", gap: 8, fontSize: 13 }}>
                  <span style={{ fontSize: 14 }}>🏁</span>
                  <span style={{ color: T.muted, minWidth: 80 }}>Điểm đến:</span>
                  <span style={{ color: T.text, fontWeight: 500 }}>{booking.DestinationAddress}</span>
                </div>
                <div style={{ display: "flex", gap: 8, fontSize: 13 }}>
                  <span style={{ fontSize: 14 }}>📏</span>
                  <span style={{ color: T.muted, minWidth: 80 }}>Khoảng cách:</span>
                  <span style={{ color: T.text, fontWeight: 500 }}>{booking.DistanceKm}km</span>
                </div>
                <div style={{ display: "flex", gap: 8, fontSize: 13 }}>
                  <span style={{ fontSize: 14 }}>🏢</span>
                  <span style={{ color: T.muted, minWidth: 80 }}>Tầng:</span>
                  <span style={{ color: T.text, fontWeight: 500 }}>
                    Từ tầng {booking.FloorFrom} đến tầng {booking.FloorTo}
                    {booking.HasElevator ? " (Có thang máy)" : " (Không có thang máy)"}
                  </span>
                </div>
              </div>
            </div>

            {/* Ghi chú */}
            {booking.Note && (
              <div style={{ marginBottom: 16, padding: 12, background: T.blueLt, borderRadius: 6 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: T.blue, marginBottom: 4 }}>
                  📝 Ghi chú từ khách hàng:
                </div>
                <div style={{ fontSize: 13, color: T.text }}>{booking.Note}</div>
              </div>
            )}

            {/* Chi phí */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: T.muted, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                Chi phí
              </div>
              <div style={{ background: "#f8fafc", border: `1px solid ${T.border}`, borderRadius: 6, overflow: "hidden" }}>
                {[
                  { label: "Giá cơ bản", value: `${fmt(booking.BasePriceSnapshot)}đ` },
                  { label: "Phụ phí quãng đường", value: `${fmt(booking.DistancePriceSnapshot)}đ` },
                  { label: "Phụ phí khác", value: `${fmt(booking.ExtraFeeSnapshot)}đ` },
                ].map((row, i) => (
                  <div key={i} style={{ padding: "10px 14px", borderBottom: `1px solid ${T.border}`, display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 13, color: T.muted }}>{row.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{row.value}</span>
                  </div>
                ))}
                <div style={{ padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", background: T.blueLt }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: T.blue }}>Tổng cộng</span>
                  <span style={{ fontSize: 18, fontWeight: 800, color: T.blue }}>{fmt(booking.FinalPrice)}đ</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {booking.Status === 'pending' && (
                <>
                  <button
                    onClick={handleConfirm}
                    disabled={processing}
                    style={{
                      flex: 1,
                      padding: "10px 16px",
                      borderRadius: 6,
                      border: "none",
                      background: T.green,
                      color: T.white,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: processing ? "not-allowed" : "pointer",
                      opacity: processing ? 0.6 : 1,
                      transition: `all ${T.motion} ease`,
                    }}
                    onMouseEnter={e => !processing && (e.target.style.background = "#006622")}
                    onMouseLeave={e => !processing && (e.target.style.background = T.green)}
                  >
                    ✓ Xác nhận đơn
                  </button>
                  <button
                    onClick={() => setShowRejectModal(true)}
                    disabled={processing}
                    style={{
                      flex: 1,
                      padding: "10px 16px",
                      borderRadius: 6,
                      border: `1px solid ${T.red}`,
                      background: T.white,
                      color: T.red,
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: processing ? "not-allowed" : "pointer",
                      opacity: processing ? 0.6 : 1,
                      transition: `all ${T.motion} ease`,
                    }}
                    onMouseEnter={e => !processing && (e.target.style.background = T.redLt)}
                    onMouseLeave={e => !processing && (e.target.style.background = T.white)}
                  >
                    ✕ Từ chối
                  </button>
                </>
              )}
              {(booking.Status === 'confirmed' || booking.Status === 'moving') && (
                <button
                  onClick={handleComplete}
                  disabled={processing}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    borderRadius: 6,
                    border: "none",
                    background: T.blue,
                    color: T.white,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: processing ? "not-allowed" : "pointer",
                    opacity: processing ? 0.6 : 1,
                    transition: `all ${T.motion} ease`,
                  }}
                  onMouseEnter={e => !processing && (e.target.style.background = T.blueDk)}
                  onMouseLeave={e => !processing && (e.target.style.background = T.blue)}
                >
                  ✓ Hoàn thành
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <>
          <div
            onClick={() => setShowRejectModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.4)",
              zIndex: 1000,
              backdropFilter: "blur(2px)",
            }}
          />
          <div style={{
            position: "fixed",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1001,
            padding: 16,
          }}>
            <div style={{
              background: T.white,
              borderRadius: 12,
              width: "min(500px, 100%)",
              padding: 24,
              boxShadow: "0 24px 80px rgba(0,0,0,0.2)",
            }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: T.text, margin: "0 0 16px" }}>
                Từ chối đơn đặt dịch vụ
              </h3>
              <p style={{ fontSize: 14, color: T.muted, margin: "0 0 16px" }}>
                Vui lòng nhập lý do từ chối để khách hàng biết:
              </p>
              <textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Ví dụ: Không đủ nhân viên trong ngày này, lịch đã kín..."
                style={{
                  width: "100%",
                  minHeight: 100,
                  padding: "10px 12px",
                  borderRadius: 6,
                  border: `1px solid ${T.border}`,
                  fontSize: 14,
                  color: T.text,
                  outline: "none",
                  boxSizing: "border-box",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                <button
                  onClick={() => setShowRejectModal(false)}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 6,
                    border: `1px solid ${T.border}`,
                    background: T.white,
                    color: T.text,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Hủy
                </button>
                <button
                  onClick={handleReject}
                  disabled={processing || !rejectReason.trim()}
                  style={{
                    flex: 1,
                    padding: "10px",
                    borderRadius: 6,
                    border: "none",
                    background: processing || !rejectReason.trim() ? T.border : T.red,
                    color: T.white,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: processing || !rejectReason.trim() ? "not-allowed" : "pointer",
                  }}
                >
                  {processing ? "Đang xử lý..." : "Xác nhận từ chối"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default function ProviderBookingManager() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await movingServiceAPI.getProviderBookings();
      setBookings(response.data || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      alert('Lỗi khi tải danh sách đơn đặt dịch vụ');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (bookingId) => {
    try {
      await movingServiceAPI.confirmBooking(bookingId);
      alert('Xác nhận đơn thành công!');
      fetchBookings();
    } catch (error) {
      console.error('Error confirming booking:', error);
      alert('Lỗi khi xác nhận đơn');
    }
  };

  const handleReject = async (bookingId, reason) => {
    try {
      await movingServiceAPI.rejectBooking(bookingId, reason);
      alert('Đã từ chối đơn');
      fetchBookings();
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('Lỗi khi từ chối đơn');
    }
  };

  const handleComplete = async (bookingId) => {
    try {
      await movingServiceAPI.completeBooking(bookingId);
      alert('Đã đánh dấu hoàn thành!');
      fetchBookings();
    } catch (error) {
      console.error('Error completing booking:', error);
      alert('Lỗi khi hoàn thành đơn');
    }
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter(b => b.Status === filter);

  const stats = {
    all: bookings.length,
    pending: bookings.filter(b => b.Status === 'pending').length,
    confirmed: bookings.filter(b => b.Status === 'confirmed').length,
    completed: bookings.filter(b => b.Status === 'completed').length,
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔄</div>
        <div style={{ fontSize: 14, color: T.muted }}>Đang tải danh sách đơn...</div>
      </div>
    );
  }

  return (
    <div>
      {/* Filter Tabs */}
      <div style={{
        background: T.white,
        border: `1px solid ${T.border}`,
        borderRadius: 8,
        padding: 4,
        display: "flex",
        gap: 4,
        marginBottom: 20,
        flexWrap: "wrap",
      }}>
        {[
          { key: 'all', label: 'Tất cả', count: stats.all },
          { key: 'pending', label: 'Chờ xác nhận', count: stats.pending },
          { key: 'confirmed', label: 'Đã xác nhận', count: stats.confirmed },
          { key: 'completed', label: 'Hoàn thành', count: stats.completed },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            style={{
              flex: 1,
              minWidth: 120,
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              background: filter === tab.key ? T.blue : "transparent",
              color: filter === tab.key ? T.white : T.muted,
              fontSize: 13,
              fontWeight: filter === tab.key ? 700 : 500,
              cursor: "pointer",
              transition: `all ${T.motion} ease`,
            }}
          >
            {tab.label} {tab.count > 0 && `(${tab.count})`}
          </button>
        ))}
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          background: T.white,
          borderRadius: 8,
          border: `1px solid ${T.border}`,
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6, color: T.text }}>
            Không có đơn nào
          </div>
          <div style={{ fontSize: 13, color: T.muted }}>
            {filter === 'all' ? 'Chưa có đơn đặt dịch vụ nào' : `Không có đơn ở trạng thái này`}
          </div>
        </div>
      ) : (
        <div>
          {filteredBookings.map(booking => (
            <BookingCard
              key={booking.BookingID}
              booking={booking}
              onConfirm={handleConfirm}
              onReject={handleReject}
              onComplete={handleComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
