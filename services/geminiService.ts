
import { GoogleGenAI, Chat } from "@google/genai";
import type { ChatContact } from '../types';

if (!process.env.API_KEY) {
  console.error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const chatSessions: Map<string, Chat> = new Map();

function getChatSession(contact: ChatContact): Chat {
  if (!chatSessions.has(contact.id)) {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: `You are ${contact.name}, a friend of the user. Your personality should reflect your name. For example if the name is 'Mom', you are their mother. If the name is a work colleague, you are professional but friendly. Your goal is to have a natural, text-message like conversation. Keep your replies very concise, like a real text message. Use emojis occasionally. Do not use markdown formatting.`,
      },
      // Pre-seed the chat with existing history
      history: contact.messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }))
    });
    chatSessions.set(contact.id, chat);
  }
  return chatSessions.get(contact.id)!;
}

export async function sendMessageToBotStream(
  contact: ChatContact,
  message: string,
  onChunk: (chunkText: string) => void
): Promise<void> {
  try {
    const chat = getChatSession(contact);
    const result = await chat.sendMessageStream({ message });

    for await (const chunk of result) {
      if(chunk.text) {
         onChunk(chunk.text);
      }
    }
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    onChunk("Sorry, I'm having trouble connecting right now.");
  }
}