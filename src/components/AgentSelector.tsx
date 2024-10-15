import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Plus, X } from "lucide-react";

interface Agent {
  id: string;
  name: string;
}

interface AgentSelectorProps {
  selectedAgentId: string | null;
  onAgentSelect: (agentId: string) => void;
}

export function AgentSelector({ selectedAgentId, onAgentSelect }: AgentSelectorProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [newAgentId, setNewAgentId] = useState('');
  const [newAgentName, setNewAgentName] = useState('');

  useEffect(() => {
    // Load agents from local storage
    const storedAgents = localStorage.getItem('curatedAgents');
    if (storedAgents) {
      setAgents(JSON.parse(storedAgents));
    }
  }, []);

  const saveAgents = (updatedAgents: Agent[]) => {
    localStorage.setItem('curatedAgents', JSON.stringify(updatedAgents));
    setAgents(updatedAgents);
  };

  const addAgent = () => {
    if (newAgentId && newAgentName) {
      const updatedAgents = [...agents, { id: newAgentId, name: newAgentName }];
      saveAgents(updatedAgents);
      setNewAgentId('');
      setNewAgentName('');
    }
  };

  const removeAgent = (agentId: string) => {
    const updatedAgents = agents.filter(agent => agent.id !== agentId);
    saveAgents(updatedAgents);
  };

  return (
    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline" className="w-[400px] justify-start">
          {selectedAgentId ? agents.find(a => a.id === selectedAgentId)?.name : 'Select an agent'}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-2">Select an Agent</h3>
          <div className="max-h-[60vh] overflow-y-auto pr-2">
            {agents.map((agent) => (
              <div key={agent.id} className="flex justify-between items-center mb-2">
                <Button
                  onClick={() => {
                    onAgentSelect(agent.id);
                    setIsDrawerOpen(false);
                  }}
                  variant="ghost"
                  className="w-full justify-start"
                >
                  {agent.name}
                </Button>
                <Button
                  onClick={() => removeAgent(agent.id)}
                  variant="ghost"
                  size="icon"
                  className="ml-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <Input
              placeholder="Agent ID"
              value={newAgentId}
              onChange={(e) => setNewAgentId(e.target.value)}
              className="mb-2"
            />
            <Input
              placeholder="Agent Name"
              value={newAgentName}
              onChange={(e) => setNewAgentName(e.target.value)}
              className="mb-2"
            />
            <Button onClick={addAgent} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Agent
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
