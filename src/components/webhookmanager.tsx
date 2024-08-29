import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from '@/firebase.js';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
// The import statement for Label is correct, but ensure that the module is installed.
// You can install it using npm or yarn as mentioned in the chat history.

interface Webhook {
  id: string;
  label: string;
  url: string;
  method: string;
}

const WebhookManager: React.FC<{ webhooks: Webhook[], setWebhooks: React.Dispatch<React.SetStateAction<Webhook[]>> }> = ({ webhooks, setWebhooks }) => {
  const [newWebhook, setNewWebhook] = useState<Partial<Webhook>>({
    label: '',
    url: '',
    method: 'POST',
  });

  const [editingWebhookId, setEditingWebhookId] = useState<string | null>(null);

  useEffect(() => {
    const fetchWebhooks = async () => {
      try {
        const webhooksCollection = collection(db, 'webhooks');
        const webhookSnapshot = await getDocs(webhooksCollection);
        const webhookList = webhookSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Webhook));
        setWebhooks(webhookList);
      } catch (error) {
        console.error('Error fetching webhooks: ', error);
      }
    };

    fetchWebhooks();
  }, [setWebhooks]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewWebhook(prev => ({ ...prev, [name]: value }));
  };

  const addWebhook = async () => {
    try {
      if (editingWebhookId) {
        const webhookDoc = doc(db, "webhooks", editingWebhookId);
        await updateDoc(webhookDoc, newWebhook);
        setWebhooks(webhooks.map(webhook => (webhook.id === editingWebhookId ? { ...webhook, ...newWebhook } : webhook)));
        setEditingWebhookId(null);
      } else {
        const docRef = await addDoc(collection(db, "webhooks"), newWebhook);
        setWebhooks([...webhooks, { id: docRef.id, ...newWebhook } as Webhook]);
      }
      setNewWebhook({
        label: '',
        url: '',
        method: 'POST',
      });
    } catch (e) {
      console.error("Error adding or updating webhook: ", e);
    }
  };

  const deleteWebhook = async (id: string) => {
    try {
      const webhookDoc = doc(db, "webhooks", id);
      await deleteDoc(webhookDoc);
      setWebhooks(webhooks.filter(webhook => webhook.id !== id));
    } catch (e) {
      console.error("Error deleting webhook: ", e);
    }
  };

  const startEditing = (webhook: Webhook) => {
    setEditingWebhookId(webhook.id);
    setNewWebhook({
      label: webhook.label,
      url: webhook.url,
      method: webhook.method,
    });
  };

  const cancelEditing = () => {
    setEditingWebhookId(null);
    setNewWebhook({
      label: '',
      url: '',
      method: 'POST',
    });
  };

  return (
    <div className="p-6 bg-background text-foreground">
      <div className="mb-6">
        <Card className="bg-card text-card-foreground">
          <CardHeader>
            <CardTitle>{editingWebhookId ? 'Edit Webhook' : 'Add New Webhook'}</CardTitle>
            <CardDescription className="text-muted-foreground">{editingWebhookId ? 'Update the details for the webhook' : 'Enter the details for a new webhook'}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-2">
                <Label htmlFor="label">Label</Label>
                <Input
                  id="label"
                  name="label"
                  value={newWebhook.label}
                  onChange={handleInputChange}
                  placeholder="Webhook Label"
                  className="bg-input text-input-foreground"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="url">URL</Label>
                <Input
                  id="url"
                  name="url"
                  value={newWebhook.url}
                  onChange={handleInputChange}
                  placeholder="Webhook URL"
                  className="bg-input text-input-foreground"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="method">HTTP Method</Label>
                <Input
                  id="method"
                  name="method"
                  value={newWebhook.method}
                  onChange={handleInputChange}
                  placeholder="POST"
                  className="bg-input text-input-foreground"
                />
              </div>
              <div className="flex space-x-4">
                <Button onClick={addWebhook} className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  {editingWebhookId ? 'Update Webhook' : 'Add Webhook'}
                </Button>
                {editingWebhookId && (
                  <Button onClick={cancelEditing} variant="secondary" className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80">
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {webhooks.map(webhook => (
          <Card key={webhook.id} className="w-full bg-card text-card-foreground">
            <CardHeader>
              <CardTitle>{webhook.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                <div>
                  <strong className="text-muted-foreground">URL:</strong> <div>{webhook.url}</div>
                </div>
                <div>
                  <strong className="text-muted-foreground">Method:</strong> <div>{webhook.method}</div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={() => startEditing(webhook)} className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/80">Edit</Button>
                  <Button onClick={() => deleteWebhook(webhook.id)} variant="destructive" className="w-full bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default WebhookManager;