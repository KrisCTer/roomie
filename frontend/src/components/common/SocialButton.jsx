import React from 'react';
export default function SocialButton({ provider='Google', onClick }) {
  return <button type="button" className="social" onClick={onClick}>{provider}</button>;
}
