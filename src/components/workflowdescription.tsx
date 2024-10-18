"use client"

import React from 'react';
import { Workflow } from '@/types';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { MessageSquare, FileInput, Tags, ChevronDown, ChevronUp, BarChart2, Check, Info, ListOrdered, FileLineChart } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface WorkflowDescriptionProps {
  selectedWorkflow: Workflow | null;
  className?: string;
}

export function WorkflowDescription({ selectedWorkflow, className }: WorkflowDescriptionProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);

  const toggleExpand = () => setIsExpanded(!isExpanded);

  if (!selectedWorkflow) {
    return <div className={className}>No workflow selected</div>;
  }

  return (
    <Card className={`${className} bg-[hsl(20_14.3%_4.1%)] text-[hsl(60_9.1%_97.8%)] border-[hsl(12_6.5%_15.1%)]`}>
      <CardHeader className="border-b border-[hsl(12_6.5%_15.1%)] p-4">
        <h2 className="text-xl font-bold">{selectedWorkflow.title}</h2>
        <Badge variant="secondary" className="bg-[hsl(12_6.5%_15.1%)] text-[hsl(60_9.1%_97.8%)]">{selectedWorkflow.category}</Badge>
      </CardHeader>
      <CardContent className="p-0">
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger className="flex justify-between items-center w-full p-4 hover:bg-[hsl(12_6.5%_15.1%)]">
            <span className="font-semibold">Overview</span>
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 space-y-4">
              <p className="pl-4">{selectedWorkflow.description}</p>
              <div>
                <strong className="flex items-center gap-2 mb-2"><BarChart2 size={16} />Key Objectives:</strong>
                <ul className="space-y-1 pl-8">
                  {selectedWorkflow.keyObjectives.map((objective, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check size={16} className="text-[hsl(220_70%_50%)]" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
        <Collapsible>
          <CollapsibleTrigger className="flex justify-between items-center w-full p-4 hover:bg-[hsl(12_6.5%_15.1%)]">
            <span className="font-semibold flex items-center gap-2">
              <ListOrdered size={16} />
              Workflow Steps
            </span>
            <ChevronDown size={16} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4">
              <ol className="list-decimal list-inside space-y-1 pl-4">
                {selectedWorkflow.steps.map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
            </div>
          </CollapsibleContent>
        </Collapsible>
        <Collapsible>
          <CollapsibleTrigger className="flex justify-between items-center w-full p-4 hover:bg-[hsl(12_6.5%_15.1%)]">
            <span className="font-semibold flex items-center gap-2">
              <Info size={16} />
              Technical Details
            </span>
            <ChevronDown size={16} />
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="p-4 space-y-4">
              <p><strong>Chatflow ID:</strong> {selectedWorkflow.chatflowId}</p>

              <div>
                <strong className="flex items-center gap-2"><MessageSquare size={16} />Expected Input:</strong>
                <p className="pl-6 mt-1">{selectedWorkflow.expectedInput}</p>
              </div>

              <div>
                <strong className="flex items-center gap-2"><FileInput size={16} />Example Input:</strong>
                <p className="pl-6 mt-1">{selectedWorkflow.exampleInput}</p>
              </div>

              <div>
                <strong className="flex items-center gap-2"><Tags size={16} />Tags:</strong>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selectedWorkflow.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="bg-[hsl(280_65%_60%)] text-[hsl(60_9.1%_97.8%)]">{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
      <CardFooter className="flex justify-end p-4 border-t border-[hsl(12_6.5%_15.1%)]">
        <Button variant="outline" className="flex items-center gap-2 bg-[hsl(12_6.5%_15.1%)] text-[hsl(60_9.1%_97.8%)] hover:bg-[hsl(20.5_90.2%_48.2%)] hover:text-[hsl(60_9.1%_97.8%)]">
          <FileLineChart size={16} />
          View Diagram
        </Button>
      </CardFooter>
    </Card>
  );
}
