import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import landingGif from '../assets/taxibook.gif'; // Your single landing GIF
import './Landing.css';

function Landing() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/home');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="landing-container">
      <img src={landingGif} alt="Loading..." className="landing-gif" />
    </div>
  );
}

export default Landing;
