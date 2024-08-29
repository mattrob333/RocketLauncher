import React from 'react';
import { Button } from "@/components/ui/button"
import { MessageSquare, Settings, Globe } from 'lucide-react'

interface SideMenuProps {
  setCurrentView: (view: 'chat' | 'manage' | 'webhooks') => void;
}

export function SideMenu({ setCurrentView }: SideMenuProps) {
  return (
    <div className="w-16 bg-background p-4 flex flex-col items-center space-y-6">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setCurrentView('chat')}
        className="hover:bg-secondary hover:text-primary"
      >
        <MessageSquare className="h-6 w-6" />
        <span className="sr-only">Chat</span>
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setCurrentView('manage')}
        className="hover:bg-secondary hover:text-primary"
      >
        <Settings className="h-6 w-6" />
        <span className="sr-only">Manage</span>
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setCurrentView('webhooks')}
        className="hover:bg-secondary hover:text-primary"
      >
        <Globe className="h-6 w-6" />
        <span className="sr-only">Webhooks</span>
      </Button>
    </div>
  )
}