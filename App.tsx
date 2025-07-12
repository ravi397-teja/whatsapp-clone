
import React, { useState, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import PasswordModal from './components/PasswordModal';
import AddContactModal from './components/AddContactModal';
import CallUI from './components/CallUI';
import IncomingCallUI from './components/IncomingCallUI';
import { CONTACTS_DATA } from './constants';
import type { ChatContact, Message } from './types';

function App() {
  const [contacts, setContacts] = useState<ChatContact[]>(CONTACTS_DATA);
  const [activeChatId, setActiveChatId] = useState<string | null>('vonage');
  const [activePhase, setActivePhase] = useState<'Business' | 'Private'>('Business');
  
  const [authRequest, setAuthRequest] = useState<{ contact: ChatContact; mode: 'create' | 'unlock' } | null>(null);
  const [authError, setAuthError] = useState('');

  const [isAddContactModalOpen, setIsAddContactModalOpen] = useState(false);

  const [callState, setCallState] = useState<{
    contact: ChatContact;
    type: 'video' | 'audio';
  } | null>(null);

  const [incomingCall, setIncomingCall] = useState<{
    contact: ChatContact;
    type: 'video' | 'audio';
  } | null>(null);


  const handleStartCall = useCallback((contact: ChatContact, type: 'video' | 'audio') => {
    setCallState({ contact, type });
  }, []);

  const handleEndCall = useCallback(() => {
    setCallState(null);
  }, []);

  const handleSimulateIncomingCall = useCallback((contact: ChatContact, type: 'video' | 'audio') => {
    setIncomingCall({ contact, type });
  }, []);

  const handleAcceptIncomingCall = useCallback(() => {
    if (incomingCall) {
      setCallState({ contact: incomingCall.contact, type: incomingCall.type });
      setIncomingCall(null);
    }
  }, [incomingCall]);

  const handleDeclineIncomingCall = useCallback(() => {
    setIncomingCall(null);
  }, []);


  const openChat = useCallback((id: string) => {
    setActiveChatId(id);
    // Mark messages as read
    setContacts(prevContacts => prevContacts.map(c => 
      c.id === id ? { ...c, unreadCount: 0 } : c
    ));
    setAuthRequest(null);
  }, []);

  const handleCloseChat = useCallback(() => {
    setActiveChatId(null);
  }, []);
  
  const handleContactSelect = useCallback((contact: ChatContact) => {
    if (contact.id === activeChatId) return;

    // Reset unread count when opening a chat
    setContacts(prevContacts => prevContacts.map(c => 
      c.id === contact.id ? { ...c, unreadCount: 0 } : c
    ));
    
    if (contact.category === 'Business') {
      setActiveChatId(contact.id); // Open business chats directly
      setAuthRequest(null); // Ensure modal is closed
    } else { // It's Private
      const password = localStorage.getItem(`whatsapp_clone_password_${contact.id}`);
      if (password) {
        setAuthRequest({ contact, mode: 'unlock' });
      } else {
        setAuthRequest({ contact, mode: 'create' });
      }
    }
  }, [activeChatId]);

  const handleAuthSuccess = useCallback(() => {
    if (authRequest) {
      openChat(authRequest.contact.id);
    }
  }, [authRequest, openChat]);
  
  const handleAuthClose = useCallback(() => {
    setAuthRequest(null);
  }, []);

  const handlePasswordReset = useCallback(() => {
    if (!authRequest) return;
    
    const contactId = authRequest.contact.id;

    setContacts(prevContacts =>
      prevContacts.map(c =>
        c.id === contactId
          ? {
              ...c,
              messages: [],
              lastMessage: 'Password reset. Chat cleared.',
              lastMessageTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              unreadCount: 0,
            }
          : c
      )
    );
    
    setAuthRequest(null);
    if (activeChatId === contactId) {
        setActiveChatId(null);
    }

  }, [authRequest, activeChatId]);

  const handleNewMessage = useCallback((contactId: string, message: Message) => {
      setContacts(prevContacts => {
          const newContacts = [...prevContacts];
          const contactIndex = newContacts.findIndex(c => c.id === contactId);
          if (contactIndex !== -1) {
              const updatedContact = { ...newContacts[contactIndex] };
              
              const messageExists = updatedContact.messages.some(m => m.id === message.id);
              if (messageExists) {
                  // Update existing message (for streaming)
                  updatedContact.messages = updatedContact.messages.map(m => m.id === message.id ? message : m);
              } else {
                  // Add new message
                  updatedContact.messages = [...updatedContact.messages, message];
              }

              updatedContact.lastMessage = message.text;
              updatedContact.lastMessageTimestamp = message.timestamp;
              
              if (message.sender === 'bot' && activeChatId !== contactId) {
                  updatedContact.unreadCount = (updatedContact.unreadCount || 0) + 1;
              }

              newContacts[contactIndex] = updatedContact;
              
              // Move updated contact to the top
              const [movedContact] = newContacts.splice(contactIndex, 1);
              newContacts.unshift(movedContact);

              return newContacts;
          }
          return prevContacts;
      });
  }, [activeChatId]);

  const handlePhaseChange = (phase: 'Business' | 'Private') => {
    setActivePhase(phase);

    const currentActiveContact = contacts.find(c => c.id === activeChatId);
    if (currentActiveContact && currentActiveContact.category !== phase) {
        setActiveChatId(null);
    }
  };

  const handleAddNewContact = (newContactData: { name: string; phone: string; avatar: string }) => {
    const newContact: ChatContact = {
      id: `contact_${Date.now()}`,
      name: newContactData.name,
      phone: newContactData.phone || '',
      avatar: newContactData.avatar || `https://i.pravatar.cc/150?u=${Date.now()}`,
      lastMessage: 'Chat created. Say hi!',
      lastMessageTimestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      unreadCount: 0,
      messages: [],
      category: 'Private', // New contacts are private and will require a password
    };

    setContacts(prevContacts => [newContact, ...prevContacts]);
    setIsAddContactModalOpen(false);
    setActivePhase('Private');
    handleContactSelect(newContact);
  };

  const openAddContactModal = () => setIsAddContactModalOpen(true);
  const closeAddContactModal = () => setIsAddContactModalOpen(false);

  const activeContact = contacts.find(c => c.id === activeChatId) || null;

  return (
    <div className="flex h-screen font-sans antialiased text-white bg-[#090e11]">
      <Sidebar 
        contacts={contacts} 
        activeChatId={activeChatId} 
        onContactSelect={handleContactSelect}
        activePhase={activePhase}
        onPhaseChange={handlePhaseChange}
        onOpenAddContactModal={openAddContactModal}
      />
      <ChatWindow 
        key={activeChatId}
        contact={activeContact} 
        onNewMessage={handleNewMessage}
        onCloseChat={handleCloseChat}
        onStartCall={handleStartCall}
        onSimulateIncomingCall={handleSimulateIncomingCall}
      />
      {authRequest && (
        <PasswordModal 
          mode={authRequest.mode}
          contact={authRequest.contact}
          error={authError}
          onClose={handleAuthClose}
          onSuccess={handleAuthSuccess}
          onReset={handlePasswordReset}
          setAuthError={setAuthError}
        />
      )}
      {isAddContactModalOpen && (
        <AddContactModal 
          onClose={closeAddContactModal}
          onSave={handleAddNewContact}
        />
      )}
       {incomingCall && (
        <IncomingCallUI
          contact={incomingCall.contact}
          type={incomingCall.type}
          onAccept={handleAcceptIncomingCall}
          onDecline={handleDeclineIncomingCall}
        />
      )}
      {callState && (
        <CallUI
            contact={callState.contact}
            type={callState.type}
            onEndCall={handleEndCall}
        />
      )}
    </div>
  );
}

export default App;