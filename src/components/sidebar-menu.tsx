'use client'

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { GitBranch, Webhook, FileCode, Folder, Bot, Settings2 } from "lucide-react"

export function SidebarMenuComponent() {
  return (
    <aside className="fixed inset-y-0 left-0 w-16 flex flex-col items-center py-4 bg-black border-r border-gray-800">
      <div className="mb-4 text-2xl">
        🚀
      </div>
      <div className="w-full h-px bg-gray-800 mb-4"></div>
      <nav className="flex flex-col items-center gap-1 mb-4">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 mb-2">
              <Bot className="h-5 w-5 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">AI Assistant</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 mb-2">
              <GitBranch className="h-5 w-5 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Workflows</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 mb-2">
              <Webhook className="h-5 w-5 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Webhooks</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 mb-2">
              <FileCode className="h-5 w-5 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Text Editor</TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 mb-2">
              <Folder className="h-5 w-5 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Files</TooltipContent>
        </Tooltip>
      </nav>
      <div className="w-full h-px bg-gray-800 mb-4"></div>
      <div className="mt-auto flex flex-col items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon">
              <Settings2 className="h-5 w-5 text-white" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Settings</TooltipContent>
        </Tooltip>
      </div>
    </aside>
  )
}