import { useState, useEffect } from "react"
import { Plus, ChevronUp, Pencil, Trash2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore"
import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage"
import { db, storage } from '@/firebase.js'

interface Assistant {
  id: string;
  name: string;
  description: string;
  tools: string;
  department: string;
  avatar: string;
  assistantId: string;
  role: string;
}

interface AiAssistantsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectAssistant: (assistant: Assistant) => void;
}

export function AiAssistantsDrawer({ open, onOpenChange, onSelectAssistant }: AiAssistantsDrawerProps) {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [isAddAssistantOpen, setIsAddAssistantOpen] = useState(false);
  const [newAssistant, setNewAssistant] = useState<Omit<Assistant, 'id'>>({
    name: "",
    description: "",
    tools: "",
    department: "",
    avatar: "",
    assistantId: "",
    role: ""
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [editingAssistant, setEditingAssistant] = useState<Assistant | null>(null);

  useEffect(() => {
    fetchAssistants();
  }, []);

  const fetchAssistants = async () => {
    try {
      const assistantsCollection = collection(db, 'assistants');
      const assistantSnapshot = await getDocs(assistantsCollection);
      const assistantList = assistantSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Assistant));
      setAssistants(assistantList);
    } catch (error) {
      console.error("Error fetching assistants:", error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (editingAssistant) {
      setEditingAssistant(prev => {
        if (prev === null) return null;
        return { ...prev, [name]: value } as Assistant;
      });
    } else {
      setNewAssistant(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSaveAssistant = async () => {
    try {
      let avatarUrl = editingAssistant ? editingAssistant.avatar : "";
      if (avatarFile) {
        const storageRef = ref(storage, `avatars/${Date.now()}_${avatarFile.name}`);
        const uploadResult = await uploadBytes(storageRef, avatarFile);
        avatarUrl = await getDownloadURL(uploadResult.ref);
      }

      const assistantData = {
        ...(editingAssistant || newAssistant),
        avatar: avatarUrl
      };

      if (editingAssistant) {
        await updateDoc(doc(db, "assistants", editingAssistant.id), assistantData);
        console.log("Assistant updated with ID: ", editingAssistant.id);
      } else {
        const docRef = await addDoc(collection(db, "assistants"), assistantData);
        console.log("Assistant saved with ID: ", docRef.id);
      }

      // Reset the form and state
      setNewAssistant({
        name: "",
        description: "",
        tools: "",
        department: "",
        avatar: "",
        assistantId: "",
        role: ""
      });
      setEditingAssistant(null);
      setAvatarFile(null);
      setIsAddAssistantOpen(false);

      // Refresh the assistants list
      await fetchAssistants();
    } catch (error) {
      console.error("Error saving/updating assistant:", error);
    }
  };

  const handleEditAssistant = (assistant: Assistant) => {
    setEditingAssistant(assistant);
    setIsAddAssistantOpen(true);
  };

  const handleDeleteAssistant = async (assistant: Assistant) => {
    if (window.confirm(`Are you sure you want to delete ${assistant.name}?`)) {
      try {
        await deleteDoc(doc(db, "assistants", assistant.id));
        
        // Delete avatar from storage if it exists
        if (assistant.avatar) {
          const avatarRef = ref(storage, assistant.avatar);
          await deleteObject(avatarRef);
        }

        console.log("Assistant deleted with ID: ", assistant.id);
        await fetchAssistants();
      } catch (error) {
        console.error("Error deleting assistant:", error);
      }
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-[#0c0a09] text-white">
        <DrawerHeader className="border-b border-gray-800">
          <DrawerTitle className="text-lg font-semibold">Select an Assistant</DrawerTitle>
          <DrawerDescription className="text-gray-400">Choose an AI assistant to help you with your task.</DrawerDescription>
        </DrawerHeader>
        <div className="p-4 space-y-2 overflow-y-auto max-h-[60vh]">
          {assistants.map((assistant) => (
            <div key={assistant.id} className="flex items-center justify-between py-3 border-b border-gray-800">
              <div className="flex items-center space-x-4 flex-grow">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={assistant.avatar || `https://api.dicebear.com/6.x/initials/svg?seed=${assistant.name}`} />
                  <AvatarFallback>{assistant.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-grow grid grid-cols-4 gap-4">
                  <div>
                    <p className="font-medium">{assistant.name}</p>
                    <p className="text-sm text-gray-400">{assistant.role}</p>
                  </div>
                  <div className="text-sm text-gray-400">{assistant.description}</div>
                  <div className="text-sm text-gray-400">{assistant.tools}</div>
                  <div className="text-sm text-gray-400">{assistant.department}</div>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleEditAssistant(assistant)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => handleDeleteAssistant(assistant)}
                  className="text-red-400 hover:text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="bg-gray-800 hover:bg-gray-700 text-white"
                  onClick={() => onSelectAssistant(assistant)}
                >
                  Use
                </Button>
              </div>
            </div>
          ))}
        </div>
        <DrawerFooter className="border-t border-gray-800">
          <Collapsible open={isAddAssistantOpen} onOpenChange={setIsAddAssistantOpen}>
            <CollapsibleTrigger asChild>
              <Button className="w-full bg-[#ea580c] hover:bg-[#c2410c] text-white">
                {isAddAssistantOpen ? <ChevronUp className="mr-2 h-4 w-4" /> : <Plus className="mr-2 h-4 w-4" />}
                {isAddAssistantOpen ? "Close" : editingAssistant ? "Edit Assistant" : "Add Assistant"}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 mt-2">
              <Label htmlFor="assistantName" className="text-white">Assistant Name</Label>
              <Input
                id="assistantName"
                name="name"
                value={editingAssistant ? editingAssistant.name : newAssistant.name}
                onChange={handleInputChange}
                className="bg-[#1c1917] border-gray-700 text-white"
              />
              <Label htmlFor="assistantDescription" className="text-white">Description</Label>
              <Input
                id="assistantDescription"
                name="description"
                value={editingAssistant ? editingAssistant.description : newAssistant.description}
                onChange={handleInputChange}
                className="bg-[#1c1917] border-gray-700 text-white"
              />
              <Label htmlFor="assistantTools" className="text-white">Tools</Label>
              <Input
                id="assistantTools"
                name="tools"
                value={editingAssistant ? editingAssistant.tools : newAssistant.tools}
                onChange={handleInputChange}
                className="bg-[#1c1917] border-gray-700 text-white"
              />
              <Label htmlFor="assistantDepartment" className="text-white">Department</Label>
              <Input
                id="assistantDepartment"
                name="department"
                value={editingAssistant ? editingAssistant.department : newAssistant.department}
                onChange={handleInputChange}
                className="bg-[#1c1917] border-gray-700 text-white"
              />
              <Label htmlFor="assistantId" className="text-white">Assistant ID</Label>
              <Input
                id="assistantId"
                name="assistantId"
                value={editingAssistant ? editingAssistant.assistantId : newAssistant.assistantId}
                onChange={handleInputChange}
                className="bg-[#1c1917] border-gray-700 text-white"
              />
              <Label htmlFor="assistantRole" className="text-white">Role</Label>
              <Input
                id="assistantRole"
                name="role"
                value={editingAssistant ? editingAssistant.role : newAssistant.role}
                onChange={handleInputChange}
                className="bg-[#1c1917] border-gray-700 text-white"
              />
              <Label htmlFor="avatarUpload" className="text-white">Avatar</Label>
              <Input
                id="avatarUpload"
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="bg-[#1c1917] border-gray-700 text-white"
              />
              <Button onClick={handleSaveAssistant} className="w-full bg-green-600 hover:bg-green-700 text-white">
                {editingAssistant ? "Update Assistant" : "Save Assistant"}
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
  );
}
