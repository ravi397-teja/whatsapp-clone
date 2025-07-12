
import React, { useEffect } from 'react';
import type { ChatContact } from '../types';
import { HangUpIcon, PhoneCallIcon } from './icons';

interface IncomingCallUIProps {
  contact: ChatContact;
  type: 'video' | 'audio';
  onAccept: () => void;
  onDecline: () => void;
}

const IncomingCallUI: React.FC<IncomingCallUIProps> = ({ contact, type, onAccept, onDecline }) => {

  useEffect(() => {
    // Vibrate for 1s on, 1s off, on loop
    if ('vibrate' in navigator) {
      navigator.vibrate([1000, 1000, 1000, 1000, 1000]);
    }
    
    // Cleanup vibration on component unmount
    return () => {
       if ('vibrate' in navigator) {
        navigator.vibrate(0);
      }
    };
  }, []);


  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between text-white bg-gray-800" style={{ backgroundImage: `url(${contact.avatar})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md"></div>
      
      {/* Ringing sound */}
      <audio src="https://actions.google.com/sounds/v1/alarms/digital_watch_alarm_long.ogg" autoPlay loop></audio>

      {/* Contact Info */}
      <div className="relative z-10 flex flex-col items-center pt-24 text-center">
        <img src={contact.avatar} alt={contact.name} className="w-32 h-32 rounded-full border-4 border-gray-500 shadow-lg animate-pulse" />
        <h1 className="text-4xl font-bold mt-6 text-shadow-lg">{contact.name}</h1>
        <p className="text-lg text-gray-200 mt-2 tracking-wider">
            Incoming {type} call...
        </p>
      </div>

      {/* Call Controls */}
      <div className="relative z-10 w-full flex justify-around items-center mb-16 px-8 max-w-md">
        <div className="flex flex-col items-center">
            <button onClick={onDecline} className="bg-red-600 rounded-full w-20 h-20 flex items-center justify-center hover:bg-red-700 transition-transform transform hover:scale-110 shadow-lg" aria-label="Decline call">
                <HangUpIcon className="w-10 h-10 text-white" />
            </button>
            <span className="mt-3 text-lg">Decline</span>
        </div>
        <div className="flex flex-col items-center">
            <button onClick={onAccept} className="bg-green-600 rounded-full w-20 h-20 flex items-center justify-center hover:bg-green-700 transition-transform transform hover:scale-110 shadow-lg" aria-label="Accept call">
                <PhoneCallIcon className="w-10 h-10 text-white" />
            </button>
            <span className="mt-3 text-lg">Accept</span>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallUI;
