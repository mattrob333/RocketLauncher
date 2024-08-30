import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Check, ChevronDown, Pencil, Trash2, X } from "lucide-react";
import { collection, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from '@/firebase.js';
import { Workflow } from '@/types';

interface WorkflowManagerProps {
  workflows: Workflow[];
  setWorkflows: React.Dispatch<React.SetStateAction<Workflow[]>>;
}

const WorkflowManager: React.FC<WorkflowManagerProps> = ({ workflows, setWorkflows }) => {
  console.log("WorkflowManager rendering with workflows:", workflows);

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

  const [editingWorkflow, setEditingWorkflow] = useState<string | null>(null);
  const [editedWorkflow, setEditedWorkflow] = useState<Workflow | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof Omit<Workflow, 'id'>) => {
    const { value } = e.target;
    setNewWorkflow(prev => ({
      ...prev,
      [field]: field === 'expectedInput' || field === 'keyObjectives' || field === 'steps' || field === 'tags'
        ? value.split(',').map(item => item.trim())
        : value
    }));
  };

  const handleEdit = (workflow: Workflow) => {
    setEditingWorkflow(workflow.id);
    setEditedWorkflow(workflow);
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: keyof Workflow) => {
    if (editedWorkflow) {
      const { value } = e.target;
      setEditedWorkflow(prev => ({
        ...prev!,
        [field]: field === 'expectedInput' || field === 'keyObjectives' || field === 'steps' || field === 'tags'
          ? value.split(',').map(item => item.trim())
          : value
      }));
    }
  };

  const addWorkflow = async () => {
    try {
      if (!newWorkflow.chatflowId) {
        console.error("chatflowId is required");
        return;
      }
      const workflowToAdd = {
        ...newWorkflow,
        expectedInput: Array.isArray(newWorkflow.expectedInput) ? newWorkflow.expectedInput : [newWorkflow.expectedInput]
      };
      const docRef = await addDoc(collection(db, "workflows"), workflowToAdd);
      console.log("New workflow added with ID:", docRef.id, "Data:", workflowToAdd);
      setWorkflows(prevWorkflows => [...prevWorkflows, { id: docRef.id, ...workflowToAdd }]);
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
      console.error("Error adding document:", e);
    }
  };

  const deleteWorkflow = async (id: string) => {
    try {
      await deleteDoc(doc(db, "workflows", id));
      setWorkflows(workflows.filter(workflow => workflow.id !== id));
    } catch (e) {
      console.error("Error deleting document:", e);
    }
  };

  const saveEditedWorkflow = async () => {
    if (editedWorkflow) {
      try {
        const { id, ...workflowData } = editedWorkflow;
        await updateDoc(doc(db, "workflows", id), workflowData);
        setWorkflows(prevWorkflows => 
          prevWorkflows.map(w => w.id === id ? editedWorkflow : w)
        );
        setEditingWorkflow(null);
        setEditedWorkflow(null);
      } catch (e) {
        console.error("Error updating document:", e);
      }
    }
  };

  const cancelEdit = () => {
    setEditingWorkflow(null);
    setEditedWorkflow(null);
  };

  const confirmDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this workflow?')) {
      deleteWorkflow(id);
    }
  };

  return (
    <div className="h-full overflow-auto p-6 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-6">Workflow Manager</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1 bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>Add New Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); addWorkflow(); }} className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={newWorkflow.title} onChange={(e) => handleInputChange(e, 'title')} />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={newWorkflow.description} onChange={(e) => handleInputChange(e, 'description')} />
              </div>
              <div>
                <Label htmlFor="chatflowId">Chatflow ID</Label>
                <Input id="chatflowId" value={newWorkflow.chatflowId} onChange={(e) => handleInputChange(e, 'chatflowId')} />
              </div>
              <div>
                <Label htmlFor="expectedInput">Expected Input (comma-separated)</Label>
                <Input id="expectedInput" value={newWorkflow.expectedInput.join(', ')} onChange={(e) => handleInputChange(e, 'expectedInput')} />
              </div>
              <div>
                <Label htmlFor="exampleInput">Example Input</Label>
                <Input id="exampleInput" value={newWorkflow.exampleInput} onChange={(e) => handleInputChange(e, 'exampleInput')} />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input id="category" value={newWorkflow.category} onChange={(e) => handleInputChange(e, 'category')} />
              </div>
              <div>
                <Label htmlFor="keyObjectives">Key Objectives (comma-separated)</Label>
                <Textarea id="keyObjectives" value={newWorkflow.keyObjectives.join(', ')} onChange={(e) => handleInputChange(e, 'keyObjectives')} />
              </div>
              <div>
                <Label htmlFor="steps">Steps (comma-separated)</Label>
                <Textarea id="steps" value={newWorkflow.steps.join(', ')} onChange={(e) => handleInputChange(e, 'steps')} />
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input id="tags" value={newWorkflow.tags.join(', ')} onChange={(e) => handleInputChange(e, 'tags')} />
              </div>
              <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">Add Workflow</Button>
            </form>
          </CardContent>
        </Card>
        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {workflows.map((workflow) => (
            <Card key={workflow.id} className="bg-card text-card-foreground">
              <CardContent className="p-4">
                {editingWorkflow === workflow.id ? (
                  // Edit mode
                  <div>
                    <Input
                      value={editedWorkflow?.title}
                      onChange={(e) => handleEditInputChange(e, 'title')}
                      className="mb-2"
                    />
                    <Input
                      value={editedWorkflow?.category}
                      onChange={(e) => handleEditInputChange(e, 'category')}
                      className="mb-2"
                    />
                    <Textarea
                      value={editedWorkflow?.keyObjectives.join(', ')}
                      onChange={(e) => handleEditInputChange(e, 'keyObjectives')}
                      className="mb-2"
                    />
                    <Textarea
                      value={editedWorkflow?.description}
                      onChange={(e) => handleEditInputChange(e, 'description')}
                      className="mb-2"
                    />
                    <Input
                      value={editedWorkflow?.chatflowId}
                      onChange={(e) => handleEditInputChange(e, 'chatflowId')}
                      className="mb-2"
                    />
                    <Input
                      value={editedWorkflow?.expectedInput.join(', ')}
                      onChange={(e) => handleEditInputChange(e, 'expectedInput')}
                      className="mb-2"
                    />
                    <Input
                      value={editedWorkflow?.exampleInput}
                      onChange={(e) => handleEditInputChange(e, 'exampleInput')}
                      className="mb-2"
                    />
                    <Textarea
                      value={editedWorkflow?.steps.join(', ')}
                      onChange={(e) => handleEditInputChange(e, 'steps')}
                      className="mb-2"
                    />
                    <Input
                      value={editedWorkflow?.tags.join(', ')}
                      onChange={(e) => handleEditInputChange(e, 'tags')}
                      className="mb-2"
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <Button onClick={saveEditedWorkflow} className="bg-primary text-primary-foreground">Save</Button>
                      <Button onClick={cancelEdit} variant="outline">Cancel</Button>
                    </div>
                  </div>
                ) : (
                  // View mode
                  <>
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold">{workflow.title}</h3>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-card-foreground" onClick={() => handleEdit(workflow)}>
                          <Pencil size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive-foreground" onClick={() => confirmDelete(workflow.id)}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{workflow.category}</p>
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-1">Key Objectives:</h4>
                      <ul className="list-none pl-0">
                        {Array.isArray(workflow.keyObjectives) && workflow.keyObjectives.slice(0, 3).map((objective, index) => (
                          <li key={index} className="flex items-center mb-1">
                            <Check size={14} className="mr-2 text-orange-500" />
                            <span className="text-sm">{objective}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <details className="text-sm">
                      <summary className="cursor-pointer flex items-center justify-between text-sm text-muted-foreground hover:text-foreground">
                        View Workflow Details
                        <ChevronDown className="h-4 w-4" />
                      </summary>
                      <div className="mt-2">
                        <p className="mb-2">{workflow.description}</p>
                        <p><strong>Chatflow ID:</strong> {workflow.chatflowId}</p>
                        <p><strong>Expected Input:</strong> {Array.isArray(workflow.expectedInput) ? workflow.expectedInput.join(', ') : workflow.expectedInput}</p>
                        <p><strong>Example Input:</strong> {workflow.exampleInput}</p>
                        <p><strong>Steps:</strong></p>
                        <ol className="list-decimal pl-5 mb-2">
                          {Array.isArray(workflow.steps) && workflow.steps.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ol>
                        <p><strong>Tags:</strong> {Array.isArray(workflow.tags) ? workflow.tags.join(', ') : workflow.tags}</p>
                      </div>
                    </details>
                    <Button className="w-full mt-4 bg-accent text-accent-foreground hover:bg-accent/90">
                      Purchase Workflow
                    </Button>
                  </>
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