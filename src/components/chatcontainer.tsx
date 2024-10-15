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
import { Switch } from "@/components/ui/switch";
import { AIAssistant } from './AIAssistant';
import { AgentSelector } from './AgentSelector';

const API_BASE_URL = 'https://flowise-jc8z.onrender.com/api/v1/prediction';

interface ChatContainerProps {
  selectedFlowId: string;
  setSelectedFlowId: (id: string) => void;
  workflows: Workflow[];
  webhooks: Webhook[];
  className?: string;
  openAIKey: string;
}

export function ChatContainer({ selectedFlowId, setSelectedFlowId, workflows, webhooks, className, openAIKey }: ChatContainerProps) {
  const [messages, setMessages] = useState<{ id: string; content: string; timestamp: Date; sender: string }[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [useAssistant, setUseAssistant] = useState(false);
  const [selectedAssistantId, setSelectedAssistantId] = useState<string | null>(null);
  const [aiAssistant, setAiAssistant] = useState<AIAssistant | null>(null);

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

  useEffect(() => {
    if (useAssistant && selectedAssistantId) {
      const conversationHistory = messages.map(msg => `${msg.sender}: ${msg.content}`);
      const newAiAssistant = new AIAssistant({
        agent: { id: selectedAssistantId, name: '', role: '', description: '', avatar: '', assistantId: selectedAssistantId },
        onMessageReceived: (message) => {
          addMessage(message, 'assistant');
        },
        initialConversation: conversationHistory
      });
      setAiAssistant(newAiAssistant);
    } else {
      setAiAssistant(null);
    }
  }, [useAssistant, selectedAssistantId, messages]);

  const addMessage = (content: string, sender: string) => {
    const newMessage = { id: Date.now().toString(), content, timestamp: new Date(), sender };
    setMessages(prev => [...prev, newMessage]);
    if (aiAssistant) {
      aiAssistant.addToConversation(content, sender as 'user' | 'assistant' | 'workflow');
    }
  };

  const executeWorkflow = async (input: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${selectedFlowId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input }),
      });
      if (!response.ok) throw new Error('Workflow execution failed');
      const data = await response.json();
      return data.text;
    } catch (error) {
      console.error("Error executing workflow:", error);
      throw error;
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && (selectedFlowId || (useAssistant && selectedAssistantId))) {
      addMessage(input, 'user');
      setInput('');
      setLoading(true);

      try {
        let response;
        if (useAssistant && aiAssistant) {
          response = await aiAssistant.getResponse(input);
        } else {
          response = await executeWorkflow(input);
        }
        addMessage(response, 'assistant');
      } catch (error) {
        console.error("Error in sendMessage:", error);
        addMessage("Error: Unable to get a response. Please try again.", 'system');
      } finally {
        setLoading(false);
      }
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-background text-foreground w-3/4 ${className}`}>
      {/* Workflow selector, clear chat button, and Assistant toggle */}
      <div className="p-4 flex justify-between items-center bg-background border-b border-border">
        <div className="flex items-center space-x-4">
          {!useAssistant && (
            <Select onValueChange={setSelectedFlowId} value={selectedFlowId || undefined}>
              <SelectTrigger className="w-[400px] bg-secondary text-secondary-foreground border-input">
                <SelectValue placeholder="Select a workflow" />
              </SelectTrigger>
              <SelectContent className="bg-popover text-popover-foreground border-border">
                {workflows.map((workflow) => (
                  workflow.chatflowId && (
                    <SelectItem key={workflow.id} value={workflow.chatflowId} className="hover:bg-accent hover:text-accent-foreground">
                      {workflow.title}
                    </SelectItem>
                  )
                ))}
              </SelectContent>
            </Select>
          )}
          {useAssistant && (
            <AgentSelector
              selectedAgentId={selectedAssistantId}
              onAgentSelect={setSelectedAssistantId}
            />
          )}
          <div className="flex items-center space-x-2">
            <span>Use Assistant</span>
            <Switch
              checked={useAssistant}
              onCheckedChange={setUseAssistant}
            />
          </div>
        </div>
        <Button onClick={clearChat} variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Trash className="h-5 w-5" />
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
                    ? 'bg-secondary text-secondary-foreground rounded-lg' 
                    : 'text-foreground'
                }`}>
                  <div className="markdown-content">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  {msg.sender !== 'user' && (
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => copyToClipboard(msg.content, msg.id)}
                      className="ml-2 flex-shrink-0 text-muted-foreground hover:text-foreground"
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
              <Loader className="animate-spin h-6 w-6 text-muted-foreground" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="p-4 border-t border-border">
        <form onSubmit={sendMessage} className="relative">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={useAssistant ? "Ask the assistant..." : "Ask the workflow..."}
            className="w-full pr-24 bg-input text-foreground resize-none rounded-md"
            rows={3}
          />
          <div className="absolute bottom-2 right-2 flex space-x-2">
            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Mic className="h-4 w-4" />
            </Button>
            <Button type="submit" variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
