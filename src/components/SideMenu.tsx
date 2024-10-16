// No need to import React in modern versions of React with TypeScript
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Rocket, Bot, Workflow, Globe, FileEdit, FileText } from 'lucide-react'

interface SideMenuProps {
  navigate: (path: string) => void;
  openNotepad: () => void;
}

export function SideMenu({ navigate, openNotepad }: SideMenuProps) {
  return (
    <TooltipProvider>
      <div className="w-16 h-screen bg-background border-r border-border flex flex-col items-center py-4 space-y-4">
        <SidebarIcon icon={<Rocket className="h-6 w-6" />} label="Home" onClick={() => navigate('/')} />
        <SidebarIcon icon={<Bot className="h-6 w-6" />} label="Chat" onClick={() => navigate('/chat')} />
        <SidebarIcon icon={<Workflow className="h-6 w-6" />} label="Workflow Manager" onClick={() => navigate('/manage')} />
        <SidebarIcon icon={<Globe className="h-6 w-6" />} label="Webhooks" onClick={() => navigate('/webhooks')} />
        <SidebarIcon icon={<FileEdit className="h-6 w-6" />} label="Text Editor" onClick={openNotepad} />
        <SidebarIcon icon={<FileText className="h-6 w-6" />} label="Documents" onClick={() => navigate('/documents')} />
      </div>
    </TooltipProvider>
  )
}

function SidebarIcon({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClick}
          className="text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          {icon}
          <span className="sr-only">{label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  )
}
