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
import { db } from './firebase';
import { Toaster } from "sonner";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import NotepadDrawer from "./components/notepaddrawer";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

const AppContent: React.FC = () => {
  const [selectedFlowId, setSelectedFlowId] = useState<string>('');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const workflowSnapshot = await getDocs(collection(db, "workflows"));
        const workflowsData = workflowSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workflow));
        setWorkflows(workflowsData);

        const webhookSnapshot = await getDocs(collection(db, "webhooks"));
        const webhooksData = webhookSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Webhook));
        setWebhooks(webhooksData);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load data. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Add error and loading state handling
  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  if (isLoading) {
    return <div className="text-white p-4">Loading...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-black text-gray-300">
      <header className="flex justify-between items-center p-4 bg-black text-gray-300 border-b border-gray-800">
        <div className="flex items-center">
          <span className="text-xl font-['Montserrat'] font-medium tracking-[0.104em] uppercase">
            🚀 Rocket Launcher
          </span>
        </div>
        <ThemeToggle />
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div className="border-r border-gray-800">
          <SideMenu navigate={navigate} openNotepad={() => setIsNotepadOpen(true)} />
        </div>
        <main className="flex-1 overflow-auto bg-black text-gray-300">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/chat" element={
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
            } />
            <Route path="/manage" element={<WorkflowManager workflows={workflows} setWorkflows={setWorkflows} />} />
            <Route path="/webhooks" element={<WebhookManager webhooks={webhooks} setWebhooks={setWebhooks} />} />
            <Route path="/markdown" element={<NotepadDrawer isOpen={isNotepadOpen} onClose={() => setIsNotepadOpen(false)} />} />
          </Routes>
        </main>
        <NotepadDrawer isOpen={isNotepadOpen} onClose={() => setIsNotepadOpen(false)} />
      </div>
    </div>
  );
}

export default App;