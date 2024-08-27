import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@radix-ui/react-separator";
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from "@radix-ui/react-collapsible";
import { Check, ChevronDown, Pencil, Trash2 } from "lucide-react";
import { collection, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from '@/firebase.js';
import { Workflow } from '@/types';

interface WorkflowManagerProps {
  workflows: Workflow[];
  setWorkflows: React.Dispatch<React.SetStateAction<Workflow[]>>;
}

const WorkflowManager: React.FC<WorkflowManagerProps> = ({ workflows, setWorkflows }) => {
  const [newWorkflow, setNewWorkflow] = useState<Omit<Workflow, 'id'>>({
    title: '',
    description: '',
    chatflowId: '',
    expectedInput: [],
    exampleInput: '',
    category: '',
    keyObjectives: [],
    steps: [],
    tags: []
  });
  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => {
    const { value } = e.target;
    const updateValue = ['keyObjectives', 'steps', 'tags', 'expectedInput'].includes(field)
      ? value.split(',').map(item => item.trim())
      : value;

    setNewWorkflow(prev => ({ ...prev, [field]: updateValue }));
  };

  const addWorkflow = async () => {
    try {
      const docRef = await addDoc(collection(db, "workflows"), newWorkflow);
      setWorkflows([...workflows, { id: docRef.id, ...newWorkflow } as Workflow]);
      setNewWorkflow({
        title: '',
        description: '',
        chatflowId: '',
        expectedInput: [],
        exampleInput: '',
        category: '',
        keyObjectives: [],
        steps: [],
        tags: []
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const updateWorkflow = async (id: string) => {
    const workflowToUpdate = workflows.find(wf => wf.id === id);
    if (!workflowToUpdate) return;

    const workflowDoc = doc(db, "workflows", id);
    try {
      const { id: _, ...updateData } = workflowToUpdate;
      await updateDoc(workflowDoc, updateData);
      setEditingWorkflowId(null);
    } catch (e) {
      console.error("Error updating document: ", e);
    }
  };

  const deleteWorkflow = async (id: string) => {
    const workflowDoc = doc(db, "workflows", id);
    try {
      await deleteDoc(workflowDoc);
      setWorkflows(workflows.filter(workflow => workflow.id !== id));
    } catch (e) {
      console.error("Error deleting document: ", e);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Input form - 1/3 of the page */}
      <div className="w-1/3 p-4 bg-background dark:bg-gray-800 overflow-y-auto">
        <Card>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); addWorkflow(); }} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" value={newWorkflow.title} onChange={(e) => handleInputChange(e, 'title')} />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" name="description" value={newWorkflow.description} onChange={(e) => handleInputChange(e, 'description')} />
              </div>
              <div>
                <Label htmlFor="chatflowId">Chatflow ID</Label>
                <Input id="chatflowId" name="chatflowId" value={newWorkflow.chatflowId} onChange={(e) => handleInputChange(e, 'chatflowId')} />
              </div>
              <div>
                <Label htmlFor="expectedInput">Expected Input (comma separated)</Label>
                <Input id="expectedInput" name="expectedInput" value={newWorkflow.expectedInput.join(', ')} onChange={(e) => handleInputChange(e, 'expectedInput')} />
              </div>
              <div>
                <Label htmlFor="exampleInput">Example Input</Label>
                <Textarea id="exampleInput" name="exampleInput" value={newWorkflow.exampleInput} onChange={(e) => handleInputChange(e, 'exampleInput')} />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" name="category" value={newWorkflow.category} onChange={(e) => handleInputChange(e, 'category')} />
              </div>
              <div>
                <Label htmlFor="keyObjectives">Key Objectives (comma separated)</Label>
                <Input id="keyObjectives" name="keyObjectives" value={newWorkflow.keyObjectives.join(', ')} onChange={(e) => handleInputChange(e, 'keyObjectives')} />
              </div>
              <div>
                <Label htmlFor="steps">Steps (comma separated)</Label>
                <Input id="steps" name="steps" value={newWorkflow.steps.join(', ')} onChange={(e) => handleInputChange(e, 'steps')} />
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma separated)</Label>
                <Input id="tags" name="tags" value={newWorkflow.tags.join(', ')} onChange={(e) => handleInputChange(e, 'tags')} />
              </div>
              <Button type="submit" className="w-full">Add Workflow</Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Workflow cards - 2/3 of the page */}
      <div className="w-2/3 p-4 bg-background-secondary dark:bg-gray-900 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-grow pr-4">
                    <h3 className="text-xl font-bold text-[#003366] dark:text-blue-300">{workflow.title}</h3>
                    <div className="rounded-full bg-[#E0E7FF] dark:bg-blue-900 px-2 py-1 text-xs font-medium text-[#003366] dark:text-blue-200 inline-block mt-2">
                      {workflow.category}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="sm" className="text-[#003366] dark:text-blue-300" onClick={() => setEditingWorkflowId(workflow.id)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => deleteWorkflow(workflow.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <ul className="mt-3 space-y-1 text-sm text-[#003366] dark:text-blue-200">
                  {Array.isArray(workflow.keyObjectives) && workflow.keyObjectives.slice(0, 3).map((objective, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="mr-2 h-3 w-3 mt-1 flex-shrink-0 text-[#003366] dark:text-blue-300" />
                      <span>{objective}</span>
                    </li>
                  ))}
                </ul>
                <Collapsible className="mt-3">
                  <CollapsibleTrigger className="flex w-full items-center justify-between text-sm text-[#003366] dark:text-blue-300 hover:bg-[#F0F4FF] dark:hover:bg-gray-700 p-2 rounded">
                    <span>View Workflow Details</span>
                    <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:rotate-180" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-2 text-sm">
                    <div className="space-y-2 text-sm">
                      <p><strong>Description:</strong> {workflow.description}</p>
                      <p><strong>Chatflow ID:</strong> {workflow.chatflowId}</p>
                      <div>
                        <strong>Expected Input:</strong>
                        <ul className="list-disc pl-5">
                          {Array.isArray(workflow.expectedInput) && workflow.expectedInput.map((input, index) => (
                            <li key={index}>{input}</li>
                          ))}
                        </ul>
                      </div>
                      <p><strong>Example Input:</strong> {workflow.exampleInput}</p>
                      <div>
                        <strong>Steps:</strong>
                        <ol className="list-decimal pl-5">
                          {Array.isArray(workflow.steps) && workflow.steps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
                      </div>
                      <div>
                        <strong>Tags:</strong>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {Array.isArray(workflow.tags) && workflow.tags.map((tag, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>
                <Button className="w-full mt-3 bg-green-500 hover:bg-green-600 text-white dark:bg-green-600 dark:hover:bg-green-700">
                  Purchase Workflow
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkflowManager;