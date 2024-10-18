import { useState, useEffect } from 'react';
import { ThemeProvider } from "next-themes"
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TooltipProvider } from "@radix-ui/react-tooltip";
import { SideMenu } from "./components/SideMenu"
import ChatContainer from "./components/chatcontainer"
import { WorkflowDescription } from "./components/workflowdescription"
import WorkflowManager from "./components/workflowmanager"
import WebhookManager from "./components/webhookmanager"
import LandingPage from "./components/LandingPage"
import NotepadDrawer from "./components/notepaddrawer";
import DocumentManager from "./components/DocumentManager";
import { Workflow, Webhook, Assistants } from '@/types';
import { collection, getDocs } from "firebase/firestore";
import { db } from '@/firebase.js';
import { ThemeToggle } from './components/theme-toggle';
import CompanyManager from "./components/CompanyManager";
import { AIAssistant } from './components/AIAssistant';

const queryClient = new QueryClient();

function AppContent() {
  const navigate = useNavigate();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [selectedFlowId, setSelectedFlowId] = useState<string>('');
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  const [openAIKey, setOpenAIKey] = useState<string>('');
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [aiAssistant, setAiAssistant] = useState<AIAssistant | null>(null);

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const workflowsCollection = collection(db, 'workflows');
        const workflowSnapshot = await getDocs(workflowsCollection);
        const workflowList = workflowSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Workflow));
        setWorkflows(workflowList);
      } catch (error) {
        console.error("Error fetching workflows:", error);
      }
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

  const handleSelectWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setSelectedFlowId(workflow.id);
  };

  const handleSelectAssistant = (assistant: Assistants) => {
    console.log("Selected assistant:", assistant);
    const newAiAssistant = new AIAssistant({
      agent: assistant,
      onMessageReceived: (message) => {
        console.log("Received message from assistant:", message);
        // Handle the received message as needed
      }
    });
    setAiAssistant(newAiAssistant);
  };

  const handleSelectWebhook = (webhook: Webhook) => {
    // Implement this function as needed
    console.log("Selected webhook:", webhook);
  };

  return (
    <div className="flex h-screen bg-background">
      <SideMenu navigate={navigate} openNotepad={openNotepad} />
      <div className="flex-1 flex overflow-hidden">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/chat" element={
            <div className="flex h-full w-full">
              <ChatContainer 
                selectedFlowId={selectedFlowId}
                setSelectedFlowId={setSelectedFlowId}
                webhooks={webhooks} 
                openAIKey={openAIKey}
                className="flex-grow"
                workflows={workflows}
                onSelectWorkflow={handleSelectWorkflow}
                onSelectAssistant={handleSelectAssistant}
                onSelectWebhook={handleSelectWebhook}
                selectedWorkflow={selectedWorkflow}
                assistants={Assistants}
              />
              <WorkflowDescription 
                selectedWorkflow={selectedWorkflow}
                className="w-[400px] border-l border-border"
              />
            </div>
          } />
          <Route path="/workflows" element={<WorkflowManager workflows={workflows} setWorkflows={setWorkflows} />} />
          <Route path="/webhooks" element={<WebhookManager webhooks={webhooks} setWebhooks={setWebhooks} />} />
          <Route path="/documents" element={<DocumentManager />} />
          <Route path="/manage" element={<WorkflowManager workflows={workflows} setWorkflows={setWorkflows} />} />
          <Route path="/companies" element={<CompanyManager />} />
        </Routes>
      </div>
      <NotepadDrawer 
        isOpen={isNotepadOpen} 
        onClose={closeNotepad} 
        onOpen={openNotepad}
      />
      <ThemeToggle />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <Router>
            <div className="dark bg-background text-foreground">
              <AppContent />
            </div>
          </Router>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
