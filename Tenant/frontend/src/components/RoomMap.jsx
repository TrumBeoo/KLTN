import { useEffect, useRef, useState } from 'react';
import { Box } from '@mui/material';

const RoomMap = ({ rooms, onMarkerClick }) => {
  const mapRef = useRef(null);
  const googleMapRef = useRef(null);
  const markersRef = useRef([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const formatPrice = (price) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)}tr`;
    }
    return `${(price / 1000).toFixed(0)}k`;
  };

  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google?.maps) {
        setIsLoaded(true);
        return;
      }

      // Check if script is already being loaded
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        const checkLoaded = setInterval(() => {
          if (window.google?.maps) {
            setIsLoaded(true);
            clearInterval(checkLoaded);
          }
        }, 100);
        return;
      }

      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`;
      script.async = true;
      script.onload = () => setIsLoaded(true);
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (!isLoaded || !mapRef.current || !rooms?.length) return;

    // Initialize map
    const map = new window.google.maps.Map(mapRef.current, {
      zoom: 13,
      center: { lat: rooms[0].latitude, lng: rooms[0].longitude },
      mapId: import.meta.env.VITE_GOOGLE_MAPS_MAP_ID,
      disableDefaultUI: false,
      zoomControl: true,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    });

    googleMapRef.current = map;

    // Clear old markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Create bounds
    const bounds = new window.google.maps.LatLngBounds();

    // Add markers
    rooms.forEach(room => {
      const position = { lat: room.latitude, lng: room.longitude };
      bounds.extend(position);

      // Create custom marker content
      const markerContent = document.createElement('div');
      markerContent.className = 'custom-marker';
      markerContent.innerHTML = `
        <div class="marker-price">${formatPrice(room.price)}</div>
      `;

      const marker = new window.google.maps.marker.AdvancedMarkerElement({
        map,
        position,
        content: markerContent,
      });

      // InfoWindow
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; min-width: 150px;">
            <div style="font-weight: 600; font-size: 14px; margin-bottom: 4px;">${room.title || 'Phòng trọ'}</div>
            <div style="color: #4A90E2; font-weight: 600; font-size: 13px; margin-bottom: 4px;">${formatPrice(room.price)}đ/tháng</div>
            <div style="color: #6a6a6a; font-size: 12px;">ID: ${room.id}</div>
          </div>
        `,
      });

      // Click event
      markerContent.addEventListener('click', () => {
        console.log('Room clicked:', room.id);
        infoWindow.open(map, marker);
        if (onMarkerClick) onMarkerClick(room);
      });

      markersRef.current.push(marker);
    });

    // Fit bounds
    if (rooms.length > 1) {
      map.fitBounds(bounds);
    }

    return () => {
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
    };
  }, [isLoaded, rooms, onMarkerClick]);

  return (
    <>
      <Box
        ref={mapRef}
        sx={{
          width: '100%',
          height: '100%',
          borderRadius: '12px',
          overflow: 'hidden',
        }}
      />
      <style>{`
        .custom-marker {
          cursor: pointer;
          transition: transform 0.2s ease;
        }
        
        .custom-marker:hover {
          transform: scale(1.1);
          z-index: 1000;
        }
        
        .marker-price {
          background: #ffffff;
          color: #222222;
          padding: 6px 12px;
          border-radius: 20px;
          font-weight: 600;
          font-size: 13px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          border: 1.5px solid #222222;
          white-space: nowrap;
        }
        
        .custom-marker:hover .marker-price {
          background: #222222;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
        }
        
        .gm-style-iw-d {
          overflow: hidden !important;
        }
        
        .gm-style-iw {
          padding: 0 !important;
        }
      `}</style>
    </>
  );
};

export default RoomMap;
