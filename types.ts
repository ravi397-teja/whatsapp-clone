
export type MessageSender = 'user' | 'bot';

export interface Message {
  id: string;
  text: string;
  timestamp: string;
  sender: MessageSender;
  status?: 'sending' | 'sent' | 'delivered' | 'read';
}

export interface ChatContact {
  id: string;
  name: string;
  avatar: string;
  phone?: string;
  lastMessage: string;
  lastMessageTimestamp: string;
  unreadCount: number;
  messages: Message[];
  category: 'Business' | 'Private';
}