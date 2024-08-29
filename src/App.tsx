import React, { useState, useEffect } from 'react';
import { ThemeProvider } from "next-themes"
import { ThemeToggle } from "./components/theme-toggle"
import { SideMenu } from "./components/SideMenu"
import { ChatContainer } from "./components/chatcontainer"
import { WorkflowDescription } from "./components/workflowdescription"
import WorkflowManager from "./components/workflowmanager"
import WebhookManager from "./components/webhookmanager"
import LandingPage from "./components/LandingPage"
import { Workflow, Webhook } from './types';
import { collection, getDocs } from "firebase/firestore";
import { db } from '@/firebase.js';
import rocketLauncherLogo from './assets/rocketlauncher_logo_v2.svg';

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'chat' | 'manage' | 'webhooks'>('landing');
  const [selectedFlowId, setSelectedFlowId] = useState<string>('');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch workflows
        const workflowSnapshot = await getDocs(collection(db, "workflows"));
        const workflowsData = workflowSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workflow));
        console.log("Fetched workflows:", workflowsData);
        setWorkflows(workflowsData);
  
        // Fetch webhooks
        const webhookSnapshot = await getDocs(collection(db, "webhooks"));
        const webhooksData = webhookSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Webhook));
        console.log("Fetched webhooks:", webhooksData);
        setWebhooks(webhooksData);
        
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, []);
  

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="flex flex-col h-screen bg-black text-gray-300">
        <header className="flex justify-between items-center p-4 bg-black text-gray-300 border-b border-gray-800">
          <div className="flex items-center">
            <img src={rocketLauncherLogo} alt="RocketLauncher Logo" className="h-12 w-auto" />
            <span className="ml-2 text-xl font-['Montserrat'] font-medium tracking-[0.104em] uppercase">
              Rocket Launcher
            </span>
          </div>
          <ThemeToggle />
        </header>

        <div className="flex flex-1 overflow-hidden">
          <div className="border-r border-gray-800">
            <SideMenu setCurrentView={setCurrentView} openNotepad={() => {}} />
          </div>
          <main className="flex-1 overflow-auto bg-black text-gray-300">
            {currentView === 'landing' && <LandingPage />}
            {currentView === 'manage' && (
              <WorkflowManager workflows={workflows} setWorkflows={setWorkflows} />
            )}
            {currentView === 'chat' && (
              <div className="flex h-full">
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
              </div>
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