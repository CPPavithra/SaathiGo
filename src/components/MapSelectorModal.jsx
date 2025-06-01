// MapSelectorModal.jsx
import React from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const LocationMarker = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect(e.latlng);
    },
  });
  return null;
};

const MapSelectorModal = ({ onClose, onSelectLocation }) => {
  return (
    <div className="map-modal">
      <button onClick={onClose}>Close</button>
      <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '400px', width: '100%' }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker onSelect={onSelectLocation} />
      </MapContainer>
    </div>
  );
};

export default MapSelectorModal;

