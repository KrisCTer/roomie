import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../layouts/AuthModal';
import LoginForm from '../components/auth/LoginForm';
import { login } from '../services/authService';

export default function LoginPage(){
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (payload) => {
    setLoading(true); setError('');
    try {
      const data = await login(payload);
      if (data?.accessToken) localStorage.setItem('access_token', data.accessToken);
      nav('/');
    } catch (e) {
      setError(e?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthModal title="Login" imageUrl="https://images.unsplash.com/photo-1501183638710-841dd1904471?q=80&w=1200&auto=format&fit=crop" onClose={()=>nav(-1)}>
      {error && <div className="error">{error}</div>}
      <LoginForm onSubmit={handleLogin} onSwitch={()=>nav('/register')} loading={loading} />
    </AuthModal>
  );
}
