import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../layouts/AuthModal';
import RegisterForm from '../components/auth/RegisterForm';
import { register as registerApi } from '../services/authService';

export default function RegisterPage(){
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async ({ username, email, password, confirm }) => {
    setLoading(true); setError('');
    try {
      if (password !== confirm) { setError('Passwords do not match'); setLoading(false); return; }
      await registerApi({ username, email, password });
      nav('/login');
    } catch (e) {
      setError(e?.response?.data?.message || 'Register failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthModal title="Register" imageUrl="https://images.unsplash.com/photo-1505691723518-36a5ac3b2d95?q=80&w=1200&auto=format&fit=crop" onClose={()=>nav(-1)}>
      {error && <div className="error">{error}</div>}
      <RegisterForm onSubmit={handleRegister} onSwitch={()=>nav('/login')} loading={loading} />
    </AuthModal>
  );
}
