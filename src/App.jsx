import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from './components/Landing.jsx';
import Home from './components/Home.jsx';
import Signup from './components/Signup.jsx';
import Login from './components/Login.jsx';
import RequestRide from './components/RequestRide.jsx';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
 <Route path="/requestride" element={<RequestRide/>} />

    </Routes>
  );
}

export default App;

