'use client'

import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, Plus, ChevronRight, ChevronLeft, Bold, Italic, Underline, Link, List, ListOrdered, Heading1, Heading2, Heading3, Maximize2, SplitSquareVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import rehypeParse from 'rehype-parse';
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDoc, collection, getDocs, setDoc, doc } from "firebase/firestore";
import { db } from '@/firebase';

const customStyles = `
  :root {
    --background: #1e1e1e;
    --foreground: #d4d4d4;
    --card: #252526;
    --card-foreground: #d4d4d4;
    --popover: #252526;
    --popover-foreground: #d4d4d4;
    --primary: #0e639c;
    --primary-foreground: #ffffff;
    --secondary: #3a3a3a;
    --secondary-foreground: #d4d4d4;
    --muted: #3a3a3a;
    --muted-foreground: #888888;
    --accent: #3a3a3a;
    --accent-foreground: #d4d4d4;
    --destructive: #f44747;
    --destructive-foreground: #ffffff;
    --border: #404040;
    --input: #3a3a3a;
    --ring: #0e639c;
  }

  body {
    background-color: var(--background);
    color: var(--foreground);
  }

  .editor-panel {
    background-color: var(--card);
    border-left: 1px solid var(--border);
  }

  .editor-content {
    background-color: var(--background);
    color: var(--foreground);
    padding: 16px;
    border: 1px solid var(--border);
    border-radius: 4px;
  }

  .markdown-body {
    background-color: var(--background) !important;
    color: var(--foreground) !important;
  }

  .close-editor-button {
    position: absolute;
    top: 0;
    left: -40px;
    background-color: var(--primary);
    color: var(--primary-foreground);
    padding: 8px;
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
    cursor: pointer;
    z-index: 50;
  }

  .select-trigger {
    background-color: var(--input);
  }

  .select-content {
    background-color: var(--card);
  }
`;

export function AiChatDashboard() {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSplitScreen, setIsSplitScreen] = useState(false);
  const [activeTab, setActiveTab] = useState('edit');
  const [markdown, setMarkdown] = useState('');
  const [company, setCompany] = useState('');
  const [docType, setDocType] = useState('');
  const [title, setTitle] = useState('');
  const [fileName, setFileName] = useState('untitled.md');
  const [companies, setCompanies] = useState<string[]>([]);
  const [docTypes, setDocTypes] = useState<string[]>(['SOP', 'Policy', 'Guide', 'Other']);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchCompanies();
    fetchDocTypes();
  }, []);

  const fetchCompanies = async () => {
    const querySnapshot = await getDocs(collection(db, "markdownFiles"));
    const uniqueCompanies = new Set(querySnapshot.docs.map(doc => doc.data().company));
    setCompanies(Array.from(uniqueCompanies));
  };

  const fetchDocTypes = async () => {
    const docTypesDoc = await getDocs(collection(db, "docTypes"));
    if (docTypesDoc.docs.length > 0) {
      setDocTypes(docTypesDoc.docs[0].data().types);
    } else {
      await setDoc(doc(db, "docTypes", "defaultTypes"), { types: ['SOP', 'Policy', 'Guide', 'Other'] });
      setDocTypes(['SOP', 'Policy', 'Guide', 'Other']);
    }
  };

  const handleSave = () => {
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("File saved successfully!");
  };

  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') {
          setMarkdown(result);
          setFileName(file.name);
          toast.success("File loaded successfully!");
        }
      };
      reader.readAsText(file);
    }
  };

  const handleStoreInDocs = async () => {
    if (!company || !docType || !title) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      await addDoc(collection(db, "markdownFiles"), {
        company,
        docType,
        title,
        content: markdown,
      });
      toast.success("Document stored successfully!");
      setCompany('');
      setDocType('');
      setTitle('');
      setMarkdown('');
      fetchCompanies();
    } catch (error) {
      console.error("Error storing document: ", error);
      toast.error("Failed to store document.");
    }
  };

  const handleClear = () => {
    setMarkdown('');
    setTitle('');
    setCompany('');
    setDocType('');
    setFileName('untitled.md');
    toast.success("Document cleared!");
  };

  const insertMarkdown = (tag: string) => {
    if (editorRef.current) {
      const start = editorRef.current.selectionStart;
      const end = editorRef.current.selectionEnd;
      const text = editorRef.current.value;
      const before = text.substring(0, start);
      const selection = text.substring(start, end);
      const after = text.substring(end);
      const newText = `${before}${tag}${selection}${tag}${after}`;
      setMarkdown(newText);
      editorRef.current.focus();
      editorRef.current.setSelectionRange(start + tag.length, end + tag.length);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const toggleSplitScreen = () => {
    setIsSplitScreen(!isSplitScreen);
    setActiveTab('edit');
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      <style>{customStyles}</style>
      
      {/* Main Content Area (AI Chat) */}
      <div className={`flex-1 p-4 ${isFullScreen ? 'hidden' : ''}`}>
        <h1 className="text-2xl font-bold mb-4">AI Chat Dashboard</h1>
        {/* Add your AI chat component here */}
      </div>

      {/* Resizable Right Editor Panel */}
      <div 
        className={`editor-panel fixed inset-y-0 right-0 flex flex-col transition-all duration-300 ease-in-out ${
          isEditorOpen ? (isFullScreen ? 'w-full' : 'w-1/2') : 'w-0'
        }`}
      >
        <div className="close-editor-button" onClick={() => setIsEditorOpen(false)}>
          <ChevronRight className="h-6 w-6" />
        </div>
        <div className="flex justify-between items-center p-4 border-b border-border">
          <h2 className="text-lg font-semibold">Document Builder</h2>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={handleClear}>
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleSplitScreen}>
              <SplitSquareVertical className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleFullScreen}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-col space-y-2 p-2 bg-card">
          <Select value={company} onValueChange={setCompany}>
            <SelectTrigger className="select-trigger">
              <SelectValue placeholder="Select Company" />
            </SelectTrigger>
            <SelectContent className="select-content">
              {companies.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger className="select-trigger">
              <SelectValue placeholder="Select Document Type" />
            </SelectTrigger>
            <SelectContent className="select-content">
              {docTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="flex justify-between space-x-2">
            <Button onClick={() => document.getElementById('file-upload')?.click()}>
              <Plus className="mr-2 h-4 w-4" />
              Load File
            </Button>
            <input
              id="file-upload"
              type="file"
              accept=".md,.txt"
              onChange={handleLoad}
              style={{ display: 'none' }}
            />
            <div>
              <Button onClick={handleStoreInDocs} className="mr-2">Store in Docs</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 p-2 bg-card">
          <Button variant="ghost" size="icon" onClick={() => insertMarkdown('**')}><Bold className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => insertMarkdown('*')}><Italic className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => insertMarkdown('~~')}><Underline className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => insertMarkdown('[]()')}><Link className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => insertMarkdown('- ')}><List className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => insertMarkdown('1. ')}><ListOrdered className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => insertMarkdown('# ')}><Heading1 className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => insertMarkdown('## ')}><Heading2 className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={() => insertMarkdown('### ')}><Heading3 className="h-4 w-4" /></Button>
        </div>

        <div className={`flex-1 flex ${isSplitScreen ? 'flex-row' : 'flex-col'} overflow-hidden`}>
          <div className={`flex-1 ${isSplitScreen ? 'w-1/2' : 'w-full'}`}>
            <textarea
              ref={editorRef}
              className="editor-content w-full h-full resize-none"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
            />
          </div>
          {isSplitScreen && (
            <div className="flex-1 w-1/2 overflow-auto p-4 bg-card">
              <ReactMarkdown
                className="markdown-body prose dark:prose-invert max-w-none"
                rehypePlugins={[rehypeRaw, rehypeParse]}
                remarkPlugins={[remarkGfm]}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>

      {/* Toggle Editor Button */}
      {!isEditorOpen && (
        <Button 
          className="fixed right-4 top-4"
          onClick={() => setIsEditorOpen(true)}
        >
          Open Editor
        </Button>
      )}
    </div>
  );
}