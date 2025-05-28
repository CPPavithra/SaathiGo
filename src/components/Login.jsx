import React, { useState } from 'react';
import './Signup.css'; // Reuse the same style

const Login = () => {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://localhost:5000/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      if (res.ok) {
        setStep(2);
        setSuccess('OTP sent to your email.');
      } else {
        setError(data.msg || 'Failed to send OTP');
      }
    } catch (err) {
      setError('Server error. Try again.');
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();
      if (res.ok) {
        setSuccess('Login successful!');
        localStorage.setItem('token', data.token); // Store JWT
        setTimeout(() => {
          window.location.href = '/requestride'; // Redirect
        }, 1000);
      } else {
        setError(data.msg || 'Invalid OTP');
      }
    } catch (err) {
      setError('Server error. Try again.');
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="header">
          <button className="back-button" onClick={() => window.history.back()}>
            <svg width="24" height="24" viewBox="0 0 24 24">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        <div className="signup-content">
          <h1>Log in</h1>
          <p className="subtitle">Enter your email to receive an OTP</p>

          <form onSubmit={step === 1 ? handleSendOTP : handleVerifyOTP} className="signup-form">
            <div className="input-group">
              <div className="input-wrapper">
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={step === 2}
                />
              </div>
            </div>

            {step === 2 && (
              <div className="input-group">
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <button type="submit" className="signup-button">
              {step === 1 ? 'Send OTP' : 'Verify OTP'}
            </button>
          </form>

          <div className="divider">
            <span>or</span>
          </div>

          <div className="login-link">
            <span>Don't have an account? </span>
            <a href="/signup">Sign up</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

