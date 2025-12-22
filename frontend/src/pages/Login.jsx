import React from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const Login = ({ setAuthUser }) => {
  const navigate = useNavigate();

  const handleLoginSuccess = async (googleResponse) => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/google', {
        token: googleResponse.credential,
      }, { withCredentials: true }); 

      setAuthUser(response.data.user);
      navigate('/');
    } catch (error) {
      alert(error.response?.data?.error || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        <div className="flex justify-center mb-6">
          <div className="p-3 bg-blue-50 rounded-full text-blue-600">
            <ShieldCheck size={50} />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Asset Management</h1>
        <p className="text-gray-500 mb-8 text-sm">
          Please sign in with yourGoogle account.
        </p>

        <div className="flex justify-center">
          <GoogleLogin
            onSuccess={handleLoginSuccess}
            onError={() => console.log('Login Failed')}
            useOneTap
          />
        </div>

        <p className="mt-8 text-xs text-gray-400">
          Only authorized administrators can access this system.
        </p>
      </div>
    </div>
  );
};

export default Login;