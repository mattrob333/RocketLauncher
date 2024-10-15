import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@radix-ui/react-collapsible";
import { Check, ChevronDown, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Workflow } from '@/types';
import NotepadDrawer from "@/components/notepaddrawer";

interface WorkflowDescriptionProps {
  selectedWorkflow?: Workflow;
  className?: string;
}

export function WorkflowDescription({ selectedWorkflow, className }: WorkflowDescriptionProps) {
  if (!selectedWorkflow) return null;

  const [isNotepadOpen, setIsNotepadOpen] = useState(false);

  const toggleNotepad = () => {
    setIsNotepadOpen(!isNotepadOpen);
  };

  return (
    <div className={`h-full w-1/4 p-2 border-l border-border overflow-y-auto ${className}`}>
      {/* Profile Card */}
      <div className="bg-card shadow-lg mb-2">
        <div className="p-3">
          <h2 className="text-base font-semibold text-card-foreground">User Profile</h2>
          <p className="text-xs text-muted-foreground">Profile details will go here</p>
        </div>
      </div>

      {/* Workflow Description */}
      <div className="flex-grow overflow-y-auto">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-start justify-between">
              <div className="flex-grow pr-2">
                <h3 className="text-lg font-bold text-primary">{selectedWorkflow.title}</h3>
                <div className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground inline-block mt-1">
                  {selectedWorkflow.category}
                </div>
              </div>
            </div>
            <ul className="mt-2 space-y-1 text-xs text-foreground">
              {Array.isArray(selectedWorkflow.keyObjectives) && selectedWorkflow.keyObjectives.map((objective, index) => (
                <li key={index} className="flex items-start">
                  <Check className="mr-1 h-3 w-3 mt-0.5 flex-shrink-0 text-primary" />
                  <span>{objective}</span>
                </li>
              ))}
            </ul>
            <Collapsible className="mt-2">
              <CollapsibleTrigger className="flex w-full items-center justify-between text-xs text-primary hover:bg-secondary p-1 rounded">
                <span>View Workflow Details</span>
                <ChevronDown className="h-3 w-3 transition-transform [&[data-state=open]]:rotate-180" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-1 text-xs">
                <div className="space-y-1">
                  <p><strong>Description:</strong> {selectedWorkflow.description}</p>
                  <p><strong>Chatflow ID:</strong> {selectedWorkflow.chatflowId}</p>
                  <div>
                    <strong>Expected Input:</strong>
                    <ul className="list-disc pl-4">
                      {Array.isArray(selectedWorkflow.expectedInput) && selectedWorkflow.expectedInput.map((input, index) => (
                        <li key={index}>{input}</li>
                      ))}
                    </ul>
                  </div>
                  <p><strong>Example Input:</strong> {selectedWorkflow.exampleInput}</p>
                  <div>
                    <strong>Steps:</strong>
                    <ol className="list-decimal pl-4">
                      {Array.isArray(selectedWorkflow.steps) && selectedWorkflow.steps.map((step, index) => (
                        <li key={index}>{step}</li>
                      ))}
                    </ol>
                  </div>
                  <div>
                    <strong>Tags:</strong>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {Array.isArray(selectedWorkflow.tags) && selectedWorkflow.tags.map((tag, index) => (
                        <span key={index} className="bg-secondary text-secondary-foreground text-xs font-medium mr-1 px-1.5 py-0.5 rounded">
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
      </div>

      {/* Notepad Button */}
      <div className="p-2 bg-card flex justify-end mt-2">
        <Button
          onClick={toggleNotepad}
          className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs py-1 px-2"
        >
          {isNotepadOpen ? (
            <>
              <X className="mr-1 h-3 w-3" />
              Close Notepad
            </>
          ) : (
            <>
              <Pencil className="mr-1 h-3 w-3" />
              Open Notepad
            </>
          )}
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
