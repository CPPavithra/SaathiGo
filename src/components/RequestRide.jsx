// RequestRide.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RequestRide.css';
import { MapPin,Briefcase, ShieldCheck, Menu } from 'lucide-react';

const RequestRide = ({ userName = 'Pavithra' }) => {
  const [dropLocation, setDropLocation] = useState('');
  const [pickupLocation, setPickupLocation] = useState('Your Current Location');
  const [luggage, setLuggage] = useState(false);
  const [womenOnly, setWomenOnly] = useState(true);
  const [showPreferences, setShowPreferences] = useState(false);
  const navigate = useNavigate();

  const handleRequest = () => {
    if (pickupLocation && dropLocation) {
      console.log('Ride requested');
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
        <div className="input-field" onClick={() => alert('Open drop location map')}>
          <input
            type="text"
            placeholder="Where to?"
            value={dropLocation}
            onChange={(e) => setDropLocation(e.target.value)}
          />
        </div>
        <div className="input-field small" onClick={() => alert('Change pickup location')}>
          <MapPin className="icon" />
          <span>{pickupLocation}</span>
        </div>
      </div>

      <div className="toggle-preferences" onClick={() => setShowPreferences(!showPreferences)}>
        Preferences {showPreferences ? '▲' : '▼'}
      </div>

      {showPreferences && (
        <div className="preferences">
          <div className="pref-item">
            <Briefcase className="icon" />
            <label className="toggle">
              <input
                type="checkbox"
                checked={luggage}
                onChange={() => setLuggage(!luggage)}
              />
              <span className="slider"></span>
            </label>
            <span>Luggage</span>
          </div>
          <div className="pref-item women">
            <ShieldCheck className="icon" />
            <label className="toggle">
              <input
                type="checkbox"
                checked={womenOnly}
                onChange={() => setWomenOnly(!womenOnly)}
              />
              <span className="slider"></span>
            </label>
            <span>Women Only Ride</span>
          </div>
        </div>
      )}

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

