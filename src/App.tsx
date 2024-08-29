import React, { useState, useEffect } from 'react';
import { ThemeProvider } from "next-themes"
import { ThemeToggle } from "./components/theme-toggle"
import { SideMenu } from "./components/SideMenu"
import { ChatContainer } from "./components/chatcontainer"
import { WorkflowDescription } from "./components/workflowdescription"
import WorkflowManager from "./components/workflowmanager"
import WebhookManager from "./components/webhookmanager"
import { Workflow, Webhook } from './types';
import { collection, getDocs } from "firebase/firestore";
import { db } from '@/firebase.js';

function App() {
  const [currentView, setCurrentView] = useState<'chat' | 'manage' | 'webhooks'>('chat');
  const [selectedFlowId, setSelectedFlowId] = useState<string>('');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch workflows
        const workflowSnapshot = await getDocs(collection(db, "workflows"));
        const workflowsData = workflowSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workflow));
        console.log("Fetched workflows:", workflowsData); // Add this line for logging
        setWorkflows(workflowsData);
  
        // Fetch webhooks
        const webhookSnapshot = await getDocs(collection(db, "webhooks"));
        const webhooksData = webhookSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Webhook));
        console.log("Fetched webhooks:", webhooksData); // Add this line for logging
        setWebhooks(webhooksData);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, []);
  

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="flex flex-col h-screen bg-background text-foreground">
        <header className="flex justify-between items-center p-4 bg-secondary text-secondary-foreground">
          <h1 className="text-2xl font-bold">🚀RocketLauncher</h1>
          <ThemeToggle />
        </header>

        <div className="flex flex-1 overflow-hidden">
          <SideMenu setCurrentView={setCurrentView} />
          <main className="flex-1 overflow-hidden flex flex-col md:flex-row bg-background text-foreground">
            {currentView === 'manage' && (
              <WorkflowManager workflows={workflows} setWorkflows={setWorkflows} />
            )}
            {currentView === 'chat' && (
              <>
                <div className="flex-1 overflow-hidden flex flex-col">
                  <ChatContainer
                    selectedFlowId={selectedFlowId}
                    setSelectedFlowId={setSelectedFlowId}
                    workflows={workflows}
                    webhooks={webhooks}
                  />
                </div>
                <WorkflowDescription
                  selectedWorkflow={workflows.find(w => w.chatflowId === selectedFlowId)}
                />
              </>
            )}
            {currentView === 'webhooks' && (
              <WebhookManager webhooks={webhooks} setWebhooks={setWebhooks} />
            )}
          </main>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;