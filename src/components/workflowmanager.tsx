import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { collection, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from '@/firebase.js';
import { Workflow } from '@/types';

const WorkflowManager: React.FC<{ workflows: Workflow[], setWorkflows: React.Dispatch<React.SetStateAction<Workflow[]>> }> = ({ workflows, setWorkflows }) => {
  const [newWorkflow, setNewWorkflow] = useState<Partial<Workflow>>({
    title: '',
    description: '',
    chatflowId: '',
    expectedInput: '',
    exampleInput: ''
  });

  const [editingWorkflowId, setEditingWorkflowId] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewWorkflow(prev => ({ ...prev, [name]: value }));
  };

  const addWorkflow = async () => {
    try {
      const docRef = await addDoc(collection(db, "workflows"), newWorkflow);
      setWorkflows([...workflows, { id: docRef.id, ...newWorkflow } as Workflow]);
      setNewWorkflow({
        title: '',
        description: '',
        chatflowId: '',
        expectedInput: '',
        exampleInput: ''
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  const updateWorkflow = async (id: string, updatedWorkflow: Partial<Workflow>) => {
    const workflowDoc = doc(db, "workflows", id);
    try {
      await updateDoc(workflowDoc, updatedWorkflow);
      setWorkflows(workflows.map(workflow => (workflow.id === id ? { ...workflow, ...updatedWorkflow } : workflow)));
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
    <div className="flex flex-col h-full overflow-hidden">
      <div className="p-6 bg-background">
        <Card>
          <CardHeader>
            <CardTitle>Add New Workflow</CardTitle>
            <CardDescription>Enter the details for a new workflow</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  value={newWorkflow.title}
                  onChange={handleInputChange}
                  placeholder="Workflow Title"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={newWorkflow.description}
                  onChange={handleInputChange}
                  placeholder="Workflow Description"
                  className="min-h-[100px]"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="chatflowId">Chatflow ID</Label>
                <Input
                  id="chatflowId"
                  name="chatflowId"
                  value={newWorkflow.chatflowId}
                  onChange={handleInputChange}
                  placeholder="Chatflow ID"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="expectedInput">Expected Input</Label>
                <Input
                  id="expectedInput"
                  name="expectedInput"
                  value={newWorkflow.expectedInput}
                  onChange={handleInputChange}
                  placeholder="Expected Input"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="exampleInput">Example Input</Label>
                <Textarea
                  id="exampleInput"
                  name="exampleInput"
                  value={newWorkflow.exampleInput}
                  onChange={handleInputChange}
                  placeholder="Example Input"
                  className="min-h-[100px]"
                />
              </div>
              <Button onClick={addWorkflow} className="w-full">Add Workflow</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map(workflow => (
            <Card key={workflow.id} className="w-full">
              <CardHeader>
                <CardTitle>{workflow.title}</CardTitle>
              </CardHeader>
              <CardContent>
                {editingWorkflowId === workflow.id ? (
                  <div className="grid gap-4">
                    <div className="grid gap-1">
                      <Label>Description:</Label>
                      <Textarea
                        value={workflow.description}
                        onChange={(e) => updateWorkflow(workflow.id, { description: e.target.value })}
                        className="min-h-[60px]"
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label>Chatflow ID:</Label>
                      <Input
                        value={workflow.chatflowId}
                        onChange={(e) => updateWorkflow(workflow.id, { chatflowId: e.target.value })}
                        placeholder="Chatflow ID"
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label>Expected Input:</Label>
                      <Input
                        value={workflow.expectedInput}
                        onChange={(e) => updateWorkflow(workflow.id, { expectedInput: e.target.value })}
                        placeholder="Expected Input"
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label>Example Input:</Label>
                      <Textarea
                        value={workflow.exampleInput}
                        onChange={(e) => updateWorkflow(workflow.id, { exampleInput: e.target.value })}
                        className="min-h-[60px]"
                        placeholder="Example Input"
                      />
                    </div>
                    <Button onClick={() => setEditingWorkflowId(null)} className="w-full">Save</Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    <div>
                      <strong>Description:</strong> <div>{workflow.description}</div>
                    </div>
                    <div>
                      <strong>Chatflow ID:</strong> <div>{workflow.chatflowId}</div>
                    </div>
                    <div>
                      <strong>Expected Input:</strong> <div>{workflow.expectedInput}</div>
                    </div>
                    <div>
                      <strong>Example Input:</strong> <div>{workflow.exampleInput}</div>
                    </div>
                    <Button onClick={() => setEditingWorkflowId(workflow.id)} className="w-full">Edit</Button>
                    <Button onClick={() => deleteWorkflow(workflow.id)} variant="destructive" className="w-full">Delete Workflow</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WorkflowManager;