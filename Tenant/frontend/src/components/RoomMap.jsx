import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Box, Typography } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue with Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const formatPrice = (price) => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;
  if (numPrice >= 1000000) {
    return `${(numPrice / 1000000).toFixed(1)}tr`;
  }
  return `${(numPrice / 1000).toFixed(0)}k`;
};

// Custom marker icon with price
const createPriceIcon = (price) => {
  return L.divIcon({
    className: 'custom-marker-icon',
    html: `
      <div class="marker-price-label">
        ${formatPrice(price)}
      </div>
    `,
    iconSize: [80, 40],
    iconAnchor: [40, 40],
  });
};

// Component to fit map bounds to markers
function MapBounds({ rooms }) {
  const map = useMap();

  useEffect(() => {
    if (rooms && rooms.length > 0) {
      const bounds = L.latLngBounds(
        rooms.map(room => [room.latitude, room.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [rooms, map]);

  return null;
}

const RoomMap = ({ rooms, onMarkerClick }) => {
  if (!rooms || rooms.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100%', 
        backgroundColor: '#e5e5e5',
        color: '#666'
      }}>
        <Typography variant="body2">Không có tọa độ</Typography>
      </Box>
    );
  }

  const center = [
    rooms[0].latitude || 21.028511,
    rooms[0].longitude || 105.804817
  ];

  return (
    <Box sx={{ width: '100%', height: '100%', position: 'relative' }}>
      <MapContainer
        center={center}
        zoom={13}
        style={{ width: '100%', height: '100%', borderRadius: '12px' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapBounds rooms={rooms} />
        
        {rooms.map((room) => (
          <Marker
            key={room.id}
            position={[room.latitude, room.longitude]}
            icon={createPriceIcon(room.price)}
            eventHandlers={{
              click: () => {
                if (onMarkerClick) {
                  onMarkerClick(room);
                }
              },
            }}
          >
            <Popup>
              <Box sx={{ p: 1, minWidth: 150 }}>
                <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', mb: 0.5 }}>
                  {room.title || 'Phòng trọ'}
                </Typography>
                <Typography sx={{ color: '#006ce4', fontWeight: 600, fontSize: '0.813rem', mb: 0.5 }}>
                  {formatPrice(room.price)}đ/tháng
                </Typography>
                <Typography sx={{ color: '#666', fontSize: '0.75rem' }}>
                  ID: {room.id}
                </Typography>
              </Box>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      <style>{`
        .custom-marker-icon {
          background: transparent;
          border: none;
        }
        
        .marker-price-label {
          background: #ffffff;
          color: #222222;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 13px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          border: 1.5px solid #222222;
          white-space: nowrap;
          text-align: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .marker-price-label:hover {
          background: #222222;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
          transform: scale(1.1);
          z-index: 1000 !important;
        }
        
        .leaflet-popup-content-wrapper {
          border-radius: 8px;
          padding: 0;
        }
        
        .leaflet-popup-content {
          margin: 0;
          min-width: 150px;
        }
        
        .leaflet-container {
          font-family: inherit;
        }
      `}</style>
    </Box>
  );
};

export default RoomMap;
