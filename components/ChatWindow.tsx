
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { ChatContact, Message } from '../types';
import { sendMessageToBotStream } from '../services/geminiService';
import { MoreIcon, SendIcon, AttachmentIcon, DoubleCheckIcon, CheckIcon, ArrowBackIcon, VideoCallIcon, PhoneCallIcon, EmojiIcon, CameraIcon, MicrophoneIcon } from './icons';

// --- Sub-components defined within ChatWindow for co-location and simplicity ---
interface ChatHeaderProps {
  contact: ChatContact;
  onCloseChat: () => void;
  onStartCall: (type: 'video' | 'audio') => void;
  onSimulateIncomingCall: (contact: ChatContact, type: 'video' | 'audio') => void;
}

const ChatHeader: React.FC<ChatHeaderProps> = ({ contact, onCloseChat, onStartCall, onSimulateIncomingCall }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => setIsMenuOpen(prev => !prev);

  // Close menu if clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <header className="flex items-center p-2.5 bg-[#005e54] h-[60px] text-white relative">
      <button onClick={onCloseChat} className="p-2 -ml-1 text-white hover:bg-white/10 rounded-full" aria-label="Back">
        <ArrowBackIcon className="w-6 h-6" />
      </button>
      <img src={contact.avatar} alt={contact.name} className="w-10 h-10 rounded-full ml-1" />
      <div className="flex-1 ml-4">
        <h2 className="text-base font-medium text-gray-100">{contact.phone || contact.name}</h2>
      </div>
      <div className="flex items-center space-x-2 text-gray-200">
        <button onClick={() => onStartCall('video')} className="p-2 hover:bg-white/10 rounded-full" aria-label="Video call"><VideoCallIcon className="w-6 h-6" /></button>
        <button onClick={() => onStartCall('audio')} className="p-2 hover:bg-white/10 rounded-full" aria-label="Audio call"><PhoneCallIcon className="w-6 h-6" /></button>
        <div className="relative" ref={menuRef}>
            <button onClick={toggleMenu} className="p-2 hover:bg-white/10 rounded-full" aria-label="More options" aria-haspopup="true" aria-expanded={isMenuOpen}>
                <MoreIcon className="w-6 h-6" />
            </button>
            {isMenuOpen && (
                <div className="absolute top-full right-0 mt-2 w-56 bg-[#202c33] rounded-md shadow-lg z-20 py-2">
                    <button
                        onClick={() => { onSimulateIncomingCall(contact, 'video'); setIsMenuOpen(false); }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-[#2a3942]"
                    >
                        Simulate Incoming Video Call
                    </button>
                    <button
                        onClick={() => { onSimulateIncomingCall(contact, 'audio'); setIsMenuOpen(false); }}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-[#2a3942]"
                    >
                        Simulate Incoming Audio Call
                    </button>
                </div>
            )}
        </div>
      </div>
    </header>
  );
}

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.sender === 'user';
  const statusIcon =
    message.status === 'read' ? <DoubleCheckIcon className="text-[#53bdeb] w-4 h-4 ml-1" /> :
    message.status === 'delivered' ? <DoubleCheckIcon className="text-gray-400 w-4 h-4 ml-1" /> :
    message.status === 'sent' ? <CheckIcon className="text-gray-400 w-4 h-4 ml-1" /> :
    null;

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-1.5`}>
      <div className={`rounded-lg px-2.5 py-1.5 max-w-sm md:max-w-md lg:max-w-lg shadow ${isUser ? 'bg-[#005c4b] rounded-tr-sm' : 'bg-[#202c33] rounded-tl-sm'}`}>
        <p className="text-sm text-gray-100 whitespace-pre-wrap">{message.text}</p>
        <div className="flex items-center justify-end mt-1 -mb-1">
          <span className="text-xs text-gray-400/80 mr-1">{message.timestamp}</span>
          {isUser && statusIcon}
        </div>
      </div>
    </div>
  );
};

const ChatPlaceholder: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 bg-[#0b141a]">
        <div className="border-t-4 border-b-4 border-[#25d366] rounded-full w-24 h-24 mb-6"></div>
        <h1 className="text-3xl text-gray-200">Gemini Chat</h1>
        <p className="mt-2 max-w-sm">
            Select a chat to start messaging. Conversations are powered by Google's Gemini API and are not saved.
        </p>
    </div>
);


// --- Main ChatWindow Component ---

interface ChatWindowProps {
  contact: ChatContact | null;
  onNewMessage: (contactId: string, message: Message) => void;
  onCloseChat: () => void;
  onStartCall: (contact: ChatContact, type: 'video' | 'audio') => void;
  onSimulateIncomingCall: (contact: ChatContact, type: 'video' | 'audio') => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ contact, onNewMessage, onCloseChat, onStartCall, onSimulateIncomingCall }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isBotTyping, setIsBotTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contact) {
      setMessages(contact.messages);
    } else {
      setMessages([]);
    }
  }, [contact]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isBotTyping]);
  
  const handleSend = useCallback(async () => {
    if (!input.trim() || !contact) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      sender: 'user',
      status: 'sent',
    };

    setMessages(prev => [...prev, userMessage]);
    onNewMessage(contact.id, userMessage);
    setInput('');
    setIsBotTyping(true);

    const botMessageId = (Date.now() + 1).toString();
    const botMessageTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let fullBotResponse = '';

    const initialBotMessage: Message = {
      id: botMessageId,
      text: '...',
      timestamp: botMessageTimestamp,
      sender: 'bot',
    };
    setMessages(prev => [...prev, initialBotMessage]);

    await sendMessageToBotStream(
      contact,
      input.trim(),
      (chunkText) => {
        fullBotResponse += chunkText;
        setMessages(prev =>
          prev.map(msg =>
            msg.id === botMessageId
              ? { ...msg, text: fullBotResponse }
              : msg
          )
        );
      }
    );
    
    const finalBotMessage: Message = {
      id: botMessageId,
      text: fullBotResponse || "...", // Ensure text is not empty
      timestamp: botMessageTimestamp,
      sender: 'bot',
    };
    
    setMessages(prev => prev.map(msg => msg.id === botMessageId ? finalBotMessage : msg));
    onNewMessage(contact.id, finalBotMessage);
    setIsBotTyping(false);

  }, [input, contact, onNewMessage]);

  if (!contact) {
    return <ChatPlaceholder />;
  }

  const handleStartCall = (type: 'video' | 'audio') => {
    if (contact) {
        onStartCall(contact, type);
    }
  };

  return (
    <main className="flex-1 flex flex-col bg-[#0b141a] bg-[url('https://i.redd.it/qwd83gr4b2581.png')] bg-center">
      <ChatHeader 
        contact={contact} 
        onCloseChat={onCloseChat} 
        onStartCall={handleStartCall}
        onSimulateIncomingCall={onSimulateIncomingCall}
        />
      
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isBotTyping && messages[messages.length-1]?.sender !== 'bot' && (
           <div className="flex justify-start mb-1.5">
             <div className="rounded-lg px-3 py-2 max-w-sm md:max-w-md lg:max-w-lg shadow bg-[#202c33] rounded-tl-sm">
                <p className="text-sm text-gray-400 animate-pulse">typing...</p>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <footer className="bg-[#202c33] px-3 py-2 flex items-center space-x-2">
        <button className="text-gray-400 hover:text-gray-200 p-2" aria-label="Emoji"><EmojiIcon className="w-6 h-6" /></button>
        <div className="flex-1 flex items-center bg-[#2a3942] rounded-full px-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type a message"
              className="flex-1 bg-transparent px-2 py-2.5 text-white placeholder-gray-400 focus:outline-none"
            />
            <button className="text-gray-400 hover:text-gray-200 p-2" aria-label="Attach file"><AttachmentIcon className="w-6 h-6" /></button>
             <button className="text-gray-400 hover:text-gray-200 p-2" aria-label="Camera"><CameraIcon className="w-6 h-6" /></button>
        </div>
        <button
          onClick={handleSend}
          className="bg-[#00a884] rounded-full w-12 h-12 flex items-center justify-center text-white flex-shrink-0 hover:bg-[#00876a] transition-colors"
          aria-label={input.trim() ? 'Send message' : 'Record voice message'}
        >
          {input.trim() ? <SendIcon /> : <MicrophoneIcon />}
        </button>
      </footer>
    </main>
  );
};

export default ChatWindow;
