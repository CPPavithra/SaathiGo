import React, { useState } from 'react';
import './Signup.css';

const SignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    gender: '',
    email: '',
    phone_number: '',
    emergency_contacts: [{ name: '', phone: '' }]
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');

  const validateForm = () => {
    const { name, dob, gender, email } = formData;
    const newErrors = {};

    if (!name.trim()) newErrors.name = 'Name is required.';
    if (!dob) newErrors.dob = 'Date of birth is required.';
    else if (new Date(dob) > new Date()) newErrors.dob = 'Date of birth cannot be in the future.';
    if (!gender) newErrors.gender = 'Please select a gender.';
    if (!email.trim()) newErrors.email = 'Email is required.';
    else if (!/^\S+@\S+\.\S+$/.test(email)) newErrors.email = 'Invalid email format.';
    if (!formData.phone_number.trim()) newErrors.phone_number = 'Phone number is required.';

    formData.emergency_contacts.forEach((contact, i) => {
      if (!contact.name || !contact.phone) {
        newErrors[`emergency_contacts_${i}`] = 'Emergency contact name and phone are required.';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  };

  const handleEmergencyChange = (index, field, value) => {
    const updatedContacts = [...formData.emergency_contacts];
    updatedContacts[index][field] = value;
    setFormData({ ...formData, emergency_contacts: updatedContacts });
  };

  const addEmergencyContact = () => {
    setFormData({
      ...formData,
      emergency_contacts: [...formData.emergency_contacts, { name: '', phone: '' }]
    });
  };

  const handleEmailSignUp = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const res = await fetch('http://localhost:5000/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          emergency_contacts: JSON.stringify(formData.emergency_contacts)
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess('Signup successful!');
        setFormData({
          name: '',
          dob: '',
          gender: '',
          email: '',
          phone_number: '',
          emergency_contacts: [{ name: '', phone: '' }]
        });
        setErrors({});
        navigate('/login');
      } else {
        setSuccess('');
        setErrors({ email: data.error || 'Signup failed' });
      }
    } catch (err) {
      console.error('Signup error:', err);
      setErrors({ email: 'Server error. Please try again later.' });
    }
  };

 
  // JSX continues...
  return (
    <div className="signup-container">
      <div className="signup-card">
        <div className="header">
          <button className="back-button">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div className="signup-content">
          <h1>Create account</h1>
          <p className="subtitle">Sign up to get started</p>
          
          <form onSubmit={handleEmailSignUp} className="signup-form">
            <div className="input-group">
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                  type="date"
                  name="dob"
                  placeholder="Date of Birth"
                  value={formData.dob}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" strokeWidth="2"/>
                  <path d="M20 21C20 16.0294 16.4183 12 12 12C7.58172 12 4 16.0294 4 21" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              </div>
            </div>

            <div className="input-group">
              <div className="input-wrapper">
                <svg className="input-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"/>
                </svg>
                <input
                  type="email"
                  name="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

<div className="input-group">
  <div className="input-wrapper">
    <input
      type="tel"
      name="phone_number"
      placeholder="Phone Number"
      value={formData.phone_number}
      onChange={handleInputChange}
      required
    />
  </div>
</div>


{formData.emergency_contacts.map((contact, index) => (
  <div key={index} className="emergency-contact-section">
    <input
      type="text"
      placeholder="Emegency Contact Name"
      className="input-field"
      value={contact.name}
      onChange={(e) => handleEmergencyChange(index, 'name', e.target.value)}
    />
    <input
      type="tel"
      placeholder="Emergency Contact Phone"
      className="input-field"
      value={contact.phone}
      onChange={(e) => handleEmergencyChange(index, 'phone', e.target.value)}
    />
    {errors[`emergency_contacts_${index}`] && (
      <div className="error">{errors[`emergency_contacts_${index}`]}</div>
    )}
  </div>
))}
<button
  type="button"
  className="add-contact-button"
  onClick={addEmergencyContact}
>
  + Add Another Contact
</button>

            <button type="submit" className="signup-button">
              Sign up
            </button>
          </form>

          <div className="divider">
            <span>or</span>
          </div>
 
          <div className="login-link">
            <span>Already member? </span>
            <a href="/login">Log in</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
