import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import UserManagement from './pages/UserManagement';
import AssetsLanding from './pages/AssetsLanding';

function App() {
  const [authUser, setAuthUser] = useState(null); 
  if (!authUser) {
    return (
      <Routes>
        <Route path="/login" element={<Login setAuthUser={setAuthUser} />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={<AssetsLanding />} />
        <Route path="/users" element={<UserManagement />} />
      </Routes>
    </div>
  );
}

export default App;