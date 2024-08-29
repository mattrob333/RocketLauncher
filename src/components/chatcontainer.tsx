import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, getDocs, deleteDoc } from "firebase/firestore";
import { db } from '@/firebase.js';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Workflow, Webhook } from '@/types';
import { CornerDownLeft, Mic, Paperclip, Copy, Trash, Loader, Check } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import '@/styles/markdown.css'; // Import the CSS file

const API_BASE_URL = 'https://flowise-jc8z.onrender.com/api/v1/prediction/';

interface ChatContainerProps {
  selectedFlowId: string;
  setSelectedFlowId: (id: string) => void;
  workflows: Workflow[];
  webhooks: Webhook[];
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export function ChatContainer({ selectedFlowId, setSelectedFlowId, workflows, webhooks }: ChatContainerProps) {
  console.log("ChatContainer rendering with workflows:", workflows);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedFlowId) {
      const q = query(collection(db, `chats/${selectedFlowId}/messages`), orderBy('timestamp'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Message)));
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
      } finally {
        setLoading(false);
      }
    }
  };

  const copyToClipboard = (text: string, messageId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard');
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000); // Reset after 2 seconds
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });
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

  const triggerWebhook = async (webhook: Webhook) => {
    if (messages.length === 0) return;
    const latestMessage = messages[messages.length - 1].content;
    try {
      const response = await fetch(webhook.url, {
        method: webhook.method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: latestMessage }),
      });
      if (!response.ok) throw new Error('Webhook request failed');
      console.log('Webhook triggered successfully');
    } catch (error) {
      console.error('Error triggering webhook:', error);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Workflow selector and clear chat button */}
      <div className="p-4 flex justify-between items-center">
        <Select onValueChange={setSelectedFlowId} value={selectedFlowId || undefined}>
          <SelectTrigger className="w-[800px]">
            <SelectValue placeholder="Select a workflow" />
          </SelectTrigger>
          <SelectContent>
            {workflows.map((workflow) => (
              workflow.chatflowId ? (
                <SelectItem key={workflow.id} value={workflow.chatflowId}>
                  {workflow.title}
                </SelectItem>
              ) : null
            ))}
          </SelectContent>
        </Select>
        <Button onClick={clearChat} variant="destructive" size="sm">
          <Trash className="h-4 w-4 mr-2" />
          Clear Chat
        </Button>
      </div>

      {/* Scrollable messages area */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col space-y-4 px-4 py-2">
          {messages.map((msg, index) => (
            <div key={msg.id} className={`flex flex-col ${index > 0 && messages[index - 1].sender !== msg.sender ? 'mt-4' : ''}`}>
              <div className={`rounded-lg border shadow-sm max-w-[80%] ${msg.sender === 'user' ? 'ml-auto bg-secondary text-secondary-foreground' : 'mr-auto bg-muted text-muted-foreground'}`}>
                <div className="p-3 flex justify-between items-start">
                  <div className="markdown-content">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  {msg.sender === 'bot' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="ml-2 flex-shrink-0 text-muted-foreground hover:text-primary"
                    >
                      {copiedMessageId === msg.id ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-center items-center my-4">
              <Loader className="animate-spin h-6 w-6 text-primary" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Webhook buttons */}
      <div className="p-4 border-t border-border">
        <div className="flex flex-wrap gap-2">
          {webhooks.map((webhook) => (
            <Button key={webhook.id} onClick={() => triggerWebhook(webhook)} size="sm">
              {webhook.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-border">
        <form onSubmit={sendMessage} className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="w-full pr-24 bg-secondary text-secondary-foreground resize-none rounded-md"
            rows={3}
          />
          <div className="absolute bottom-2 right-2 flex space-x-2">
            <Button type="button" variant="ghost" size="icon">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon">
              <Mic className="h-4 w-4" />
            </Button>
            <Button type="submit" variant="ghost" size="icon">
              <CornerDownLeft className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}