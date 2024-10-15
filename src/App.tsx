import { useState, useEffect } from 'react';
import { ThemeProvider } from "next-themes"
import { ThemeToggle } from "./components/theme-toggle"
import { SideMenu } from "./components/SideMenu"
import { ChatContainer } from "./components/chatcontainer"
import { WorkflowDescription } from "./components/workflowdescription"
import WorkflowManager from "./components/workflowmanager"
import WebhookManager from "./components/webhookmanager"
import LandingPage from "./components/LandingPage"
import { Toaster } from "sonner";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import NotepadDrawer from "./components/notepaddrawer";
import DocumentManager from "./components/DocumentManager";
import { Workflow, Webhook } from '@/types';
import { collection, getDocs } from "firebase/firestore";
import { db } from '@/firebase.js';

const queryClient = new QueryClient();

function AppContent() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [selectedFlowId, setSelectedFlowId] = useState<string>('');
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  const [openAIKey, setOpenAIKey] = useState<string>('');

  useEffect(() => {
    const fetchWorkflows = async () => {
      const workflowsCollection = collection(db, 'workflows');
      const workflowSnapshot = await getDocs(workflowsCollection);
      const workflowList = workflowSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workflow));
      setWorkflows(workflowList);
    };

    const fetchWebhooks = async () => {
      const webhooksCollection = collection(db, 'webhooks');
      const webhookSnapshot = await getDocs(webhooksCollection);
      const webhookList = webhookSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Webhook));
      setWebhooks(webhookList);
    };

    fetchWorkflows();
    fetchWebhooks();
  }, []);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key is not set in environment variables');
    } else {
      console.log('OpenAI API key is set');
      setOpenAIKey(apiKey);
    }
  }, []);

  const openNotepad = () => setIsNotepadOpen(true);
  const closeNotepad = () => setIsNotepadOpen(false);

  return (
    <div className="flex h-screen bg-background">
      <SideMenu navigate={navigate} openNotepad={openNotepad} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chat" element={
            <div className="flex h-full">
              <div className="flex flex-grow">
                <ChatContainer 
                  selectedFlowId={selectedFlowId} 
                  setSelectedFlowId={setSelectedFlowId} 
                  workflows={workflows} 
                  webhooks={webhooks} 
                  openAIKey={openAIKey}
                />
                <WorkflowDescription 
                  selectedWorkflow={workflows.find(w => w.chatflowId === selectedFlowId)} 
                />
              </div>
            </div>
          } />
          <Route path="/workflows" element={<WorkflowManager workflows={workflows} setWorkflows={setWorkflows} />} />
          <Route path="/webhooks" element={<WebhookManager webhooks={webhooks} setWebhooks={setWebhooks} />} />
          <Route path="/documents" element={<DocumentManager />} />
        </Routes>
      </div>
      <NotepadDrawer isOpen={isNotepadOpen} onClose={closeNotepad} />
      <ThemeToggle />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <TooltipProvider>
          <Router>
            <AppContent />
          </Router>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
