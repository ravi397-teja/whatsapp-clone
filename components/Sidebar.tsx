
import React from 'react';
import type { ChatContact } from '../types';
import { CommunityIcon, StatusIcon, NewChatIcon, MoreIcon, SearchIcon, FilterIcon } from './icons';

interface ChatItemProps {
  contact: ChatContact;
  isActive: boolean;
  onSelect: (contact: ChatContact) => void;
}

const ChatItem: React.FC<ChatItemProps> = ({ contact, isActive, onSelect }) => (
  <li
    onClick={() => onSelect(contact)}
    className={`flex items-center space-x-3 p-3 cursor-pointer border-b border-gray-700/50 hover:bg-[#202c33] ${isActive ? 'bg-[#2a3942]' : ''}`}
    aria-current={isActive}
  >
    <img src={contact.avatar} alt={contact.name} className="w-12 h-12 rounded-full" />
    <div className="flex-1 min-w-0">
      <div className="flex justify-between items-center">
        <p className="text-base font-medium text-gray-100 truncate">{contact.name}</p>
        <p className={`text-xs ${contact.unreadCount > 0 ? 'text-[#00a884]' : 'text-gray-400'}`}>
          {contact.lastMessageTimestamp}
        </p>
      </div>
      <div className="flex justify-between items-center mt-1">
        <p className="text-sm text-gray-400 truncate">{contact.lastMessage}</p>
        {contact.unreadCount > 0 && (
          <span className="bg-[#00a884] text-xs text-black rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {contact.unreadCount}
          </span>
        )}
      </div>
    </div>
  </li>
);


interface SidebarProps {
  contacts: ChatContact[];
  activeChatId: string | null;
  onContactSelect: (contact: ChatContact) => void;
  activePhase: 'Business' | 'Private';
  onPhaseChange: (phase: 'Business' | 'Private') => void;
  onOpenAddContactModal: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ contacts, activeChatId, onContactSelect, activePhase, onPhaseChange, onOpenAddContactModal }) => {
  const filteredContacts = contacts.filter(c => c.category === activePhase);

  return (
    <aside className="w-[30%] min-w-[350px] max-w-[500px] h-screen bg-[#111b21] flex flex-col border-r border-gray-700/50">
      <header className="flex items-center justify-between p-3 bg-[#202c33] h-[60px]">
        <img src="https://picsum.photos/seed/user-avatar/40/40" alt="My Avatar" className="w-10 h-10 rounded-full" />
        <div className="flex items-center space-x-4 text-gray-400">
          <button className="hover:text-gray-200" aria-label="Communities"><CommunityIcon className="w-6 h-6" /></button>
          <button className="hover:text-gray-200" aria-label="Status"><StatusIcon className="w-6 h-6" /></button>
          <button onClick={onOpenAddContactModal} className="hover:text-gray-200" aria-label="Add New Contact"><NewChatIcon className="w-6 h-6" /></button>
          <button className="hover:text-gray-200" aria-label="More Options"><MoreIcon className="w-6 h-6" /></button>
        </div>
      </header>

      <div className="p-2 bg-[#111b21]">
        <div className="flex items-center bg-[#202c33] rounded-lg px-3">
          <label htmlFor="search-chat" className="sr-only">Search or start new chat</label>
          <SearchIcon className="text-gray-400 w-5 h-5" />
          <input
            id="search-chat"
            type="text"
            placeholder="Search or start new chat"
            className="w-full bg-transparent p-2 text-white placeholder-gray-400 focus:outline-none"
          />
          <button aria-label="Filter unread chats"><FilterIcon className="text-gray-400 w-5 h-5" /></button>
        </div>
      </div>
      
      <div className="flex bg-[#111b21]">
        <button
          onClick={() => onPhaseChange('Business')}
          aria-pressed={activePhase === 'Business'}
          className={`w-1/2 py-2 text-center text-sm font-medium uppercase tracking-wider ${
            activePhase === 'Business'
              ? 'text-[#00a884] border-b-2 border-[#00a884]'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Business
        </button>
        <button
          onClick={() => onPhaseChange('Private')}
           aria-pressed={activePhase === 'Private'}
          className={`w-1/2 py-2 text-center text-sm font-medium uppercase tracking-wider ${
            activePhase === 'Private'
              ? 'text-[#00a884] border-b-2 border-[#00a884]'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Private
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
          <ul>
            {filteredContacts.map((contact) => (
              <ChatItem
                key={contact.id}
                contact={contact}
                isActive={contact.id === activeChatId}
                onSelect={onContactSelect}
              />
            ))}
          </ul>
      </div>
    </aside>
  );
};

export default Sidebar;