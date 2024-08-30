import React from 'react';
import { Button } from "@/components/ui/button"
import { MessageSquare, Settings, Globe, Home, Notebook, FileEdit } from 'lucide-react'

interface SideMenuProps {
  navigate: (path: string) => void;
  openNotepad: () => void;
}

export function SideMenu({ navigate, openNotepad }: SideMenuProps) {
  return (
    <div className="w-16 bg-background p-4 flex flex-col items-center space-y-6">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate('/')}
        className="hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 hover:text-white"
      >
        <Home className="h-6 w-6" />
        <span className="sr-only">Home</span>
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate('/chat')}
        className="hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 hover:text-white"
      >
        <MessageSquare className="h-6 w-6" />
        <span className="sr-only">Chat</span>
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate('/manage')}
        className="hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 hover:text-white"
      >
        <Settings className="h-6 w-6" />
        <span className="sr-only">Manage</span>
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate('/webhooks')}
        className="hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 hover:text-white"
      >
        <Globe className="h-6 w-6" />
        <span className="sr-only">Webhooks</span>
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={openNotepad}
        className="hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 hover:text-white"
      >
        <Notebook className="h-6 w-6" />
        <span className="sr-only">Open Notepad</span>
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => navigate('/markdown')}
        className="hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 hover:text-white"
      >
        <FileEdit className="h-6 w-6" />
        <span className="sr-only">Markdown Editor</span>
      </Button>
    </div>
  )
}