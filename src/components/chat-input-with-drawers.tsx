import React, { useState, useEffect, KeyboardEvent, useRef } from 'react'
import { CornerDownLeft, Mic, Paperclip, Plus, ChevronUp, Upload, Loader2 } from "lucide-react"
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
import { Workflow, Webhook, Assistants } from '@/types'
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { db, storage } from '@/firebase'
import { toast } from "sonner"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { Select, SelectTrigger, SelectValue, SelectItem, SelectContent } from "@/components/ui/select"

export interface ChatInputWithDrawersComponentProps {
  onSendMessage: (message: string, chatflowId?: string, assistantId?: string) => Promise<void>;
  workflows: Workflow[];
  webhooks: Webhook[];
  onSelectAssistant: (assistant: Assistants) => void;
  onSelectWebhook: (webhook: Webhook) => void;
  onSelectWorkflow: (workflow: Workflow) => void;
  selectedWorkflow: Workflow | null;
  isLoading: boolean;
}

export function ChatInputWithDrawersComponent({
  onSendMessage,
  workflows,
  webhooks,
  onSelectAssistant,
  onSelectWebhook,
  onSelectWorkflow,
  selectedWorkflow,
  isLoading
}: ChatInputWithDrawersComponentProps) {
  const [message, setMessage] = useState("")
  const [isAssistantsOpen, setIsAssistantsOpen] = useState(false)
  const [isWebhooksOpen, setIsWebhooksOpen] = useState(false)
  const [assistants, setAssistants] = useState<Assistants[]>([])
  const [isAddAgentOpen, setIsAddAgentOpen] = useState(false)
  const [newAssistant, setNewAssistant] = useState<Omit<Assistants, 'id'>>({
    name: "",
    role: "",
    description: "",
    avatar: "",
    assistantId: "",
    department: "",
    tools: ""
  })
  const [useAssistant, setUseAssistant] = useState(true)
  const [selectedAssistant, setSelectedAssistant] = useState<Assistants | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      const assistantsCollection = collection(db, 'assistants');
      const assistantSnapshot = await getDocs(assistantsCollection);
      const assistantList = assistantSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assistants));
      setAssistants(assistantList);
    } catch (error) {
      console.error("Error fetching assistants:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewAssistant(prev => ({ ...prev, [name]: value }))
  }

  const handleSaveAssistant = async () => {
    try {
      if (newAssistant.id) {
        // Update existing assistant
        await updateDoc(doc(db, "assistants", newAssistant.id), newAssistant);
        setAssistants(prevAssistants => 
          prevAssistants.map(a => a.id === newAssistant.id ? { ...newAssistant, id: a.id } : a)
        );
        toast.success("Assistant updated successfully");
      } else {
        // Add new assistant
        const docRef = await addDoc(collection(db, "assistants"), newAssistant);
        setAssistants(prevAssistants => [...prevAssistants, { ...newAssistant, id: docRef.id }]);
        toast.success("New assistant added successfully");
      }
      setNewAssistant({ name: "", role: "", description: "", avatar: "", assistantId: "", department: "", tools: "" });
      setIsAddAgentOpen(false);
    } catch (error) {
      console.error("Error saving/updating assistant:", error);
      toast.error("Failed to save/update assistant");
    }
  };

  const handleDeleteAssistant = async (assistant: Assistants) => {
    if (window.confirm(`Are you sure you want to delete ${assistant.name}?`)) {
      try {
        await deleteDoc(doc(db, "assistants", assistant.id));
        setAssistants(prevAssistants => prevAssistants.filter(a => a.id !== assistant.id));
        toast.success("Assistant deleted successfully");
      } catch (error) {
        console.error("Error deleting assistant:", error);
        toast.error("Failed to delete assistant");
      }
    }
  };

  const handleSelectAssistant = (assistant: Assistants) => {
    setSelectedAssistant(assistant);
    onSelectAssistant(assistant);
    setIsAssistantsOpen(false);
  }

  const handleSelectWorkflow = (workflow: Workflow) => {
    console.log("Selecting workflow:", workflow);
    onSelectWorkflow(workflow);
    setSelectedAssistant(null);
    setIsAssistantsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      if (useAssistant && selectedAssistant) {
        onSendMessage(message, undefined, selectedAssistant.assistantId);
      } else if (!useAssistant && selectedWorkflow) {
        onSendMessage(message, selectedWorkflow.chatflowId);
      } else if (useAssistant && !selectedAssistant) {
        toast.error("Please select an assistant before sending a message");
        return;
      } else if (!useAssistant && !selectedWorkflow) {
        toast.error("Please select a workflow before sending a message");
        return;
      }
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);  // Changed from handleSendMessage() to handleSubmit(e as any)
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setUploadingAvatar(true)
    try {
      const storageRef = ref(storage, `avatars/${Date.now()}_${file.name}`)
      const uploadResult = await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(uploadResult.ref)
      
      setNewAssistant(prev => ({ ...prev, avatar: downloadURL }))
      toast.success("Avatar uploaded successfully")
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast.error("Failed to upload avatar")
    } finally {
      setUploadingAvatar(false)
    }
  }

  const handleEditAssistant = (assistant: Assistants) => {
    setNewAssistant({
      name: assistant.name,
      role: assistant.role,
      description: assistant.description,
      avatar: assistant.avatar,
      assistantId: assistant.assistantId,
      department: assistant.department,
      tools: assistant.tools
    });
    setIsAddAgentOpen(true);
  };

  const handleWorkflowChange = (workflowId: string) => {
    const workflow = workflows.find(w => w.id === workflowId);
    if (workflow) {
      onSelectWorkflow(workflow);
    }
  };

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
                    className="flex items-start justify-between py-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 transition-colors duration-200"
                    onClick={() => handleSelectAssistant(assistant)}
                  >
                    <div className="flex items-start space-x-4 w-full">
                      <Avatar className="h-10 w-10 mt-1 flex-shrink-0">
                        <AvatarImage src={assistant.avatar} />
                        <AvatarFallback>{assistant.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <div className="flex-grow flex">
                        <div className="w-1/4 pr-4">
                          <p className="font-medium">{assistant.name}</p>
                          <p className="text-sm text-gray-400">{assistant.department}</p>
                        </div>
                        <p className="text-sm text-gray-400 w-3/4 line-clamp-2">{assistant.description}</p>
                      </div>
                      <div className="flex flex-col space-y-2 ml-4 flex-shrink-0">
                        <Button 
                          variant="secondary" 
                          size="sm" 
                          className="bg-gray-800 hover:bg-gray-700 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAssistant(assistant);
                          }}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          className="bg-red-600 hover:bg-red-700 text-white"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteAssistant(assistant);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
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
                    value={newAssistant.name}
                    onChange={handleInputChange}
                    className="bg-[#1c1917] border-gray-700 text-white"
                  />
                  <Label htmlFor="agentDepartment" className="text-white">Department</Label>
                  <Input
                    id="agentDepartment"
                    name="department"
                    value={newAssistant.department}
                    onChange={handleInputChange}
                    className="bg-[#1c1917] border-gray-700 text-white"
                  />
                  <Label htmlFor="agentDescription" className="text-white">Description</Label>
                  <Input
                    id="agentDescription"
                    name="description"
                    value={newAssistant.description}
                    onChange={handleInputChange}
                    className="bg-[#1c1917] border-gray-700 text-white"
                  />
                  <Label htmlFor="agentAvatar" className="text-white">Avatar URL</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="agentAvatar"
                      name="avatar"
                      value={newAssistant.avatar}
                      onChange={handleInputChange}
                      className="bg-[#1c1917] border-gray-700 text-white flex-grow"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="bg-[#1c1917] hover:bg-[#2c2927] text-white"
                    >
                      {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarUpload}
                      accept="image/*"
                      className="hidden"
                    />
                  </div>
                  <Label htmlFor="agentAssistantId" className="text-white">Assistant ID</Label>
                  <Input
                    id="agentAssistantId"
                    name="assistantId"
                    value={newAssistant.assistantId}
                    onChange={handleInputChange}
                    className="bg-[#1c1917] border-gray-700 text-white"
                  />
                  <Button onClick={handleSaveAssistant} className="w-full bg-green-600 hover:bg-green-700 text-white">
                    {newAssistant.id ? 'Update Assistant' : 'Save Assistant'}
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
              if (!checked) {
                onSelectWorkflow(selectedWorkflow || workflows[0]);
              }
            }}
            className="bg-gray-600"
          />
          <Label>{useAssistant ? "Using Assistant" : "Using Workflow"}</Label>
        </div>
        {!useAssistant && (
          <Select
            value={selectedWorkflow?.id || ''}
            onValueChange={handleWorkflowChange}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Workflow" />
            </SelectTrigger>
            <SelectContent>
              {workflows.map((workflow) => (
                <SelectItem key={workflow.id} value={workflow.id}>
                  {workflow.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
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
