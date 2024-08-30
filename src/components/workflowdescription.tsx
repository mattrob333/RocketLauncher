import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@radix-ui/react-collapsible";
import { Check, ChevronDown, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Workflow } from '@/types';
import NotepadDrawer from "@/components/notepaddrawer";

interface WorkflowDescriptionProps {
  selectedWorkflow?: Workflow;
}

export function WorkflowDescription({ selectedWorkflow }: WorkflowDescriptionProps) {
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);

  return (
    <div className="w-1/4 flex flex-col h-full bg-background text-foreground border-l border-border">
      {/* Profile Card */}
      <div className="bg-card shadow-lg">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-card-foreground">User Profile</h2>
          <p className="text-sm text-muted-foreground">Profile details will go here</p>
        </div>
      </div>

      {/* Workflow Description */}
      <div className="flex-grow overflow-y-auto p-4">
        {!selectedWorkflow ? (
          <p className="text-sm text-muted-foreground">
            Select a workflow to see its description here.
          </p>
        ) : (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-grow pr-4">
                  <h3 className="text-xl font-bold text-primary">{selectedWorkflow.title}</h3>
                  <div className="rounded-full bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground inline-block mt-2">
                    {selectedWorkflow.category}
                  </div>
                </div>
              </div>
              <ul className="mt-3 space-y-1 text-sm text-foreground">
                {Array.isArray(selectedWorkflow.keyObjectives) && selectedWorkflow.keyObjectives.map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="mr-2 h-3 w-3 mt-1 flex-shrink-0 text-primary" />
                    <span>{objective}</span>
                  </li>
                ))}
              </ul>
              <Collapsible className="mt-3">
                <CollapsibleTrigger className="flex w-full items-center justify-between text-sm text-primary hover:bg-secondary p-2 rounded">
                  <span>View Workflow Details</span>
                  <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-180" />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 text-sm">
                  <div className="space-y-2">
                    <p><strong>Description:</strong> {selectedWorkflow.description}</p>
                    <p><strong>Chatflow ID:</strong> {selectedWorkflow.chatflowId}</p>
                    <div>
                      <strong>Expected Input:</strong>
                      <ul className="list-disc pl-5">
                        {Array.isArray(selectedWorkflow.expectedInput) && selectedWorkflow.expectedInput.map((input, index) => (
                          <li key={index}>{input}</li>
                        ))}
                      </ul>
                    </div>
                    <p><strong>Example Input:</strong> {selectedWorkflow.exampleInput}</p>
                    <div>
                      <strong>Steps:</strong>
                      <ol className="list-decimal pl-5">
                        {Array.isArray(selectedWorkflow.steps) && selectedWorkflow.steps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                    <div>
                      <strong>Tags:</strong>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Array.isArray(selectedWorkflow.tags) && selectedWorkflow.tags.map((tag, index) => (
                          <span key={index} className="bg-secondary text-secondary-foreground text-xs font-medium mr-2 px-2.5 py-0.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Notepad Button */}
      <div className="p-4 bg-card flex justify-end">
        <Button
          onClick={() => setIsNotepadOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          <Pencil className="mr-2 h-4 w-4" />
          Open Notepad
        </Button>
      </div>

      {/* Notepad Drawer */}
      <NotepadDrawer
        isOpen={isNotepadOpen}
        onClose={() => setIsNotepadOpen(false)}
      />
    </div>
  );
}