import React, { useState, useEffect } from 'react';
import { Workflow, Webhook, Expert } from '@/types';
import { ChatInputWithDrawersComponent } from "@/components/chat-input-with-drawers"
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { collection, getDocs } from "firebase/firestore";
import { db } from '@/firebase';
import { toast } from "sonner";
import { AIAssistant } from '@/components/AIAssistant';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatContainerProps {
  selectedFlowId: string;
  setSelectedFlowId: React.Dispatch<React.SetStateAction<string>>;
  webhooks: Webhook[];
  openAIKey: string;
  className?: string;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ 
  selectedFlowId, 
  setSelectedFlowId, 
  webhooks, 
  openAIKey,
  className 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedAssistant, setSelectedAssistant] = useState<Expert | null>(null);
  const [aiAssistant, setAiAssistant] = useState<AIAssistant | null>(null);

  useEffect(() => {
    fetchWorkflows();
  }, []);

  useEffect(() => {
    if (selectedAssistant) {
      const newAiAssistant = new AIAssistant({
        agent: selectedAssistant,
        onMessageReceived: (message) => {
          setMessages(prev => [...prev, { role: 'assistant', content: message }]);
        },
        initialConversation: messages.map(m => `${m.role}: ${m.content}`)
      });
      setAiAssistant(newAiAssistant);
    }
  }, [selectedAssistant]);

  const fetchWorkflows = async () => {
    try {
      const workflowsCollection = collection(db, 'workflows');
      const workflowSnapshot = await getDocs(workflowsCollection);
      const workflowList = workflowSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workflow));
      setWorkflows(workflowList);
    } catch (error) {
      console.error("Error fetching workflows:", error);
      toast.error("Failed to fetch workflows");
    }
  };

  const callFlowiseAPI = async (chatflowId: string, message: string): Promise<string> => {
    const apiUrl = `https://flowise-jc8z.onrender.com/api/v1/prediction/${chatflowId}`;
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ question: message })
    });

    if (!response.ok) {
      throw new Error(`Flowise API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.text || "No response from Flowise API";
  }

  const handleSendMessage = async (message: string, chatflowId?: string, assistantId?: string) => {
    if (message.trim()) {
      setMessages(prevMessages => [...prevMessages, { role: 'user', content: message }]);
      setIsLoading(true);
      
      try {
        let response: string;
        if (assistantId && aiAssistant) {
          response = await aiAssistant.getResponse(message);
        } else if (chatflowId) {
          response = await callFlowiseAPI(chatflowId, message);
        } else {
          throw new Error("No assistant or workflow selected");
        }
        setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: response }]);
      } catch (error) {
        console.error("Error getting AI response:", error);
        toast.error("Failed to get AI response");
      } finally {
        setIsLoading(false);
      }
    }
  }

  const handleSelectAssistant = (assistant: Expert) => {
    setSelectedAssistant(assistant);
    console.log("Selected assistant:", assistant);
  }

  const handleSelectWebhook = (webhook: Webhook) => {
    console.log("Selected webhook:", webhook);
    // Implement webhook logic here
  }

  const handleClearChat = () => {
    setMessages([]);
    toast.success("Chat cleared");
  }

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Header Bar */}
      <div className="bg-background border-b border-border p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Chat</h1>
        <div className="flex items-center space-x-2">
          <Select value={selectedFlowId} onValueChange={setSelectedFlowId}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select a workflow" />
            </SelectTrigger>
            <SelectContent>
              {workflows.map((workflow) => (
                <SelectItem key={workflow.id} value={workflow.id}>
                  {workflow.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleClearChat} variant="ghost" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[70%] p-3 rounded-lg ${
              message.role === 'user' 
                ? 'bg-primary text-primary-foreground' 
                : 'bg-secondary text-secondary-foreground'
            }`}>
              {message.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-secondary text-secondary-foreground p-3 rounded-lg flex items-center">
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* Chat Input */}
      <div className="p-4 bg-background border-t border-border">
        <ChatInputWithDrawersComponent
          onSendMessage={handleSendMessage}
          workflows={workflows}
          webhooks={webhooks}
          onSelectAssistant={handleSelectAssistant}
          onSelectWebhook={handleSelectWebhook}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default ChatContainer;
