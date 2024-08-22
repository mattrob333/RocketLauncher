import React, { useState, useEffect, useRef } from 'react';
import { collection, addDoc, onSnapshot, query, orderBy, getDocs, deleteDoc } from "firebase/firestore";
import { db } from '@/firebase.js';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Workflow, Webhook } from '@/types';
import { CornerDownLeft, Mic, Paperclip, Copy, Trash } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

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
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
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
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      console.log('Copied to clipboard');
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
        <Select onValueChange={setSelectedFlowId} value={selectedFlowId}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select a workflow" />
          </SelectTrigger>
          <SelectContent>
            {workflows.map((workflow) => (
              <SelectItem key={workflow.chatflowId} value={workflow.chatflowId}>
                {workflow.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={clearChat} variant="destructive" size="sm">
          <Trash className="h-4 w-4 mr-2" />
          Clear Chat
        </Button>
      </div>

      {/* Scrollable messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-2">
        {messages.map((msg) => (
          <Card key={msg.id} className={`max-w-[80%] ${msg.sender === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'mr-auto bg-secondary text-secondary-foreground'}`}>
            <CardContent className="p-3 flex justify-between items-start">
              <ReactMarkdown rehypePlugins={[rehypeRaw]} className="prose dark:prose-invert max-w-none">
                {msg.content}
              </ReactMarkdown>
              {msg.sender === 'bot' && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => copyToClipboard(msg.content)}
                  className="ml-2 flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
        <div ref={messagesEndRef} />
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