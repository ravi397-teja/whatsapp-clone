import React, { useEffect, useRef, useState } from 'react';
import type { ChatContact } from '../types';
import { 
    HangUpIcon, 
    MicrophoneIcon, 
    VideoCallIcon, 
    UserAddIcon,
    MicrophoneOffIcon,
    CameraOffIcon,
    SpeakerphoneIcon
} from './icons';

interface CallUIProps {
  contact: ChatContact;
  type: 'video' | 'audio';
  onEndCall: () => void;
}

interface ControlButtonProps {
    icon: React.ReactElement<{ className?: string }>;
    label: string;
    onClick: () => void;
    toggled?: boolean;
    disabled?: boolean;
}

const ControlButton: React.FC<ControlButtonProps> = ({ icon, label, onClick, toggled = false, disabled = false }) => (
    <div className="flex flex-col items-center space-y-2">
        <button 
            onClick={onClick} 
            disabled={disabled}
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 transform hover:scale-110
                ${toggled ? 'bg-white text-black' : 'bg-white/20 text-white hover:bg-white/30'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            aria-pressed={toggled}
            aria-label={`${label} ${toggled ? 'on' : 'off'}`}
        >
            {React.cloneElement(icon, { className: "w-8 h-8" })}
        </button>
        <span className="text-sm text-white/90 font-medium">{label}</span>
    </div>
);


const CallUI: React.FC<CallUIProps> = ({ contact, type, onEndCall }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const [status, setStatus] = useState('Ringing...');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(type === 'video');
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // A stock video to simulate the other person in the call for a "real" feel
  const remoteVideoStreamUrl = 'https://videos.pexels.com/video-files/4559864/4559864-hd.mp4';

  useEffect(() => {
    let mediaStream: MediaStream | null = null;
    
    const startMedia = async () => {
        try {
            const constraints = {
                video: type === 'video',
                audio: true,
            };
            mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(mediaStream);

            if (localVideoRef.current && type === 'video') {
                localVideoRef.current.srcObject = mediaStream;
            }
            // Simulate call connecting after a delay
            const connectTimeout = setTimeout(() => {
                setIsConnected(true);
                setStatus('00:01');
                 if (remoteVideoRef.current && type === 'video') {
                   remoteVideoRef.current.play().catch(e => console.error("Remote video play failed", e));
                }
            }, 2500);

            return () => clearTimeout(connectTimeout);
        } catch (err) {
            console.error('Error accessing media devices.', err);
            setStatus('Call Failed');
            const failTimeout = setTimeout(onEndCall, 2000);
            return () => clearTimeout(failTimeout);
        }
    };

    startMedia();

    return () => {
        // Stop all tracks when the component unmounts
        mediaStream?.getTracks().forEach(track => track.stop());
    };
  }, [type, onEndCall]);

  // Timer simulation
  useEffect(() => {
    if (isConnected) {
        const interval = setInterval(() => {
            setStatus(prevStatus => {
                if (!prevStatus.includes(':')) return prevStatus;
                const parts = prevStatus.split(':').map(Number);
                const seconds = parts[0] * 60 + parts[1];
                const newSeconds = seconds + 1;
                const min = Math.floor(newSeconds / 60).toString().padStart(2, '0');
                const sec = (newSeconds % 60).toString().padStart(2, '0');
                return `${min}:${sec}`;
            });
        }, 1000);
        return () => clearInterval(interval);
    }
  }, [isConnected]);
  
  const handleEndCall = () => {
    stream?.getTracks().forEach(track => track.stop());
    onEndCall();
  };
  
  const toggleMute = () => {
    if (stream) {
        stream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
        setIsMuted(prev => !prev);
    }
  };

  const toggleCamera = () => {
    if (stream && type === 'video') {
        stream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
        setIsCameraOn(prev => !prev);
    }
  };
  
  const toggleSpeaker = () => setIsSpeakerOn(prev => !prev);

  const showRemoteVideo = type === 'video' && isConnected;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-between text-white bg-gray-900">
       {/* Background: Remote video or contact avatar */}
       {showRemoteVideo ? (
        <video 
            ref={remoteVideoRef}
            src={remoteVideoStreamUrl} 
            loop 
            muted
            className="absolute inset-0 w-full h-full object-cover" 
        />
      ) : (
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${contact.avatar})` }} />
      )}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-lg"></div>
      
      {/* User's video feed (PiP) */}
      {type === 'video' && (
         <div className="absolute top-4 right-4 w-24 h-36 rounded-lg border-2 border-gray-500/50 md:w-32 md:h-48 z-20 bg-black overflow-hidden shadow-2xl">
            {isCameraOn && stream ? (
                <video ref={localVideoRef} autoPlay muted className="w-full h-full object-cover"></video>
            ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800">
                    <img src={'https://picsum.photos/seed/user-avatar/40/40'} alt="Your avatar" className="w-10 h-10 rounded-full" />
                    <span className="text-xs text-gray-300 mt-2 text-center">Camera Off</span>
                </div>
            )}
        </div>
      )}

      {/* Contact Info */}
      <div className="relative z-10 flex flex-col items-center pt-20 text-center">
        <div className="h-40 flex items-center justify-center">
            <img 
              src={contact.avatar} 
              alt={contact.name} 
              className="w-32 h-32 rounded-full border-4 border-gray-500 shadow-lg transition-opacity duration-500"
              style={{ opacity: showRemoteVideo ? 0 : 1 }}
            />
        </div>
        <h1 className="text-4xl font-bold" style={{textShadow: '0 2px 10px rgba(0,0,0,0.5)'}}>{contact.name}</h1>
        <p className="text-lg text-gray-200 mt-2 tracking-wider">{status}</p>
      </div>


      {/* Call Controls */}
      <div className="relative z-10 w-full flex flex-col items-center gap-8 mb-16">
        <div className="flex justify-center items-center space-x-5">
            <ControlButton icon={<SpeakerphoneIcon />} label="Speaker" toggled={isSpeakerOn} onClick={toggleSpeaker} />
            <ControlButton icon={isMuted ? <MicrophoneOffIcon /> : <MicrophoneIcon />} label="Mute" toggled={isMuted} onClick={toggleMute} />
            <ControlButton icon={isCameraOn ? <VideoCallIcon /> : <CameraOffIcon />} label="Video" toggled={isCameraOn} onClick={toggleCamera} disabled={type !== 'video'}/>
            <ControlButton icon={<UserAddIcon />} label="Add" onClick={() => alert('This feature is for demonstration only.')} />
        </div>
        <button onClick={handleEndCall} className="bg-red-600 rounded-full w-20 h-20 flex items-center justify-center hover:bg-red-700 transition-transform transform hover:scale-110 shadow-lg" aria-label="End call">
            <HangUpIcon className="w-10 h-10 text-white" />
        </button>
      </div>
    </div>
  );
};

export default CallUI;
