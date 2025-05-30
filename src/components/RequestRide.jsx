// RequestRide.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RequestRide.css';
import { MapPin, Briefcase, ShieldCheck, Menu } from 'lucide-react';

const RequestRide = ({ userName = 'Pavithra' }) => {
  const [dropLocation, setDropLocation] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [luggage, setLuggage] = useState(false);
  const [womenOnly, setWomenOnly] = useState(true);
  const navigate = useNavigate();

  const handleRequest = () => {
    if (pickupLocation && dropLocation) {
      console.log('Ride requested', {
        pickup: pickupLocation,
        drop: dropLocation,
        luggage,
        womenOnly
      });
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
        <div className="input-field" onClick={() => alert('Open pickup location map')}>
          <MapPin className="icon" />
          <input
            type="text"
            placeholder="Pickup location"
            value={pickupLocation}
            onChange={(e) => setPickupLocation(e.target.value)}
          />
        </div>
        
        <div className="input-field" onClick={() => alert('Open drop location map')}>
          <MapPin className="icon" />
          <input
            type="text"
            placeholder="Where to?"
            value={dropLocation}
            onChange={(e) => setDropLocation(e.target.value)}
          />
        </div>
      </div>

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
