import React, { useState, useEffect } from 'react';
import type { ChatContact } from '../types';
import { LockIcon, FingerprintIcon } from './icons';

interface PasswordModalProps {
  mode: 'create' | 'unlock';
  contact: ChatContact;
  error: string;
  onClose: () => void;
  onSuccess: () => void;
  onReset: () => void;
  setAuthError: (error: string) => void;
}

const PasswordModal: React.FC<PasswordModalProps> = ({ mode, contact, error, onClose, onSuccess, onReset, setAuthError }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const storageKey = `whatsapp_clone_password_${contact.id}`;

  useEffect(() => {
    // Clear any previous errors when the modal opens or contact changes
    setAuthError('');
  }, [contact, mode, setAuthError]);

  const handleCreate = () => {
    if (!password || !confirmPassword) {
      setAuthError('Both password fields are required.');
      return;
    }
    if (password !== confirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }
    localStorage.setItem(storageKey, password);
    onSuccess();
  };

  const handleUnlock = () => {
    const storedPassword = localStorage.getItem(storageKey);
    if (password === storedPassword) {
      onSuccess();
    } else {
      setAuthError('Incorrect password. Please try again.');
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      mode === 'create' ? handleCreate() : handleUnlock();
    }
  };

  const handleReset = () => {
    const isConfirmed = window.confirm(
      `Are you sure you want to reset the password for "${contact.name}"?\n\nThis will permanently delete all messages in this chat.`
    );
    if (isConfirmed) {
      localStorage.removeItem(storageKey);
      onReset();
    }
  };

  // Simulate fingerprint unlock for convenience
  const handleFingerprint = () => {
    // In create mode, this is not a valid action.
    if(mode === 'unlock') {
        onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm" aria-modal="true" role="dialog">
      <div className="bg-[#2a3942] rounded-xl shadow-2xl p-8 m-4 w-full max-w-sm text-center transform transition-all" onClick={(e) => e.stopPropagation()}>
        <LockIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">
            {mode === 'create' ? 'Set Password for' : 'Unlock Chat with'}
        </h2>
        <p className="text-gray-300 font-semibold text-lg mb-6">{contact.name}</p>

        {mode === 'create' ? (
          <>
            <p className="mb-4 text-sm text-gray-400">Create a password to protect this chat.</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="New Password"
              aria-label="New Password"
              className="w-full bg-[#111b21] rounded-lg px-4 py-3 mb-3 text-white placeholder-gray-400 focus:outline-none ring-2 ring-transparent focus:ring-[#00a884]"
            />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Confirm Password"
              aria-label="Confirm Password"
              className="w-full bg-[#111b21] rounded-lg px-4 py-3 mb-4 text-white placeholder-gray-400 focus:outline-none ring-2 ring-transparent focus:ring-[#00a884]"
            />
          </>
        ) : (
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Password"
            aria-label="Password"
            autoFocus
            className="w-full bg-[#111b21] rounded-lg px-4 py-3 mb-4 text-white placeholder-gray-400 focus:outline-none ring-2 ring-transparent focus:ring-[#00a884]"
          />
        )}

        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        
        <button
          onClick={mode === 'create' ? handleCreate : handleUnlock}
          className="w-full bg-[#00a884] rounded-lg py-3 mb-4 text-white font-semibold hover:bg-[#00876a] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#2a3942] focus:ring-[#00a884]"
        >
          {mode === 'create' ? 'Set Password' : 'Unlock'}
        </button>
        
        {mode === 'unlock' && (
             <>
                <div className="flex items-center my-2">
                    <div className="flex-grow border-t border-gray-600"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-xs uppercase">Or</span>
                    <div className="flex-grow border-t border-gray-600"></div>
                </div>
                
                <button onClick={handleFingerprint} className="flex flex-col items-center justify-center text-gray-400 hover:text-white transition-colors mt-2 w-full">
                    <FingerprintIcon className="w-12 h-12 text-gray-500 hover:text-gray-400" />
                    <span className="text-sm mt-1">Unlock with Fingerprint</span>
                </button>
                <button onClick={handleReset} className="text-xs text-gray-500 hover:text-red-400 mt-4 underline">
                    Forgot Password?
                </button>
             </>
        )}
        <button onClick={onClose} className="mt-6 text-sm text-gray-400 hover:text-gray-200">Cancel</button>
      </div>
    </div>
  );
};

export default PasswordModal;