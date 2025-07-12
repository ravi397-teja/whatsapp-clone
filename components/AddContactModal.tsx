
import React, { useState } from 'react';
import { UserAddIcon } from './icons';

interface AddContactModalProps {
  onClose: () => void;
  onSave: (contact: { name: string; phone: string; avatar: string }) => void;
}

const AddContactModal: React.FC<AddContactModalProps> = ({ onClose, onSave }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatar, setAvatar] = useState('');

  const handleSave = () => {
    if (name.trim()) {
      onSave({ name: name.trim(), phone: phone.trim(), avatar: avatar.trim() });
    }
  };

  const isSaveDisabled = !name.trim();

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm" aria-modal="true" role="dialog" onClick={onClose}>
      <div className="bg-[#2a3942] rounded-xl shadow-2xl p-8 m-4 w-full max-w-sm text-center transform transition-all" onClick={(e) => e.stopPropagation()}>
        <UserAddIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-6">Add New Contact</h2>

        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name *"
          aria-label="Contact Name"
          className="w-full bg-[#111b21] rounded-lg px-4 py-3 mb-3 text-white placeholder-gray-400 focus:outline-none ring-2 ring-transparent focus:ring-[#00a884]"
          autoFocus
        />
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone Number (Optional)"
          aria-label="Contact Phone Number"
          className="w-full bg-[#111b21] rounded-lg px-4 py-3 mb-3 text-white placeholder-gray-400 focus:outline-none ring-2 ring-transparent focus:ring-[#00a884]"
        />
        <input
          type="text"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          placeholder="Avatar Image URL (Optional)"
          aria-label="Contact Avatar URL"
          className="w-full bg-[#111b21] rounded-lg px-4 py-3 mb-4 text-white placeholder-gray-400 focus:outline-none ring-2 ring-transparent focus:ring-[#00a884]"
        />

        <button
          onClick={handleSave}
          disabled={isSaveDisabled}
          className={`w-full bg-[#00a884] rounded-lg py-3 mb-4 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#2a3942] focus:ring-[#00a884] ${isSaveDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#00876a]'}`}
        >
          Save Contact
        </button>

        <button onClick={onClose} className="mt-2 text-sm text-gray-400 hover:text-gray-200">Cancel</button>
      </div>
    </div>
  );
};

export default AddContactModal;
