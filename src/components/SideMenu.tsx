// No need to import React in modern versions of React with TypeScript
import { Button } from "@/components/ui/button"
import { MessageSquare, Settings, Globe, Home, Notebook, FileEdit } from 'lucide-react'

interface SideMenuProps {
  navigate: (path: string) => void;
  openNotepad: () => void;
}

export function SideMenu({ navigate, openNotepad }: SideMenuProps) {
  return (
    <div className="w-16 bg-black p-4 flex flex-col items-center space-y-6">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate('/')}
        className="text-gray-400 hover:text-gray-200 hover:bg-gray-800"
      >
        <Home className="h-6 w-6" />
        <span className="sr-only">Home</span>
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate('/chat')}
        className="text-gray-400 hover:text-gray-200 hover:bg-gray-800"
      >
        <MessageSquare className="h-6 w-6" />
        <span className="sr-only">Chat</span>
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate('/manage')}
        className="text-gray-400 hover:text-gray-200 hover:bg-gray-800"
      >
        <Settings className="h-6 w-6" />
        <span className="sr-only">Manage</span>
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate('/webhooks')}
        className="text-gray-400 hover:text-gray-200 hover:bg-gray-800"
      >
        <Globe className="h-6 w-6" />
        <span className="sr-only">Webhooks</span>
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={openNotepad}
        className="text-gray-400 hover:text-gray-200 hover:bg-gray-800"
      >
        <Notebook className="h-6 w-6" />
        <span className="sr-only">Open Notepad</span>
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate('/markdown')}
        className="text-gray-400 hover:text-gray-200 hover:bg-gray-800"
      >
        <FileEdit className="h-6 w-6" />
        <span className="sr-only">Markdown Editor</span>
      </Button>
    </div>
  )
}