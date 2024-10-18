import React, { useState, useEffect, useRef } from 'react';
import { Workflow, Webhook, Assistants } from '@/types';
import { ChatInputWithDrawersComponent } from "@/components/chat-input-with-drawers"
import { Trash2, User, Loader2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { collection, getDocs } from "firebase/firestore";
import { db } from '@/firebase';
import { toast } from "sonner";
import { AIAssistant } from '@/components/AIAssistant';
import { WorkflowDescription } from '@/components/workflowdescription';
import axios from 'axios';
import { OpenAI } from 'openai';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import '@/styles/markdown-styles.css';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  avatar?: string;
  name?: string;
}

interface ChatContainerProps {
  selectedFlowId: string;
  setSelectedFlowId: React.Dispatch<React.SetStateAction<string>>;
  webhooks: Webhook[];
  openAIKey: string;
  className?: string;
  workflows: Workflow[];
  onSelectWorkflow: (workflow: Workflow) => void;
  onSelectAssistant: (assistant: Assistants) => void;
  onSelectWebhook: (webhook: Webhook) => void;
  selectedWorkflow: Workflow | null;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ 
  selectedFlowId, 
  setSelectedFlowId, 
  webhooks, 
  openAIKey,
  className,
  workflows,
  onSelectWorkflow,
  onSelectAssistant,
  onSelectWebhook,
  selectedWorkflow
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAssistant, setSelectedAssistant] = useState<Assistants | null>(null);
  const [aiAssistant, setAiAssistant] = useState<AIAssistant | null>(null);
  const [thread, setThread] = useState<OpenAI.Beta.Threads.Thread | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messageContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleScroll = () => {
    if (messageContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
      setShowScrollButton(scrollTop < scrollHeight - clientHeight - 100);
    }
  };

  useEffect(() => {
    console.log("Current messages:", messages);
  }, [messages]);

  useEffect(() => {
    console.log("Selected workflow:", selectedFlowId);
  }, [selectedFlowId]);

  useEffect(() => {
    console.log("Selected assistant:", selectedAssistant);
  }, [selectedAssistant]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    handleScroll();
  }, [messages]);

  useEffect(() => {
    console.log("Selected workflow ID:", selectedFlowId);
    console.log("Available workflows:", workflows);
  }, [selectedFlowId, workflows]);

  const handleClearChat = () => {
    setMessages([]);
    setThread(null);
    if (aiAssistant) {
      aiAssistant.resetThread();
    }
  };

  const callFlowiseAPI = async (chatflowId: string, message: string) => {
    const apiHost = import.meta.env.VITE_FLOWISE_API_HOST || 'https://flowise-jc8z.onrender.com';
    
    try {
      console.log("Calling Flowise API with:", { chatflowId, message });
      
      const chatHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await axios.post(`${apiHost}/api/v1/prediction/${chatflowId}`, {
        question: message,
        history: chatHistory,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      console.log("Raw Flowise API response:", response.data);

      let processedResponse: string;
      if (typeof response.data === 'string') {
        processedResponse = response.data;
      } else if (typeof response.data === 'object' && response.data.text) {
        processedResponse = response.data.text;
      } else if (typeof response.data === 'object') {
        processedResponse = JSON.stringify(response.data);
      } else {
        processedResponse = String(response.data);
      }

      console.log("Processed Flowise API response:", processedResponse);
      return processedResponse;
    } catch (error) {
      console.error("Error calling Flowise API:", error);
      throw error;
    }
  };

  const handleSendMessage = async (message: string, chatflowId?: string, assistantId?: string) => {
    const newUserMessage: Message = { role: 'user', content: message };
    setMessages(prev => [...prev, newUserMessage]);
    
    setIsLoading(true);
    try {
      console.log("Sending message with assistantId:", assistantId, "chatflowId:", chatflowId);
      let response: string;
      let avatar: string | undefined;
      let name: string | undefined;

      if (assistantId && aiAssistant) {
        console.log("Using AI Assistant with ID:", assistantId);
        const { response: assistantResponse, updatedThread } = await aiAssistant.getResponse(message, messages);
        response = assistantResponse;
        setThread(updatedThread);
        avatar = selectedAssistant?.avatar;
        name = selectedAssistant?.name;
      } else if (chatflowId) {
        console.log("Using Flowise API with chatflowId:", chatflowId);
        response = await callFlowiseAPI(chatflowId, message);
        avatar = "/path/to/default/workflow/avatar.png";
        name = "Workflow Assistant";
      } else {
        throw new Error("No assistant or workflow selected");
      }

      console.log("Response received:", response);

      const newAssistantMessage: Message = {
        role: 'assistant',
        content: response,
        avatar,
        name
      };

      setMessages(prev => [...prev, newAssistantMessage]);
    } catch (error) {
      console.error("Error in handleSendMessage:", error);
      toast.error("Failed to get response: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAssistant = (assistant: Assistants) => {
    console.log("Selecting assistant:", assistant);
    setSelectedAssistant(assistant);
    
    const newAiAssistant = new AIAssistant({
      agent: assistant,
      onMessageReceived: (message) => {
        console.log("Received message from assistant:", message);
      }
    });

    if (thread) {
      newAiAssistant.setThread(thread);
    } else {
      setThread(null); // Reset thread when selecting a new assistant without an existing thread
    }

    setAiAssistant(newAiAssistant);
    console.log("New AI Assistant created:", newAiAssistant);
  };

  const handleSelectWebhook = (webhook: Webhook) => {
    // Implement webhook selection logic here
    console.log("Selected webhook:", webhook);
  };

  const renderMarkdown = (content: string) => {
    if (typeof content !== 'string') {
      console.error("Invalid content type passed to renderMarkdown:", content);
      return <div className="text-red-500">Error: Invalid content type</div>;
    }

    try {
      return (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeRaw]}
          components={{
            code({node, inline, className, children, ...props}) {
              const match = /language-(\w+)/.exec(className || '')
              return !inline && match ? (
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              ) : (
                <code className={className} {...props}>
                  {children}
                </code>
              )
            }
          }}
        >
          {content}
        </ReactMarkdown>
      );
    } catch (error) {
      console.error("Error rendering markdown:", error);
      return <div className="text-red-500">Error rendering content. Raw message: {content}</div>;
    }
  };

  const handleSelectWorkflow = (workflow: Workflow) => {
    console.log("Selecting workflow:", workflow);
    setSelectedFlowId(workflow.id);
    onSelectWorkflow(workflow);
  };

  return (
    <div className={`flex h-full ${className}`}>
      {/* Chat Interface */}
      <div className="flex flex-col flex-grow">
        {/* Header Bar */}
        <div className="bg-background border-b border-border p-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Chat</h1>
          <Button onClick={handleClearChat} variant="ghost" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Chat Messages */}
        <div 
          className="flex-grow overflow-y-auto p-4 relative"
          ref={messageContainerRef}
          onScroll={handleScroll}
        >
          {messages.map((msg, index) => (
            <div key={index} className={`mb-4 flex ${msg.role === 'assistant' ? 'justify-start' : 'justify-end'}`}>
              {msg.role === 'assistant' && (
                <div className="flex items-start space-x-2 max-w-[70%]">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarImage src={msg.avatar} />
                    <AvatarFallback>{msg.name?.[0] || 'A'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold mb-1">{msg.name || 'Assistant'}</p>
                    <div className="markdown-content">
                      {renderMarkdown(msg.content)}
                    </div>
                  </div>
                </div>
              )}
              {msg.role === 'user' && (
                <div className="flex items-start space-x-2 max-w-[70%]">
                  <div className="bg-[#1c1917] p-3 rounded-lg text-white">
                    {msg.content}
                  </div>
                  <Avatar className="h-8 w-8 bg-blue-500 flex items-center justify-center mt-1">
                    <User className="text-white h-5 w-5" />
                  </Avatar>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-center items-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          )}
          <div ref={messagesEndRef} />
          {showScrollButton && (
            <Button
              className="absolute bottom-4 right-4 rounded-full"
              onClick={scrollToBottom}
            >
              <ChevronDown className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Chat Input */}
        <ChatInputWithDrawersComponent
          onSendMessage={handleSendMessage}
          workflows={workflows}
          webhooks={webhooks}
          onSelectAssistant={onSelectAssistant}
          onSelectWebhook={onSelectWebhook}
          onSelectWorkflow={handleSelectWorkflow}
          selectedWorkflow={selectedWorkflow}
          isLoading={isLoading}
        />
      </div>

      {/* Workflow Description Panel */}
      <div className="w-[400px] border-l border-border">
        <WorkflowDescription 
          selectedWorkflow={selectedWorkflow}
          className="h-full"
        />
      </div>
    </div>
  );
};

export default ChatContainer;
