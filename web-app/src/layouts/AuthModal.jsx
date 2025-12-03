import React from 'react';
export default function AuthModal({ title, imageUrl, onClose, children }) {
  return (
    <div className="overlay">
      <div className="modal">
        <button className="close" onClick={onClose}>×</button>
        <div className="modal-body">
          <div className="modal-image"><img src={imageUrl} alt="auth" /></div>
          <div className="modal-content">
            <h2>{title}</h2>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
