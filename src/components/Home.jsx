import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import taxiLogo from '../assets/taxibook.gif';
import taxiMain from '../assets/home.webp';

function Home() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  return (
    <div className="app-container">
      <div className="status-bar">
        <div className="time"></div>
        <div className="status-icons">
          <div className="cellular-icon"></div>
          <div className="battery-icon"></div>
        </div>
      </div>

      <div className="purple-section">
        <div className="header">
          <div className="logo-container">
                     </div>
          <h1 className="app-title">SaathiGo</h1>
        </div>

        <div className="main-robot">
          <img src={taxiMain} alt="Robot Character" className="main-robot-img" />
        </div>
      </div>

      <div className="white-section-home">
        <div className="app-info">
          <h2 className="app-name">SaathiGo</h2>
          <p className="app-description">
             SaathiGo empowers women to journey safely,<br/>
connecting you with others heading your way, while making<br/>
every ride affordable. Because you should never<br/>
travel alone unless you choose to.<br />
<br/>
<br/>
<br/>
          </p>
          <h2 className="app-name">Safe Rides, Shared Savings.</h2>
        </div>

        <div className="button-container">
          <button className="login-button" onClick={handleLoginClick}>
            Log In
          </button>
          <button className="signup-button" onClick={handleSignupClick}>
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}

export default Home;

