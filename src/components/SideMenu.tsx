import React from 'react';
import { Button } from "@/components/ui/button"
import { MessageSquare, Settings, Globe } from 'lucide-react'

interface SideMenuProps {
  setCurrentView: (view: 'chat' | 'manage' | 'webhooks') => void;
}

export function SideMenu({ setCurrentView }: SideMenuProps) {
  return (
    <div className="w-16 bg-background dark:bg-gray-800 p-4 flex flex-col items-center space-y-6">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setCurrentView('chat')}
        className="hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <MessageSquare className="h-6 w-6" />
        <span className="sr-only">Chat</span>
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setCurrentView('manage')}
        className="hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Settings className="h-6 w-6" />
        <span className="sr-only">Manage</span>
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => setCurrentView('webhooks')}
        className="hover:bg-gray-200 dark:hover:bg-gray-700"
      >
        <Globe className="h-6 w-6" />
        <span className="sr-only">Webhooks</span>
      </Button>
    </div>
  )
}