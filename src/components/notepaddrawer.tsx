import React, { useState, useEffect } from 'react';
import { X, Trash2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import rehypeParse from 'rehype-parse';
import '../styles/markdown-styles.css';
import MDEditor from '@uiw/react-md-editor';
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDoc, collection, getDocs, setDoc, doc } from "firebase/firestore";
import { db } from '@/firebase';

interface NotepadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotepadDrawer: React.FC<NotepadDrawerProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('edit');
  const [markdown, setMarkdown] = useState('');
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
      // If no document exists, create one with default types
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
      // Reset form fields
      setCompany('');
      setDocType('');
      setTitle('');
      setMarkdown('');
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

  const handleAddNewDocType = async () => {
    if (newDocType && !docTypes.includes(newDocType)) {
      const updatedDocTypes = [...docTypes, newDocType];
      await setDoc(doc(db, "docTypes", "defaultTypes"), { types: updatedDocTypes });
      setDocTypes(updatedDocTypes);
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

  const handleClear = () => {
    setMarkdown('');
    setTitle('');
    setCompany('');
    setDocType('');
    setFileName('untitled.md');
    toast.success("Notepad cleared!");
  };

  // Add this custom CSS for the MDEditor
  const customMDEditorStyles = `
    .w-md-editor-text-pre > code,
    .w-md-editor-text-input {
      font-size: 16px !important;
      line-height: 1.5 !important;
    }
    .w-md-editor-text-pre > code .token.title.important {
      color: #a0aec0 !important; /* Light gray color for ## headings */
    }
  `;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-1/4 bg-background text-foreground shadow-lg z-50 flex flex-col border-l border-border">
      {/* Add the custom styles */}
      <style>{customMDEditorStyles}</style>
      
      <div className="flex justify-between items-center p-4 border-b border-border">
        <h2 className="text-lg font-semibold">Notepad</h2>
        <div className="flex space-x-2">
          <Button variant="ghost" size="icon" onClick={handleClear}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="flex justify-start p-2 bg-card">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="view">View</TabsTrigger>
        </TabsList>

        <TabsContent value="view" className="flex-1 overflow-auto p-4 bg-card">
          <ReactMarkdown
            className="markdown-body prose dark:prose-invert max-w-none"
            rehypePlugins={[rehypeRaw, rehypeParse]}
            remarkPlugins={[remarkGfm]}
          >
            {markdown}
          </ReactMarkdown>
        </TabsContent>

        <TabsContent value="edit" className="flex-1 flex flex-col overflow-hidden">
          <div className="flex flex-col space-y-2 p-2 bg-card">
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
          <div className="flex-grow overflow-auto bg-background">
            <MDEditor
              value={markdown}
              onChange={(value) => setMarkdown(value || '')}
              height="100%"
              preview="edit"
              className="bg-background text-foreground border-none"
              textareaProps={{
                style: {
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                }
              }}
              previewOptions={{
                style: {
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                }
              }}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NotepadDrawer;
