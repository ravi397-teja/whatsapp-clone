
import type { ChatContact } from './types';

export const CONTACTS_DATA: ChatContact[] = [
  {
    id: 'vonage',
    name: 'Vonage API',
    avatar: 'https://www.vectorlogo.zone/logos/vonage/vonage-icon.svg',
    phone: '+1 (415) 738-6170',
    lastMessage: "🥑 Welcome, what's wrong?",
    lastMessageTimestamp: '14:44',
    unreadCount: 0,
    messages: [
       { id: 'msg-a1', text: '🌳 - Hello! Can you help me please', sender: 'bot', timestamp: '14:42' },
       { id: 'msg-a2', text: '🥑 - Hello, I need help', sender: 'bot', timestamp: '14:42' },
       { id: 'msg-a3', text: '🏡 - Hey can you give me a hand with something?', sender: 'bot', timestamp: '14:42' },
       { id: 'msg-u1', text: '🎪Sure what can I help with?', sender: 'user', timestamp: '14:43', status: 'read' },
       { id: 'msg-u2', text: '🌳Hello, what can we help you with?', sender: 'user', timestamp: '14:43', status: 'read' },
       { id: 'msg-a4', text: '🌳 - I tried applying a referral code and just got an error message.', sender: 'bot', timestamp: '14:43' },
       { id: 'msg-u3', text: "🏡I would like to try! What's up?", sender: 'user', timestamp: '14:43', status: 'read' },
       { id: 'msg-a5', text: '🎪 - I need a solution for sending WhatsApp, SMS, Viber, and Facebook messages without too much code - do you have any ideas?', sender: 'bot', timestamp: '14:44' },
       { id: 'msg-u4', text: "🥑Welcome, what's wrong?", sender: 'user', timestamp: '14:44', status: 'read' },
    ],
    category: 'Business',
  },
  {
    id: '2',
    name: 'Sarah Chen',
    avatar: 'https://picsum.photos/seed/sarah-chen/200/200',
    lastMessage: 'See you then!',
    lastMessageTimestamp: '9:30 AM',
    unreadCount: 0,
    messages: [
      {
        id: 'msg3',
        text: 'Hey, are we still on for lunch tomorrow?',
        sender: 'bot',
        timestamp: 'Yesterday',
      },
      {
        id: 'msg4',
        text: 'Yes! 12:30 at The usual spot.',
        sender: 'user',
        timestamp: 'Yesterday',
      },
       {
        id: 'msg5',
        text: 'See you then!',
        sender: 'bot',
        timestamp: '9:30 AM',
      },
    ],
    category: 'Private',
  },
  {
    id: '3',
    name: 'Project Phoenix',
    avatar: 'https://picsum.photos/seed/project-phoenix/200/200',
    lastMessage: "I've pushed the latest updates to the main branch.",
    lastMessageTimestamp: 'Yesterday',
    unreadCount: 5,
    messages: [
        {
            id: 'msg6',
            text: "I've pushed the latest updates to the main branch.",
            sender: 'bot',
            timestamp: 'Yesterday'
        }
    ],
    category: 'Business',
  },
  {
    id: '4',
    name: 'Mom',
    avatar: 'https://picsum.photos/seed/mom/200/200',
    lastMessage: '❤️',
    lastMessageTimestamp: 'Yesterday',
    unreadCount: 0,
     messages: [
        {
            id: 'msg7',
            text: "Don't forget to call your grandparents!",
            sender: 'bot',
            timestamp: 'Yesterday'
        },
        {
            id: 'msg8',
            text: "I won't!",
            sender: 'user',
            timestamp: 'Yesterday'
        },
        {
            id: 'msg9',
            text: "❤️",
            sender: 'bot',
            timestamp: 'Yesterday'
        }
    ],
    category: 'Private',
  },
  {
    id: '5',
    name: 'Alex "The Coder" Gonzalez',
    avatar: 'https://picsum.photos/seed/alex-gonzalez/200/200',
    lastMessage: 'Just solved that tricky bug. Finally!',
    lastMessageTimestamp: 'Wednesday',
    unreadCount: 0,
     messages: [
        {
            id: 'msg10',
            text: 'Just solved that tricky bug. Finally!',
            sender: 'bot',
            timestamp: 'Wednesday'
        }
    ],
    category: 'Business',
  },
];