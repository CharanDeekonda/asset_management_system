import { useEffect } from 'react';
import React, { useState } from 'react';
import { Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './pages/Login';
import AssetsLanding from './pages/AssetsLanding';
import UserManagement from './pages/UserManagement';
import { useConfirm } from './context/ConfirmContext';
import { useSnackbar } from './context/SnackbarContext';
import AssetDetails from './pages/AssetDetails';
import AssetHistory from './pages/AssetHistory';
import AssetDeepView from './pages/AssetDeepView';
import { theme } from './theme';
import mylogo from './assets/logo1.jpeg';
function App() {
  const [authUser, setAuthUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const askConfirmation = useConfirm();
  const showSnackbar = useSnackbar();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/auth/me', { withCredentials: true });
        if (res.data.user) {
          setAuthUser(res.data.user);
        }
      } catch (err) {
        setAuthUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  const handleLogout = () => {
    askConfirmation(
      "Confirm Logout",
      "Are you sure you want to logout?",
      async () => {
        try {
          await axios.post('http://localhost:5000/api/auth/logout', {}, { withCredentials: true });
          setAuthUser(null);
          showSnackbar("Logged out successfully", "success");
        } catch (err) {
          console.error("Logout failed", err);
          showSnackbar("Error during logout", "error");
        }
      }
    );
  };

  if (loading) {
    return (
      <div className={`min-h-screen ${theme.pageBg} flex items-center justify-center`}>
        <div className={`${theme.statusRepairs} font-bold animate-pulse`}>Authenticating...</div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <Routes>
        <Route path="/login" element={<Login setAuthUser={setAuthUser} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <div className={`min-h-screen ${theme.pageBg} flex flex-col`}>
      <nav className={`${theme.navBg} ${theme.cardShadow} border-b ${theme.navBorder} px-6 py-4  flex items-center justify-between sticky top-0 z-50`}>
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 border-r border-orange-500/50">
            <div className="bg-white p-0.5 rounded shadow-sm flex items-center justify-center overflow-hidden">
              <img
              src={mylogo}
                alt="Logo"
                className="h-12 w-12 object-contain"
              />
            </div>
          </div>
          <div className={`flex bg-orange-700/40 p-1 rounded-xl border ${theme.navBorder}`}>
            <Link
              to="/"
              className={`px-6 py-2 rounded-lg font-bold transition-all ${location.pathname === '/' || location.pathname.startsWith('/assets')
                ? theme.navActive
                : theme.navInactive
                }`}
            >
              Assets
            </Link>
            <Link
              to="/users"
              className={`px-6 py-2 rounded-lg font-bold transition-all ${location.pathname === '/users'
                ? theme.navActive
                : theme.navInactive
                }`}
            >
              User Management
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <span className={`text-sm ${theme.navText} hidden sm:block opacity-90`}>
            Welcome, <span className="font-bold text-white">{authUser.name}</span>
          </span>
          <button
            onClick={handleLogout}
            className={`${theme.navText} font-bold bg-orange-700/50 hover:bg-white hover:text-orange-600 px-5 py-2 rounded-lg transition-all border ${theme.navBorder} shadow-sm`}
          >
            Logout
          </button>
        </div>
      </nav>
      <main className="flex-grow overflow-auto">
        <Routes>
          <Route path="/" element={<AssetsLanding />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/assets/:typeName" element={<AssetDetails />} />
          <Route path="/assets/history/:assetId" element={<AssetHistory />} />
          <Route path="/assets/deep-view/:assetId/:empId" element={<AssetDeepView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;