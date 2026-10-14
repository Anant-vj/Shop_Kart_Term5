import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Register from './pages/Register';
import Login from './pages/Login';
import Home from './pages/Home';
import { getProfile } from './services/api';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  // Check initial login status when the app loads
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await getProfile();
        setCurrentUser(user);
      } catch (err) {
        // Not logged in or expired cookie
        setCurrentUser(null);
      }
    };
    checkAuth();
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  return (
    <BrowserRouter>
      <div className="app-layout">
        <Navbar currentUser={currentUser} onLogout={handleLogout} />
        <main>
          <Routes>
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
            <Route
              path="/home"
              element={<Home onUserLoaded={(user) => setCurrentUser(user)} />}
            />
            {/* Default Route redirects to /home */}
            <Route path="/" element={<Navigate to="/home" replace />} />
            {/* Catch-all unknown routes */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
