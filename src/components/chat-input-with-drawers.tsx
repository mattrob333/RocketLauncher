import React, { useState, useEffect, KeyboardEvent } from 'react'
import { CornerDownLeft, Mic, Paperclip, Plus, ChevronUp } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Expert, Workflow, Webhook } from '@/types'
import { collection, getDocs, addDoc } from "firebase/firestore"
import { db } from '@/firebase'
import { toast } from "sonner"

export interface ChatInputWithDrawersComponentProps {
  onSendMessage: (message: string, chatflowId?: string, assistantId?: string) => Promise<void>;
  workflows: Workflow[];
  webhooks: Webhook[];
  onSelectAssistant: (assistant: Expert) => void;
  onSelectWebhook: (webhook: Webhook) => void;
  isLoading: boolean;
}

export function ChatInputWithDrawersComponent({
  onSendMessage,
  workflows,
  webhooks,
  onSelectAssistant,
  onSelectWebhook,
  isLoading
}: ChatInputWithDrawersComponentProps) {
  const [message, setMessage] = useState("")
  const [isAssistantsOpen, setIsAssistantsOpen] = useState(false)
  const [isWebhooksOpen, setIsWebhooksOpen] = useState(false)
  const [assistants, setAssistants] = useState<Expert[]>([])
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false)
  const [newAgent, setNewAgent] = useState<Omit<Expert, 'id'>>({
    name: "",
    role: "",
    description: "",
    avatar: "",
    assistantId: ""
  })
  const [useAssistant, setUseAssistant] = useState(true)
  const [selectedAssistant, setSelectedAssistant] = useState<Expert | null>(null)
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null)

  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      const assistantsCollection = collection(db, 'assistants');
      const assistantSnapshot = await getDocs(assistantsCollection);
      const assistantList = assistantSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Expert));
      setAssistants(assistantList);
    } catch (error) {
      console.error("Error fetching assistants:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewAgent(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveAgent = async () => {
    try {
      await addDoc(collection(db, "assistants"), newAgent);
      setNewAgent({ name: "", role: "", description: "", avatar: "", assistantId: "" })
      setIsAddAgentOpen(false)
      fetchAssistants() // Refresh the list of assistants
      toast.success("New assistant added successfully")
    } catch (error) {
      console.error("Error saving new agent:", error)
      toast.error("Failed to add new assistant")
    }
  }

  const handleSelectAssistant = (assistant: Expert) => {
    setSelectedAssistant(assistant);
    setSelectedWorkflow(null);
    onSelectAssistant(assistant);
    setIsAssistantsOpen(false);
  }

  const handleSelectWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setSelectedAssistant(null);
    setIsAssistantsOpen(false);
  }

  const handleSendMessage = () => {
    if (message.trim()) {
      if (useAssistant && selectedAssistant) {
        onSendMessage(message, undefined, selectedAssistant.assistantId);
      } else if (!useAssistant && selectedWorkflow) {
        onSendMessage(message, selectedWorkflow.chatflowId);
      } else {
        console.error("No assistant or workflow selected");
        toast.error("Please select an assistant or workflow before sending a message");
        return;
      }
      setMessage("");
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  return (
    <div className="bg-[#0c0a09] p-4">
      <div className="flex space-x-2 mb-2 items-center">
        <Drawer open={isAssistantsOpen} onOpenChange={setIsAssistantsOpen}>
          <DrawerTrigger asChild>
            <Button variant="outline" className="bg-[#1c1917] text-white hover:bg-[#292524] border-gray-700">
              {useAssistant ? (selectedAssistant ? selectedAssistant.name : "Select Assistant") : (selectedWorkflow ? selectedWorkflow.title : "Select Workflow")}
            </Button>
          </DrawerTrigger>
          <DrawerContent className="bg-[#0c0a09] text-white">
            <DrawerHeader className="border-b border-gray-800">
              <DrawerTitle className="text-lg font-semibold">Select an {useAssistant ? "Assistant" : "Workflow"}</DrawerTitle>
              <DrawerDescription className="text-gray-400">Choose an AI assistant or workflow to help you with your task.</DrawerDescription>
            </DrawerHeader>
            <div className="p-4 space-y-2 overflow-y-auto max-h-[60vh]">
              {useAssistant ? (
                assistants.map((assistant) => (
                  <div 
                    key={assistant.id} 
                    className="flex items-center justify-between py-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors duration-200"
                    onClick={() => handleSelectAssistant(assistant)}
                  >
                    <div className="flex items-center space-x-4 flex-grow">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={assistant.avatar} />
                        <AvatarFallback>{assistant.name.split(' ').map((n) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow">
                        <p className="font-medium">{assistant.name}</p>
                        <p className="text-sm text-gray-400">{assistant.role}</p>
                      </div>
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="bg-gray-800 hover:bg-gray-700 text-white ml-4"
                    >
                      Use
                    </Button>
                  </div>
                ))
              ) : (
                workflows.map((workflow) => (
                  <div 
                    key={workflow.id} 
                    className="flex items-center justify-between py-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors duration-200"
                    onClick={() => handleSelectWorkflow(workflow)}
                  >
                    <div className="flex-grow">
                      <p className="font-medium">{workflow.title}</p>
                      <p className="text-sm text-gray-400">{workflow.description}</p>
                    </div>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="bg-gray-800 hover:bg-gray-700 text-white ml-4"
                    >
                      Use
                    </Button>
                  </div>
                ))
              )}
            </div>
            <DrawerFooter className="border-t border-gray-800">
              <Collapsible open={isAddAgentOpen} onOpenChange={setIsAddAgentOpen}>
                <CollapsibleTrigger asChild>
                  <Button className="w-full bg-[#ea580c] hover:bg-[#c2410c] text-white">
                    {isAddAgentOpen ? <ChevronUp className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                    {isAddAgentOpen ? "Close" : "Add Assistant"}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  <Label htmlFor="agentName" className="text-white">Assistant Name</Label>
                  <Input
                    id="agentName"
                    name="name"
                    value={newAgent.name}
                    onChange={handleInputChange}
                    className="bg-[#1c1917] border-gray-700 text-white"
                  />
                  <Label htmlFor="agentRole" className="text-white">Role</Label>
                  <Input
                    id="agentRole"
                    name="role"
                    value={newAgent.role}
                    onChange={handleInputChange}
                    className="bg-[#1c1917] border-gray-700 text-white"
                  />
                  <Label htmlFor="agentDescription" className="text-white">Description</Label>
                  <Input
                    id="agentDescription"
                    name="description"
                    value={newAgent.description}
                    onChange={handleInputChange}
                    className="bg-[#1c1917] border-gray-700 text-white"
                  />
                  <Label htmlFor="agentAvatar" className="text-white">Avatar URL</Label>
                  <Input
                    id="agentAvatar"
                    name="avatar"
                    value={newAgent.avatar}
                    onChange={handleInputChange}
                    className="bg-[#1c1917] border-gray-700 text-white"
                  />
                  <Label htmlFor="agentAssistantId" className="text-white">Assistant ID</Label>
                  <Input
                    id="agentAssistantId"
                    name="assistantId"
                    value={newAgent.assistantId}
                    onChange={handleInputChange}
                    className="bg-[#1c1917] border-gray-700 text-white"
                  />
                  <Button onClick={handleSaveAgent} className="w-full bg-green-600 hover:bg-green-700 text-white">
                    Save Assistant
                  </Button>
                </CollapsibleContent>
              </Collapsible>
              <DrawerClose asChild>
                <Button variant="outline" className="w-full bg-white text-black hover:bg-gray-100">
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
        <div className="flex items-center space-x-2">
          <Switch
            checked={useAssistant}
            onCheckedChange={(checked) => {
              setUseAssistant(checked);
              setSelectedAssistant(null);
              setSelectedWorkflow(null);
            }}
            className="bg-gray-600"
          />
          <Label>{useAssistant ? "Using Assistant" : "Using Workflow"}</Label>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="relative overflow-hidden rounded-lg bg-[#1c1917] shadow-md">
        <Label htmlFor="message" className="sr-only">
          Message
        </Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message here..."
          className="min-h-12 w-full resize-none border-0 bg-transparent p-3 text-white placeholder-gray-400 focus:outline-none focus:ring-0"
        />
        <div className="flex items-center p-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Paperclip className="h-4 w-4" />
                <span className="sr-only">Attach file</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Attach File</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white">
                <Mic className="h-4 w-4" />
                <span className="sr-only">Use Microphone</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent side="top">Use Microphone</TooltipContent>
          </Tooltip>
          <Button type="submit" size="sm" className="ml-auto bg-[#ea580c] hover:bg-[#c2410c] text-white">
            Send Message
            <CornerDownLeft className="ml-2 h-3.5 w-3.5" />
          </Button>
        </div>
      </form>
    </div>
  )
}
