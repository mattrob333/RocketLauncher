import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDoc, collection, getDocs } from "firebase/firestore";
import { db } from '@/firebase';

interface NotepadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotepadDrawer: React.FC<NotepadDrawerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('view');
  const [markdown, setMarkdown] = useState('# Welcome to the Markdown Editor\n\nStart typing your markdown here...');
  const [company, setCompany] = useState('');
  const [docType, setDocType] = useState('');
  const [title, setTitle] = useState('');
  const [fileName, setFileName] = useState('untitled.md');
  const [companies, setCompanies] = useState<string[]>([]);
  const [docTypes, setDocTypes] = useState<string[]>(['SOP', 'Policy', 'Guide', 'Other']);
  const [newCompany, setNewCompany] = useState('');
  const [isAddingNewCompany, setIsAddingNewCompany] = useState(false);
  const [newDocType, setNewDocType] = useState('');
  const [isAddingNewDocType, setIsAddingNewDocType] = useState(false);

  useEffect(() => {
    fetchCompanies();
    const savedMarkdown = localStorage.getItem('markdown');
    if (savedMarkdown) {
      setMarkdown(savedMarkdown);
    }
  }, []);

  const fetchCompanies = async () => {
    const querySnapshot = await getDocs(collection(db, "markdownFiles"));
    const uniqueCompanies = new Set(querySnapshot.docs.map(doc => doc.data().company));
    setCompanies(Array.from(uniqueCompanies));
  };

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
      // Reset form fields
      setCompany('');
      setDocType('');
      setTitle('');
      setMarkdown('# New Document\n\nStart typing your markdown here...');
      fetchCompanies(); // Refresh the list of companies
    } catch (error) {
      console.error("Error storing document: ", error);
      toast.error("Failed to store document.");
    }
  };

  const handleAddNewCompany = () => {
    if (newCompany && !companies.includes(newCompany)) {
      setCompanies(prev => [...prev, newCompany]);
      setCompany(newCompany);
      setNewCompany('');
      setIsAddingNewCompany(false);
      toast.success("New company added!");
    } else {
      toast.error("Company already exists or invalid name");
    }
  };

  const handleAddNewDocType = () => {
    if (newDocType && !docTypes.includes(newDocType)) {
      setDocTypes(prev => [...prev, newDocType]);
      setDocType(newDocType);
      setNewDocType('');
      setIsAddingNewDocType(false);
      toast.success("New document type added!");
    } else {
      toast.error("Document type already exists or invalid name");
    }
  };

  const handleCompanyChange = (value: string) => {
    if (value === 'new') {
      setIsAddingNewCompany(true);
    } else {
      setCompany(value);
    }
  };

  const handleDocTypeChange = (value: string) => {
    if (value === 'new') {
      setIsAddingNewDocType(true);
    } else {
      setDocType(value);
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
          <div className="flex flex-col space-y-2 p-2">
            {isAddingNewCompany ? (
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="New Company Name"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="flex-grow"
                />
                <Button onClick={handleAddNewCompany}>Add</Button>
                <Button variant="outline" onClick={() => setIsAddingNewCompany(false)}>Cancel</Button>
              </div>
            ) : (
              <Select value={company} onValueChange={handleCompanyChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                  <SelectItem value="new">Add New Company</SelectItem>
                </SelectContent>
              </Select>
            )}
            {isAddingNewDocType ? (
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="New Document Type"
                  value={newDocType}
                  onChange={(e) => setNewDocType(e.target.value)}
                  className="flex-grow"
                />
                <Button onClick={handleAddNewDocType}>Add</Button>
                <Button variant="outline" onClick={() => setIsAddingNewDocType(false)}>Cancel</Button>
              </div>
            ) : (
              <Select value={docType} onValueChange={handleDocTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Document Type" />
                </SelectTrigger>
                <SelectContent>
                  {docTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                  <SelectItem value="new">Add New Document Type</SelectItem>
                </SelectContent>
              </Select>
            )}
            <Input
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <Button onClick={handleStoreInDocs}>Store in Docs</Button>
              <Button onClick={handleSave}>Save</Button>
            </div>
          </div>
          <MDEditor
            value={markdown}
            onChange={(value) => setMarkdown(value || '')}
            className="flex-grow"
            height="calc(100% - 200px)"
            preview="edit"
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotepadDrawer;