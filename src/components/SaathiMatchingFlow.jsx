import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';
import { 
  Menu, 
  X, 
  Star, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Car,
  Users,
  IndianRupee
} from 'lucide-react';
import './RequestRide.css';

const SaathiMatchingFlow = ({ 
  userName = 'Pavithra',
  pickupLocation = 'Connaught Place, New Delhi',
  dropLocation = 'India Gate, New Delhi',
  pickupCoords = [28.6315, 77.2167],
  dropCoords = [28.6129, 77.2295]
}) => {
  const [currentScreen, setCurrentScreen] = useState('finding'); // 'finding' or 'found'
  const [animationPhase, setAnimationPhase] = useState(0);
  const [matchFound, setMatchFound] = useState(false);

  // Mock match data
  const matchData = {
    name: 'Priya Sharma',
    gender: 'Female',
    rating: 4.8,
    totalRatings: 127,
    pickupTime: 5,
    vehicle: {
      make: 'Maruti Swift',
      color: 'Grey',
      number: 'DL 12 AB 3456'
    },
    originalFare: 280,
    sharedFare: 140,
    savings: 140,
    companionLocation: [28.6280, 77.2100]
  };

  // Animation cycle for finding screen
  useEffect(() => {
    if (currentScreen === 'finding') {
      const interval = setInterval(() => {
        setAnimationPhase(prev => (prev + 1) % 4);
      }, 800);
      
      // Simulate finding a match after 4 seconds
      const timeout = setTimeout(() => {
        setMatchFound(true);
        setCurrentScreen('found');
      }, 4000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [currentScreen]);

  const handleCancelRide = () => {
    console.log('Ride cancelled');
    // Navigate back to request screen
  };

  const handleAcceptRide = () => {
    console.log('Ride accepted', matchData);
    // Navigate to ride tracking screen
  };

  const handleDeclineRide = () => {
    setCurrentScreen('finding');
    setMatchFound(false);
    // Start searching again
  };

  const handleMessageCompanion = () => {
    console.log('Opening chat with', matchData.name);
    // Open messaging interface
  };

  // Finding Screen Component
  const FindingScreen = () => (
    <div className="request-ride">
      <header className="header">
        <div className="logo">★ SaathiGo</div>
        <Menu className="menu-icon" />
      </header>

      <div className="finding-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h2 style={{
          fontSize: '1.8rem',
          fontWeight: 'bold',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Finding Your Saathi...
        </h2>

        {/* Animated Connection Visual */}
        <div style={{
          position: 'relative',
          width: '200px',
          height: '200px',
          marginBottom: '2rem'
        }}>
          {/* Center pulse */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '20px',
            height: '20px',
            backgroundColor: '#667eea',
            borderRadius: '50%',
            animation: 'pulse 2s infinite'
          }} />
          
          {/* Radiating circles */}
          {[1, 2, 3].map(i => (
            <div key={i} style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: `${40 + i * 30}px`,
              height: `${40 + i * 30}px`,
              border: '2px solid #667eea',
              borderRadius: '50%',
              opacity: animationPhase >= i ? 0.3 : 0.1,
              transition: 'opacity 0.3s ease'
            }} />
          ))}

          {/* Connecting stars */}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <div key={i} style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: `translate(-50%, -50%) rotate(${i * 60}deg) translateY(-80px)`,
              fontSize: '12px',
              color: '#667eea',
              opacity: animationPhase === i % 4 ? 1 : 0.3,
              transition: 'opacity 0.3s ease'
            }}>
              ★
            </div>
          ))}
        </div>

        <p style={{
          color: '#666',
          fontSize: '1.1rem',
          marginBottom: '3rem',
          lineHeight: '1.5'
        }}>
          Searching for companions along your route...
          <br />
          <span style={{ fontSize: '0.9rem', color: '#999' }}>
            Looking for safe group rides nearby
          </span>
        </p>

        <button 
          onClick={handleCancelRide}
          style={{
            padding: '12px 24px',
            backgroundColor: 'transparent',
            border: '2px solid #ff4757',
            borderRadius: '25px',
            color: '#ff4757',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#ff4757';
            e.target.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = 'transparent';
            e.target.style.color = '#ff4757';
          }}
        >
          Cancel Ride
        </button>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          50% { transform: translate(-50%, -50%) scale(1.2); opacity: 0.7; }
          100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );

  // Match Found Screen Component
  const MatchFoundScreen = () => (
    <div className="request-ride">
      <header className="header">
        <div className="logo">★ SaathiGo</div>
        <Menu className="menu-icon" />
      </header>

      <div style={{ padding: '1rem' }}>
        {/* Success Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          padding: '1rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '15px',
          color: 'white'
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>
            🎉 Saathi Found!
          </h2>
        </div>

        {/* Match Details Card */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '15px',
          padding: '1.5rem',
          marginBottom: '1rem',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
          border: '1px solid #e0e0e0'
        }}>
          {/* Companion Info */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '1rem',
            paddingBottom: '1rem',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              backgroundColor: '#667eea',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.2rem',
              fontWeight: 'bold',
              marginRight: '1rem'
            }}>
              {matchData.name.charAt(0)}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>
                {matchData.name} ({matchData.gender})
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.25rem' }}>
                <Star size={16} fill="#ffd700" color="#ffd700" />
                <span style={{ marginLeft: '0.25rem', color: '#666' }}>
                  {matchData.rating}/5.0 ({matchData.totalRatings} rides)
                </span>
              </div>
            </div>
          </div>

          {/* Ride Details */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
              <Clock size={18} color="#667eea" style={{ marginRight: '0.5rem' }} />
              <span style={{ fontWeight: '600' }}>Arriving in {matchData.pickupTime} mins</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
              <Car size={18} color="#667eea" style={{ marginRight: '0.5rem' }} />
              <span>{matchData.vehicle.make}, {matchData.vehicle.color} ({matchData.vehicle.number})</span>
            </div>
          </div>

          {/* Fare Details */}
          <div style={{
            backgroundColor: '#f8f9ff',
            padding: '1rem',
            borderRadius: '10px',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ color: '#666' }}>Original Fare:</span>
              <span style={{ textDecoration: 'line-through', color: '#999' }}>
                ₹{matchData.originalFare}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Your Share:</span>
              <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#667eea' }}>
                ₹{matchData.sharedFare}
              </span>
            </div>
            <div style={{ 
              textAlign: 'center', 
              color: '#27ae60', 
              fontWeight: 'bold',
              marginTop: '0.5rem',
              fontSize: '0.9rem'
            }}>
              You save ₹{matchData.savings}! 💰
            </div>
          </div>
        </div>

        {/* Mini Map */}
        <div style={{ marginBottom: '1.5rem', borderRadius: '15px', overflow: 'hidden' }}>
          <MapContainer 
            center={[(pickupCoords[0] + dropCoords[0]) / 2, (pickupCoords[1] + dropCoords[1]) / 2]} 
            zoom={12} 
            style={{ height: '200px', width: '100%' }}
          >
            <TileLayer
              attribution='© OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={pickupCoords} />
            <Marker position={dropCoords} />
            <Marker position={matchData.companionLocation} />
            <Polyline
              positions={[pickupCoords, matchData.companionLocation, dropCoords]}
              color="#667eea"
              weight={3}
            />
          </MapContainer>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <button
            onClick={handleAcceptRide}
            style={{
              flex: 2,
              padding: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '25px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
              boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Accept Ride
          </button>
          
          <button
            onClick={handleDeclineRide}
            style={{
              flex: 1,
              padding: '1rem',
              backgroundColor: 'transparent',
              border: '2px solid #ccc',
              borderRadius: '25px',
              fontSize: '1rem',
              color: '#666',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.target.style.borderColor = '#ff4757';
              e.target.style.color = '#ff4757';
            }}
            onMouseOut={(e) => {
              e.target.style.borderColor = '#ccc';
              e.target.style.color = '#666';
            }}
          >
            Find Another
          </button>
        </div>

        {/* Message Button */}
        <button
          onClick={handleMessageCompanion}
          style={{
            width: '100%',
            padding: '1rem',
            backgroundColor: '#f8f9ff',
            border: '2px solid #667eea',
            borderRadius: '25px',
            fontSize: '1rem',
            color: '#667eea',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#667eea';
            e.target.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#f8f9ff';
            e.target.style.color = '#667eea';
          }}
        >
          <MessageCircle size={20} />
          Message {matchData.name}
        </button>
      </div>
    </div>
  );

  return currentScreen === 'finding' ? <FindingScreen /> : <MatchFoundScreen />;
};

export default SaathiMatchingFlow;
