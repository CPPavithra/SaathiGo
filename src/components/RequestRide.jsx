import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, Polyline } from 'react-leaflet';
import L from 'leaflet';
import './RequestRide.css';
import { useNavigate } from 'react-router-dom';
import FlyToOnLocationChange from './FlyToOnLocationChange';
import { MapPin, Briefcase, ShieldCheck, Menu, LocateFixed } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

const ORS_API_KEY = process.env.ORS_API_KEY;


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationPicker = ({ setCoords, setLocation }) => {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      setCoords([lat, lng]);

      fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
        .then(res => res.json())
        .then(data => {
          setLocation(data.display_name || `Lat: ${lat}, Lng: ${lng}`);
        });
    }
  });

  return position ? <Marker position={position} /> : null;
};

const RequestRide = ({ userName = 'Pavithra' }) => {
const navigate = useNavigate();
  const [pickupLocation, setPickupLocation] = useState('');
  const [dropLocation, setDropLocation] = useState('');
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
  const [luggage, setLuggage] = useState(false);
  const [womenOnly, setWomenOnly] = useState(true);
  const [currentPos, setCurrentPos] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [activeInput, setActiveInput] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCurrentPos([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => console.warn("Geolocation error:", err),
      { enableHighAccuracy: true }
    );
  }, []);

  useEffect(() => {
    if (pickupCoords && dropCoords) {
      fetchRoute(pickupCoords, dropCoords);
    }
  }, [pickupCoords, dropCoords]);

  const fetchSuggestions = (query) => {
    if (!query) {
      setSuggestions([]);
      return;
    }
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}`)
      .then(res => res.json())
      .then(data => {
        setSuggestions(data.slice(0, 5));
      });
  };

  
  const fetchRoute = (start, end) => {
    const url = `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${ORS_API_KEY}&start=${start[1]},${start[0]}&end=${end[1]},${end[0]}`;

    fetch(url)
      .then(res => res.json())
      .then(data => setRouteGeoJSON(data.features[0].geometry));
  };

  const handleUseCurrentLocation = () => {
    if (!currentPos) return;
    const [lat, lng] = currentPos;
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      .then(res => res.json())
      .then(data => {
        setPickupLocation(data.display_name || `Lat: ${lat}, Lng: ${lng}`);
        setPickupCoords([lat, lng]);
      });
  };

const selectSuggestion = (item, type) => {
    const coords = [parseFloat(item.lat), parseFloat(item.lon)];
    if (type === 'pickup') {
      setPickupLocation(item.display_name);
      setPickupCoords(coords);
    } else {
      setDropLocation(item.display_name);
      setDropCoords(coords);
    }
    setSuggestions([]);
    setActiveInput(null);
  };


  const handleRequest = () => {
    if (pickupLocation && dropLocation) {
      console.log('Ride requested', {
        pickup: pickupLocation,
        drop: dropLocation,
        pickupCoords,
        dropCoords,
        luggage,
        womenOnly
      });
navigate('/match');
    }
  };

  return (
    <div className="request-ride">
      <header className="header">
        <div className="logo">★ SaathiGo</div>
        <Menu className="menu-icon" />
      </header>

      <div className="greeting">Hello, {userName}!</div>

      <div className="location-inputs">
        <div className="input-wrapper">
          <input
            className="sleek-input"
            type="text"
            placeholder="Pickup location"
            value={pickupLocation}
            onFocus={() => setActiveInput('pickup')}
            onChange={(e) => {
              setPickupLocation(e.target.value);
              fetchSuggestions(e.target.value);
            }}
          />
          <button className="locate-btn" onClick={handleUseCurrentLocation}><LocateFixed size={18} /></button>
          {activeInput === 'pickup' && suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((item, idx) => (
                <li key={idx} onClick={() => selectSuggestion(item, 'pickup')}>
                  {item.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="input-wrapper">
          <input
            className="sleek-input"
            type="text"
            placeholder="Drop location"
            value={dropLocation}
            onFocus={() => setActiveInput('drop')}
            onChange={(e) => {
              setDropLocation(e.target.value);
              fetchSuggestions(e.target.value);
            }}
          />
          <button className="locate-btn"><MapPin size={18} /></button>
          {activeInput === 'drop' && suggestions.length > 0 && (
            <ul className="suggestions-list">
              {suggestions.map((item, idx) => (
                <li key={idx} onClick={() => selectSuggestion(item, 'drop')}>
                  {item.display_name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Always Visible Map */}
      {currentPos && (
        <div className="map-container">
          <MapContainer center={currentPos} zoom={13} style={{ height: '300px', width: '100%' }}>
            <TileLayer
              attribution='© OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {pickupCoords && <Marker position={pickupCoords} />}
            {dropCoords && <Marker position={dropCoords} />}
            {routeGeoJSON && (
              <Polyline
                positions={routeGeoJSON.coordinates.map(coord => [coord[1], coord[0]])}
                color="yellow"
                weight={4}
              />
            )}
            <LocationPicker
              setCoords={activeInput === 'pickup' ? setPickupCoords : setDropCoords}
              setLocation={activeInput === 'pickup' ? setPickupLocation : setDropLocation}
            />
            
<FlyToOnLocationChange coords={activeInput === 'pickup' ? pickupCoords : dropCoords} />
            <Marker position={currentPos} />
          </MapContainer>
        </div>
      )}

      <div className="preferences">
        <div className="pref-item">
          <Briefcase className="icon" />
          <span>Luggage</span>
          <label className="toggle">
            <input
              type="checkbox"
              checked={luggage}
              onChange={() => setLuggage(!luggage)}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className="pref-item women">
          <ShieldCheck className="icon" />
          <span>Women Only Ride</span>
          <label className="toggle">
            <input
              type="checkbox"
              checked={womenOnly}
              onChange={() => setWomenOnly(!womenOnly)}
            />
            <span className="slider"></span>
          </label>
        </div>
      </div>

      <button
        className="request-button"
        onClick={handleRequest}
        disabled={!dropLocation || !pickupLocation}
      >
        Request SaathiGo
      </button>
    </div>
  );
};

export default RequestRide;

