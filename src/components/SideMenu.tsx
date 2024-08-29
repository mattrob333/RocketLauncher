import React from 'react';
import { Button } from "@/components/ui/button"
import { MessageSquare, Settings, Globe, Home, Notebook } from 'lucide-react'

interface SideMenuProps {
  setCurrentView: (view: 'landing' | 'chat' | 'manage' | 'webhooks') => void;
  openNotepad: () => void;
}

export function SideMenu({ setCurrentView, openNotepad }: SideMenuProps) {
  return (
    <div className="w-16 bg-background p-4 flex flex-col items-center space-y-6">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setCurrentView('landing')}
        className="hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 hover:text-white"
      >
        <Home className="h-6 w-6" />
        <span className="sr-only">Home</span>
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setCurrentView('chat')}
        className="hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 hover:text-white"
      >
        <MessageSquare className="h-6 w-6" />
        <span className="sr-only">Chat</span>
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setCurrentView('manage')}
        className="hover:bg-gradient-to-r hover:from-red-500 hover:to-orange-500 hover:text-white"
      >
        <Settings className="h-6 w-6" />
        <span className="sr-only">Manage</span>
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setCurrentView('webhooks')}
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
    </div>
  )
}