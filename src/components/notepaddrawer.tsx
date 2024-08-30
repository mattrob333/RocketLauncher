import React, { useState, useEffect } from 'react';
import { Download, X, FileEdit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import rehypeParse from 'rehype-parse';
import '../styles/markdown-styles.css';
import MDEditor from '@uiw/react-md-editor';
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface NotepadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotepadDrawer: React.FC<NotepadDrawerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('view');
  const [markdown, setMarkdown] = useState('# Welcome to the Markdown Editor\n\nStart typing your markdown here...');
  const [fileName, setFileName] = useState('untitled.md');

  useEffect(() => {
    const savedMarkdown = localStorage.getItem('markdown');
    if (savedMarkdown) {
      setMarkdown(savedMarkdown);
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('markdown', markdown);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-1/2 min-w-[50vw] bg-background shadow-lg z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Notepad</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="flex justify-start p-2 bg-muted">
          <TabsTrigger value="view" className="px-4 py-2 rounded-md">View</TabsTrigger>
          <TabsTrigger value="edit" className="px-4 py-2 rounded-md">Edit</TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="flex-1 overflow-auto p-4">
          <ReactMarkdown
            className="markdown-body"
            rehypePlugins={[rehypeRaw, rehypeParse]}
            remarkPlugins={[remarkGfm]}
          >
            {markdown}
          </ReactMarkdown>
        </TabsContent>

        <TabsContent value="edit" className="flex-1 flex flex-col">
          <div className="flex justify-between items-center p-2">
            <Input
              type="file"
              accept=".md"
              onChange={handleLoad}
              className="max-w-xs"
            />
            <Button onClick={handleSave}>Save</Button>
          </div>
          <MDEditor
            value={markdown}
            onChange={(value) => setMarkdown(value || '')}
            className="flex-grow"
            height="calc(100% - 48px)"
            preview="edit"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotepadDrawer;