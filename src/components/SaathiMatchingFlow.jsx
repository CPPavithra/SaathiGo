import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Popup } from 'react-leaflet';
import { 
  Menu, 
  X, 
  Star, 
  MessageCircle, 
  MapPin, 
  Clock, 
  Car,
  Users,
  IndianRupee,
  ArrowLeft,
  Send,
  UserCheck
} from 'lucide-react';

const SaathiMatchingFlow = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get ride request data from previous state
  const rideRequest = location.state || {
    pickupLocation: 'Connaught Place, New Delhi',
    dropLocation: 'India Gate, New Delhi',
    pickupCoords: [28.6315, 77.2167],
    dropCoords: [28.6129, 77.2295],
    luggage: false,
    womenOnly: true,
    userName: 'Pavithra'
  };

  const [currentScreen, setCurrentScreen] = useState('finding'); // 'finding', 'matches', 'found'
  const [animationPhase, setAnimationPhase] = useState(0);
  const [matchingRiders, setMatchingRiders] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);

  // Mock active ride requests database
  const activeRideRequests = [
    {
      id: 1,
      name: 'Priya Sharma',
      gender: 'Female',
      pickupLocation: 'Rajiv Chowk Metro, New Delhi',
      dropLocation: 'Red Fort, New Delhi',
      pickupCoords: [28.6328, 77.2197],
      dropCoords: [28.6562, 77.2410],
      timestamp: Date.now() - 120000, // 2 minutes ago
      rating: 4.8,
      totalRatings: 127,
      preferences: { womenOnly: true, luggage: true },
      vehicle: {
        make: 'Maruti Swift',
        color: 'Grey',
        number: 'DL 12 AB 3456'
      },
      estimatedFare: 160,
      avatar: 'P'
    },
    {
      id: 2,
      name: 'Ananya Das',
      gender: 'Female',
      pickupLocation: 'Khan Market, New Delhi',
      dropLocation: 'Lodhi Garden, New Delhi',
      pickupCoords: [28.6127, 77.2319],
      dropCoords: [28.5933, 77.2507],
      timestamp: Date.now() - 300000, // 5 minutes ago
      rating: 4.6,
      totalRatings: 89,
      preferences: { womenOnly: true, luggage: true },
      vehicle: {
        make: 'Honda City',
        color: 'White',
        number: 'DL 08 CD 7890'
      },
      estimatedFare: 140,
      avatar: 'A'
    },
    {
      id: 3,
      name: 'Meera Gupta',
      gender: 'Female',
      pickupLocation: 'Central Secretariat Metro, New Delhi',
      dropLocation: 'India Gate Metro, New Delhi',
      pickupCoords: [28.6143, 77.2122],
      dropCoords: [28.6118, 77.2297],
      timestamp: Date.now() - 180000, // 3 minutes ago
      rating: 4.9,
      totalRatings: 203,
      preferences: { womenOnly: true, luggage: true },
      vehicle: {
        make: 'Hyundai i20',
        color: 'Blue',
        number: 'DL 03 EF 1234'
      },
      estimatedFare: 120,
      avatar: 'M'
    }
  ];

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Find matching riders based on proximity and timing
  const findMatchingRiders = () => {
    const matches = activeRideRequests.filter(rider => {
      // Check pickup proximity (within 1km)
      const pickupDistance = calculateDistance(
        rideRequest.pickupCoords[0], rideRequest.pickupCoords[1],
        rider.pickupCoords[0], rider.pickupCoords[1]
      );

      // Check drop proximity (within 1km)
      const dropDistance = calculateDistance(
        rideRequest.dropCoords[0], rideRequest.dropCoords[1],
        rider.dropCoords[0], rider.dropCoords[1]
      );

      // Check timing (within 10 minutes)
      const timeDifference = Math.abs(Date.now() - rider.timestamp);
      const withinTimeLimit = timeDifference <= 600000; // 10 minutes

      // Check preferences compatibility
      const preferencesMatch = (!rideRequest.womenOnly || rider.preferences.womenOnly) &&
                              (rideRequest.luggage === rider.preferences.luggage);

    return pickupDistance <= 10 && dropDistance <= 10 && withinTimeLimit && preferencesMatch;
    });

    return matches.sort((a, b) => {
      // Sort by proximity and rating
      const aDistance = calculateDistance(
        rideRequest.pickupCoords[0], rideRequest.pickupCoords[1],
        a.pickupCoords[0], a.pickupCoords[1]
      );
      const bDistance = calculateDistance(
        rideRequest.pickupCoords[0], rideRequest.pickupCoords[1],
        b.pickupCoords[0], b.pickupCoords[1]
      );
      return aDistance - bDistance;
    });
  };

  // Animation cycle for finding screen
  useEffect(() => {
    if (currentScreen === 'finding') {
      const interval = setInterval(() => {
        setAnimationPhase(prev => (prev + 1) % 4);
      }, 800);
      
      // Simulate finding matches after 3 seconds
      const timeout = setTimeout(() => {
        const matches = findMatchingRiders();
        setMatchingRiders(matches);
        if (matches.length > 0) {
          setCurrentScreen('matches');
        } else {
          // No matches found, show empty state
          setCurrentScreen('matches');
        }
      }, 3000);

      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, [currentScreen]);

  const handleBackToRequest = () => {
    navigate('/request');
  };

  const handleSelectMatch = (rider) => {
    setSelectedMatch(rider);
    setCurrentScreen('found');
  };

  const handleRequestRideShare = (riderId) => {
    console.log('Requesting ride share with rider:', riderId);
    const rider = matchingRiders.find(r => r.id === riderId);
    if (rider) {
      setSelectedMatch(rider);
      setCurrentScreen('found');
    }
  };

  const handleStartChat = (riderId) => {
    console.log('Starting chat with rider:', riderId);
    // Navigate to chat interface or open chat modal
  };

  const handleAcceptRide = () => {
    console.log('Ride accepted with:', selectedMatch);
    // Navigate to ride tracking screen
    navigate('/tracking', { state: { match: selectedMatch, rideRequest } });
  };

  const handleDeclineRide = () => {
    setSelectedMatch(null);
    setCurrentScreen('matches');
  };

  // Finding Screen Component
  const FindingScreen = () => (
    <div className="request-ride">
      <header className="header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <ArrowLeft 
          size={24} 
          onClick={handleBackToRequest}
          style={{ cursor: 'pointer', color: '#667eea' }}
        />
        <div className="logo" style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          ★ SaathiGo
        </div>
        <Menu className="menu-icon" size={24} style={{ color: '#667eea' }} />
      </header>

      <div style={{
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
          marginBottom: '1rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Finding Your Saathi...
        </h2>

        <p style={{ color: '#666', marginBottom: '2rem' }}>
          From: {rideRequest.pickupLocation}<br />
          To: {rideRequest.dropLocation}
        </p>

        {/* Animated Connection Visual */}
        <div style={{
          position: 'relative',
          width: '200px',
          height: '200px',
          marginBottom: '2rem'
        }}>
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
          lineHeight: '1.5'
        }}>
          Searching for companions along your route...
          <br />
          <span style={{ fontSize: '0.9rem', color: '#999' }}>
            Looking for safe group rides nearby
          </span>
        </p>
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

  // Matches List Screen Component
  const MatchesScreen = () => (
    <div className="request-ride">
      <header className="header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <ArrowLeft 
          size={24} 
          onClick={handleBackToRequest}
          style={{ cursor: 'pointer', color: '#667eea' }}
        />
        <div style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          ★ SaathiGo
        </div>
        <Menu size={24} style={{ color: '#667eea' }} />
      </header>

      <div style={{ padding: '1rem' }}>
        <h2 style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          marginBottom: '1rem',
          textAlign: 'center'
        }}>
          {matchingRiders.length > 0 ? `Found ${matchingRiders.length} Matches!` : 'No Matches Found'}
        </h2>

        {/* Map with all routes */}
        <div style={{ marginBottom: '1.5rem', borderRadius: '15px', overflow: 'hidden' }}>
          <MapContainer 
            center={[(rideRequest.pickupCoords[0] + rideRequest.dropCoords[0]) / 2, (rideRequest.pickupCoords[1] + rideRequest.dropCoords[1]) / 2]} 
            zoom={13} 
            style={{ height: '300px', width: '100%' }}
          >
            <TileLayer
              attribution='© OpenStreetMap'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* User's route */}
            <Marker position={rideRequest.pickupCoords}>
              <Popup>Your Pickup: {rideRequest.pickupLocation}</Popup>
            </Marker>
            <Marker position={rideRequest.dropCoords}>
              <Popup>Your Drop: {rideRequest.dropLocation}</Popup>
            </Marker>
            <Polyline
              positions={[rideRequest.pickupCoords, rideRequest.dropCoords]}
              color="#667eea"
              weight={4}
              opacity={0.8}
            />

            {/* Matching riders' routes */}
            {matchingRiders.map((rider, index) => (
              <React.Fragment key={rider.id}>
                <Marker position={rider.pickupCoords}>
                  <Popup>{rider.name}'s Pickup: {rider.pickupLocation}</Popup>
                </Marker>
                <Marker position={rider.dropCoords}>
                  <Popup>{rider.name}'s Drop: {rider.dropLocation}</Popup>
                </Marker>
                <Polyline
                  positions={[rider.pickupCoords, rider.dropCoords]}
                  color={['#ff6b6b', '#4ecdc4', '#45b7d1'][index % 3]}
                  weight={3}
                  opacity={0.6}
                />
              </React.Fragment>
            ))}
          </MapContainer>
        </div>

        {matchingRiders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            backgroundColor: '#f8f9ff',
            borderRadius: '15px',
            marginBottom: '1rem'
          }}>
            <p style={{ color: '#666', marginBottom: '1rem' }}>
              No matching riders found at the moment.
            </p>
            <button
              onClick={() => setCurrentScreen('finding')}
              style={{
                padding: '12px 24px',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '25px',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Search Again
            </button>
          </div>
        ) : (
          <div>
            {matchingRiders.map((rider) => (
              <div key={rider.id} style={{
                backgroundColor: 'white',
                borderRadius: '15px',
                padding: '1.5rem',
                marginBottom: '1rem',
                boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  marginBottom: '1rem'
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
                    {rider.avatar}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>
                      {rider.name}
                    </h3>
                    <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.25rem' }}>
                      <Star size={16} fill="#ffd700" color="#ffd700" />
                      <span style={{ marginLeft: '0.25rem', color: '#666' }}>
                        {rider.rating}/5.0 ({rider.totalRatings} rides)
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <MapPin size={16} color="#4ecdc4" style={{ marginRight: '0.5rem' }} />
                    <span style={{ fontSize: '0.9rem' }}>From: {rider.pickupLocation}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <MapPin size={16} color="#ff6b6b" style={{ marginRight: '0.5rem' }} />
                    <span style={{ fontSize: '0.9rem' }}>To: {rider.dropLocation}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                    <Clock size={16} color="#667eea" style={{ marginRight: '0.5rem' }} />
                    <span style={{ fontSize: '0.9rem' }}>
                      Requested {Math.floor((Date.now() - rider.timestamp) / 60000)} mins ago
                    </span>
                  </div>
                </div>

                <div style={{
                  backgroundColor: '#f8f9ff',
                  padding: '1rem',
                  borderRadius: '10px',
                  marginBottom: '1rem'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>Estimated Shared Fare:</span>
                    <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#667eea' }}>
                      ₹{Math.floor((rideRequest.estimatedFare || 200 + rider.estimatedFare) / 2)}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button
                    onClick={() => handleRequestRideShare(rider.id)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '25px',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <UserCheck size={16} />
                    Request Ride
                  </button>
                  
                  <button
                    onClick={() => handleStartChat(rider.id)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      backgroundColor: '#f8f9ff',
                      border: '2px solid #667eea',
                      borderRadius: '25px',
                      fontSize: '0.9rem',
                      color: '#667eea',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    <MessageCircle size={16} />
                    Chat
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Match Found Screen Component (when user selects a specific match)
  const MatchFoundScreen = () => (
    <div className="request-ride">
      <header className="header" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: 'white',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <ArrowLeft 
          size={24} 
          onClick={() => setCurrentScreen('matches')}
          style={{ cursor: 'pointer', color: '#667eea' }}
        />
        <div style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          ★ SaathiGo
        </div>
        <Menu size={24} style={{ color: '#667eea' }} />
      </header>

      <div style={{ padding: '1rem' }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '1.5rem',
          padding: '1rem',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          borderRadius: '15px',
          color: 'white'
        }}>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 'bold', margin: 0 }}>
            🎉 Ride Match!
          </h2>
        </div>

        {selectedMatch && (
          <>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '15px',
              padding: '1.5rem',
              marginBottom: '1rem',
              boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
              border: '1px solid #e0e0e0'
            }}>
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
                  {selectedMatch.avatar}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>
                    {selectedMatch.name}
                  </h3>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.25rem' }}>
                    <Star size={16} fill="#ffd700" color="#ffd700" />
                    <span style={{ marginLeft: '0.25rem', color: '#666' }}>
                      {selectedMatch.rating}/5.0 ({selectedMatch.totalRatings} rides)
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <Car size={18} color="#667eea" style={{ marginRight: '0.5rem' }} />
                  <span>{selectedMatch.vehicle.make}, {selectedMatch.vehicle.color} ({selectedMatch.vehicle.number})</span>
                </div>
              </div>

              <div style={{
                backgroundColor: '#f8f9ff',
                padding: '1rem',
                borderRadius: '10px',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Shared Fare:</span>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#667eea' }}>
                    ₹{Math.floor((200 + selectedMatch.estimatedFare) / 2)}
                  </span>
                </div>
                <div style={{ 
                  textAlign: 'center', 
                  color: '#27ae60', 
                  fontWeight: 'bold',
                  marginTop: '0.5rem',
                  fontSize: '0.9rem'
                }}>
                  You save ₹{Math.floor((200 + selectedMatch.estimatedFare) / 4)}! 💰
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem', borderRadius: '15px', overflow: 'hidden' }}>
              <MapContainer 
                center={[(rideRequest.pickupCoords[0] + selectedMatch.pickupCoords[0]) / 2, (rideRequest.pickupCoords[1] + selectedMatch.pickupCoords[1]) / 2]} 
                zoom={13} 
                style={{ height: '200px', width: '100%' }}
              >
                <TileLayer
                  attribution='© OpenStreetMap'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={rideRequest.pickupCoords}>
                  <Popup>Your Pickup</Popup>
                </Marker>
                <Marker position={rideRequest.dropCoords}>
                  <Popup>Your Drop</Popup>
                </Marker>
                <Marker position={selectedMatch.pickupCoords}>
                  <Popup>{selectedMatch.name}'s Pickup</Popup>
                </Marker>
                <Marker position={selectedMatch.dropCoords}>
                  <Popup>{selectedMatch.name}'s Drop</Popup>
                </Marker>
                <Polyline
                  positions={[rideRequest.pickupCoords, rideRequest.dropCoords]}
                  color="#667eea"
                  weight={3}
                />
                <Polyline
                  positions={[selectedMatch.pickupCoords, selectedMatch.dropCoords]}
                  color="#ff6b6b"
                  weight={3}
                />
              </MapContainer>
            </div>

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
                  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
                }}
              >
                Confirm Ride
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
                  cursor: 'pointer'
                }}
              >
                Back
              </button>
            </div>

            <button
              onClick={() => handleStartChat(selectedMatch.id)}
              style={{
                width: '100%',
                padding: '1rem',
                backgroundColor: '#f8f9ff',
                border: '2px solid #667eea',
                borderRadius: '25px',
                fontSize: '1rem',
                color: '#667eea',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              <MessageCircle size={20} />
              Message {selectedMatch.name}
            </button>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {currentScreen === 'finding' && <FindingScreen />}
      {currentScreen === 'matches' && <MatchesScreen />}
      {currentScreen === 'found' && <MatchFoundScreen />}
    </>
  );
};

export default SaathiMatchingFlow;
