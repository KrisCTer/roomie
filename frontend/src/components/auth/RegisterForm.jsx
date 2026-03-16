import React, { useState } from 'react';
import Input from '../common/Input';
import PasswordInput from '../common/PasswordInput';
import Button from '../common/Button';

export default function RegisterForm({ onSubmit, onSwitch, loading }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const handleSubmit = (e)=>{
    e.preventDefault();
    onSubmit({ username, email, password, confirm });
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <Input label="User name" name="username" value={username} onChange={setUsername} placeholder="User name" />
      <Input label="Email address" name="email" value={email} onChange={setEmail} placeholder="Email address" />
      <PasswordInput label="Password" name="password" value={password} onChange={setPassword} placeholder="Your password" />
      <PasswordInput label="Confirm password" name="confirm" value={confirm} onChange={setConfirm} placeholder="Confirm password" />
      <Button type="submit" full disabled={loading}>Sign Up</Button>
      <div className="alt">Don’t you have an account? <a onClick={onSwitch}>Sign In</a></div>
    </form>
  );
}
