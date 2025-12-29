import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useSnackbar } from '../context/SnackbarContext';
import { theme } from '../theme';

const Login = ({ setAuthUser }) => {
  const navigate = useNavigate();
  const showSnackbar = useSnackbar();

  const handleLoginSuccess = async (response) => {
    try {
      const res = await axios.post('http://localhost:5000/api/auth/google', {
        token: response.credential,
      }, { withCredentials: true });

      if (res.data.user) {
        showSnackbar("Successfully Logged In!", "success");
        setAuthUser(res.data.user);
      }
    } catch (err) {
      showSnackbar(err.response?.data?.error || "User not authorized in system", "error");
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-orange-50 p-4`}>
      <div className={`max-w-md w-full bg-orange-500 hover:bg-orange-600  rounded-3xl ${theme.cardShadowHover} p-10 text-center border-2 border-orange-50 transition-all duration-300`}>
        <div className="flex justify-center mb-6">
          <div className={`p-4 bg-white rounded-2xl text-orange-500 shadow-lg`}>
            <ShieldCheck size={50} />
          </div>
        </div>

        <h1 className={`text-3xl font-black text-white mb-2 uppercase tracking-tight`}>Asset Management</h1>
        <p className={`text-white mb-10 text-sm font-medium`}>
          Please sign in with your Google account.
        </p>

        <div className="flex justify-center transform scale-110">
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => console.log('Login Failed')}
            useOneTap={false}
            itp_support={true}
          />
        </div>

        <div className={`mt-10 pt-6 border-t ${theme.cardBorder}`}>
          <p className={`text-xs text-white font-bold uppercase tracking-wider`}>
            Admin Access Only
          </p>
          <p className="mt-1 text-xs text-white">
            Only authorized administrators can access this system.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;