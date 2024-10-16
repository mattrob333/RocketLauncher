import React, { useState, useEffect, useRef } from 'react';
import { X, Trash2, Plus, ChevronRight, ChevronLeft, Bold, Italic, Underline, Link, List, ListOrdered, Heading1, Heading2, Heading3, Maximize2, SplitSquareVertical, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import rehypeParse from 'rehype-parse';
import rehypeSanitize from 'rehype-sanitize';
import '../styles/markdown-styles.css';
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { addDoc, collection, getDocs, setDoc, doc } from "firebase/firestore";
import { db } from '@/firebase';

interface NotepadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

export function NotepadDrawer({ isOpen, onClose, onOpen }: NotepadDrawerProps) {
  const [markdown, setMarkdown] = useState('');
  const [company, setCompany] = useState('');
  const [docType, setDocType] = useState('');
  const [title, setTitle] = useState('');
  const [fileName, setFileName] = useState('untitled.md');
  const [companies, setCompanies] = useState<string[]>([]);
  const [docTypes, setDocTypes] = useState<string[]>(['SOP', 'Policy', 'Guide', 'Other']);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSplitScreen, setIsSplitScreen] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchCompanies();
    fetchDocTypes();
  }, []);

  const fetchCompanies = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "markdownFiles"));
      const uniqueCompanies = new Set(querySnapshot.docs.map(doc => doc.data().company));
      setCompanies(Array.from(uniqueCompanies));
    } catch (error) {
      console.error("Error fetching companies:", error);
      toast.error("Failed to fetch companies");
    }
  };

  const fetchDocTypes = async () => {
    try {
      const docTypesDoc = await getDocs(collection(db, "docTypes"));
      if (docTypesDoc.docs.length > 0) {
        setDocTypes(docTypesDoc.docs[0].data().types);
      } else {
        await setDoc(doc(db, "docTypes", "defaultTypes"), { types: ['SOP', 'Policy', 'Guide', 'Other'] });
        setDocTypes(['SOP', 'Policy', 'Guide', 'Other']);
      }
    } catch (error) {
      console.error("Error fetching document types:", error);
      toast.error("Failed to fetch document types");
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

  const handleClear = () => {
    setMarkdown('');
    setTitle('');
    setFileName('untitled.md');
    toast.success("Document cleared!");
  };

  const handleLoad = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setMarkdown(content);
        setFileName(file.name);
        toast.success("File loaded successfully!");
      };
      reader.readAsText(file);
    }
  };

  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);
  const toggleSplitScreen = () => setIsSplitScreen(!isSplitScreen);

  const insertMarkdown = (syntax: string) => {
    if (editorRef.current) {
      const start = editorRef.current.selectionStart;
      const end = editorRef.current.selectionEnd;
      const text = editorRef.current.value;
      const before = text.substring(0, start);
      const after = text.substring(end, text.length);
      setMarkdown(before + syntax + after);
      editorRef.current.focus();
      editorRef.current.selectionStart = editorRef.current.selectionEnd = start + syntax.length;
    }
  };

  return (
    <>
      {/* Tab to open the drawer */}
      {!isOpen && (
        <div 
          className="fixed top-1/2 right-0 transform -translate-y-1/2 bg-[#1c1917] text-white p-2 rounded-l-md cursor-pointer shadow-lg"
          onClick={onOpen}
        >
          <FileText className="h-6 w-6" />
        </div>
      )}

      {/* Main drawer content */}
      <div className={`fixed inset-y-0 right-0 ${isFullScreen ? 'w-full' : 'w-1/2'} bg-[#0c0a09] text-white flex flex-col shadow-lg transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 bg-[#1c1917] border-b border-gray-800/10">
          <h2 className="text-lg font-semibold">Document Builder</h2>
          <div className="flex space-x-2">
            <Button variant="ghost" size="icon" onClick={handleClear}><Trash2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={toggleSplitScreen}><SplitSquareVertical className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={toggleFullScreen}><Maximize2 className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>
        </div>

        <div className="flex flex-col space-y-2 p-4 bg-[#1c1917]">
          <Select value={company} onValueChange={setCompany}>
            <SelectTrigger className="bg-[#292524] border-gray-700">
              <SelectValue placeholder="Select Company" />
            </SelectTrigger>
            <SelectContent>
              {companies.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger className="bg-[#292524] border-gray-700">
              <SelectValue placeholder="Select Document Type" />
            </SelectTrigger>
            <SelectContent>
              {docTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-[#292524] border-gray-700"
          />
          <div className="flex justify-between space-x-2">
            <Button onClick={() => document.getElementById('file-upload')?.click()} variant="outline" className="bg-[#292524] border-gray-700">
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
              <Button onClick={handleStoreInDocs} className="mr-2" variant="outline">Store in Docs</Button>
              <Button onClick={handleSave} variant="outline">Save</Button>
            </div>
          </div>
        </div>

        <div className="flex space-x-2 p-2 bg-[#1c1917] border-t border-b border-gray-800/10">
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
              className="w-full h-full resize-none bg-[#292524] text-white border-none p-4 focus:outline-none focus:ring-1 focus:ring-[#ea580c]"
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
            />
          </div>
          {isSplitScreen && (
            <div className="flex-1 w-1/2 overflow-auto p-4 bg-[#1c1917] border-l border-gray-800/10">
              <ReactMarkdown
                className="prose prose-invert max-w-none"
                rehypePlugins={[rehypeRaw, rehypeParse, rehypeSanitize]}
                remarkPlugins={[remarkGfm]}
              >
                {markdown}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default NotepadDrawer;
