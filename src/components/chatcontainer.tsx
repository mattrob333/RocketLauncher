import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, getDocs, deleteDoc } from "firebase/firestore";
import { db } from '@/firebase.js';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Workflow, Webhook } from '@/types';
import { Mic, Paperclip, Copy, Trash, Loader, Check, Send } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import '@/styles/markdown.css';

const API_BASE_URL = 'https://flowise-jc8z.onrender.com/api/v1/prediction/';

interface ChatContainerProps {
  selectedFlowId: string;
  setSelectedFlowId: (id: string) => void;
  workflows: Workflow[];
  webhooks: Webhook[];
}

export function ChatContainer({ selectedFlowId, setSelectedFlowId, workflows }: ChatContainerProps) {
  const [messages, setMessages] = useState<{ id: string; content: string; timestamp: Date; sender: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedFlowId) {
      const q = query(collection(db, `chats/${selectedFlowId}/messages`), orderBy('timestamp'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as { id: string; content: string; timestamp: Date; sender: string })));
      });
      return () => unsubscribe();
    }
  }, [selectedFlowId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && selectedFlowId) {
      const userMessage = { content: input, timestamp: new Date(), sender: 'user' };
      await addDoc(collection(db, `chats/${selectedFlowId}/messages`), userMessage);
      setInput('');
      setLoading(true);

      try {
        const response = await fetch(`${API_BASE_URL}${selectedFlowId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: input })
        });

        if (!response.ok) throw new Error('API request failed');

        const result = await response.json();
        const botMessage = {
          content: result.text || result.message || 'No response from the API',
          timestamp: new Date(),
          sender: 'bot'
        };
        await addDoc(collection(db, `chats/${selectedFlowId}/messages`), botMessage);
      } catch (error) {
        console.error('Error:', error);
        await addDoc(collection(db, `chats/${selectedFlowId}/messages`), {
          content: 'Sorry, there was an error processing your request.',
          timestamp: new Date(),
          sender: 'bot'
        });
      }

      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (selectedFlowId) {
      const chatRef = collection(db, `chats/${selectedFlowId}/messages`);
      const snapshot = await getDocs(chatRef);
      snapshot.docs.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
      setMessages([]);
    }
  };

  const copyToClipboard = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
  };

  return (
    <div className="flex flex-col h-full bg-black text-gray-300">
      {/* Workflow selector and clear chat button */}
      <div className="p-4 flex justify-between items-center bg-black border-b border-gray-800">
        <Select onValueChange={setSelectedFlowId} value={selectedFlowId || undefined}>
          <SelectTrigger className="w-[800px] bg-gray-800 text-gray-300 border-gray-700">
            <SelectValue placeholder="Select a workflow" />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 text-gray-300 border-gray-700">
            {workflows.map((workflow) => (
              workflow.chatflowId && (
                <SelectItem key={workflow.id} value={workflow.chatflowId} className="hover:bg-gray-700">
                  {workflow.title}
                </SelectItem>
              )
            ))}
          </SelectContent>
        </Select>
        <Button onClick={clearChat} variant="destructive" size="sm" className="bg-red-600 hover:bg-red-700">
          <Trash className="h-4 w-4 mr-2" />
          Clear Chat
        </Button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col space-y-4 px-4 py-2">
          {messages.map((msg, index) => (
            <div key={msg.id} className={`flex flex-col ${index > 0 && messages[index - 1].sender !== msg.sender ? 'mt-4' : ''}`}>
              <div className={`max-w-[80%] ${msg.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                <div className={`p-3 flex justify-between items-start ${
                  msg.sender === 'user' 
                    ? 'bg-gray-800 rounded-lg' 
                    : ''
                }`}>
                  <div className="markdown-content">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  {msg.sender !== 'user' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="ml-2 flex-shrink-0 text-gray-400 hover:text-gray-200"
                    >
                      {copiedMessageId === msg.id ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-center items-center my-4">
              <Loader className="animate-spin h-6 w-6 text-gray-400" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-gray-800">
        <form onSubmit={sendMessage} className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask the workflow..."
            className="w-full pr-24 bg-gray-800 text-gray-200 resize-none rounded-md"
            rows={3}
          />
          <div className="absolute bottom-2 right-2 flex space-x-2">
            <Button type="button" variant="ghost" size="icon" className="text-gray-400 hover:text-gray-200">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="text-gray-400 hover:text-gray-200">
              <Mic className="h-4 w-4" />
            </Button>
            <Button type="submit" variant="ghost" size="icon" className="text-gray-400 hover:text-gray-200">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}