// src/components/WorkflowDescription.tsx

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Workflow } from '@/types';

interface WorkflowDescriptionProps {
  selectedWorkflow?: Workflow;
}

export function WorkflowDescription({ selectedWorkflow }: WorkflowDescriptionProps) {
  return (
    <div className="w-1/4 p-4 overflow-y-auto bg-background text-foreground border-l border-border">
      <Card className="h-full">
        <CardHeader>
          <CardTitle>
            {selectedWorkflow ? selectedWorkflow.title : 'Workflow Description'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!selectedWorkflow ? (
            <p className="text-sm text-muted-foreground">
              Select a workflow to see its description here.
            </p>
          ) : (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Description:</h3>
                <p className="text-sm">{selectedWorkflow.description}</p>
              </div>
              <div>
                <h3 className="font-semibold">Chatflow ID:</h3>
                <p className="text-sm">{selectedWorkflow.chatflowId}</p>
              </div>
              <div>
                <h3 className="font-semibold">Expected Input:</h3>
                <p className="text-sm">{selectedWorkflow.expectedInput}</p>
              </div>
              <div>
                <h3 className="font-semibold">Example Input:</h3>
                <p className="text-sm">{selectedWorkflow.exampleInput}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}