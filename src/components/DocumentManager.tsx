import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from '@/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Copy, Trash2, Folder, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Dialog, DialogContent, DialogTrigger } from "@radix-ui/react-dialog";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import rehypeParse from 'rehype-parse';
import '../styles/markdown-styles.css';
import '@/styles/markdown-styles.css';

interface Document {
  id: string;
  company: string;
  docType: string;
  title: string;
  content: string;
}

interface CompanyDocuments {
  [company: string]: Document[];
}

const DocumentManager: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [groupedDocuments, setGroupedDocuments] = useState<CompanyDocuments>({});
  const [expandedCompanies, setExpandedCompanies] = useState<Set<string>>(new Set());
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [newDocument, setNewDocument] = useState<Omit<Document, 'id'>>({
    title: '',
    docType: '',
    content: '',
    company: '',
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    const grouped = documents.reduce((acc, doc) => {
      if (!acc[doc.company]) {
        acc[doc.company] = [];
      }
      acc[doc.company].push(doc);
      return acc;
    }, {} as CompanyDocuments);
    setGroupedDocuments(grouped);
  }, [documents]);

  const fetchDocuments = async () => {
    const querySnapshot = await getDocs(collection(db, "markdownFiles"));
    const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
    setDocuments(docs);
  };

  const companies = Array.from(new Set(documents.map(doc => doc.company)));

  const filteredDocuments = selectedCompany
    ? documents.filter(doc => doc.company === selectedCompany)
    : documents;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDocument(prev => ({ ...prev, [name]: value }));
  };

  const addDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "markdownFiles"), newDocument);
      setNewDocument({ title: '', docType: '', content: '', company: '' });
      fetchDocuments();
      setIsAddDialogOpen(false);
      setSelectedCompany(newDocument.company);
      setExpandedCompanies(prev => new Set(prev).add(newDocument.company));
      toast.success("Document added successfully!");
    } catch (error) {
      console.error("Error adding document: ", error);
      toast.error("Failed to add document.");
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      await deleteDoc(doc(db, "markdownFiles", id));
      fetchDocuments();
      toast.success("Document deleted successfully!");
    } catch (error) {
      console.error("Error deleting document: ", error);
      toast.error("Failed to delete document.");
    }
  };

  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content).then(() => {
      toast.success("Copied to clipboard!");
    }).catch(() => {
      toast.error("Failed to copy to clipboard.");
    });
  };

  const toggleCompanyExpansion = (company: string) => {
    setExpandedCompanies(prev => {
      const newSet = new Set(prev);
      if (newSet.has(company)) {
        newSet.delete(company);
      } else {
        newSet.add(company);
      }
      return newSet;
    });
  };

  const handleCompanyClick = (company: string) => {
    toggleCompanyExpansion(company);
    setSelectedCompany(prev => prev === company ? null : company);
  };

  const handleDocumentClick = (doc: Document) => {
    setSelectedDocument(doc);
  };

  return (
    <div className="p-6 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-6">Document Manager</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Companies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(groupedDocuments).map(([company, docs]) => (
                <div key={company}>
                  <Button
                    variant={selectedCompany === company ? "secondary" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => handleCompanyClick(company)}
                  >
                    {expandedCompanies.has(company) ? (
                      <ChevronDown className="mr-2 h-4 w-4" />
                    ) : (
                      <ChevronRight className="mr-2 h-4 w-4" />
                    )}
                    {company} ({docs.length})
                  </Button>
                  {expandedCompanies.has(company) && (
                    <div className="ml-4 space-y-1">
                      {docs.map((doc) => (
                        <Button
                          key={doc.id}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => handleDocumentClick(doc)}
                        >
                          <Folder className="mr-2 h-3 w-3" />
                          {doc.title}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {selectedDocument ? selectedDocument.title : 'Document Viewer'}
            </h2>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Document
                </Button>
              </DialogTrigger>
              <DialogContent>
                <form onSubmit={addDocument} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      name="title"
                      value={newDocument.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      name="company"
                      value={newDocument.company}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="docType">Document Type</Label>
                    <Input
                      id="docType"
                      name="docType"
                      value={newDocument.docType}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      name="content"
                      value={newDocument.content}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <Button type="submit">Add Document</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          {selectedDocument ? (
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between bg-muted">
                <CardTitle>{selectedDocument.title}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => setSelectedDocument(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-muted p-4">
                  <p className="text-sm text-muted-foreground">Company: {selectedDocument.company}</p>
                  <p className="text-sm text-muted-foreground">Type: {selectedDocument.docType}</p>
                </div>
                <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto bg-black text-white">
                  <div className="markdown-body prose prose-invert max-w-none">
                    <ReactMarkdown
                      rehypePlugins={[rehypeRaw, rehypeParse]}
                      remarkPlugins={[remarkGfm]}
                    >
                      {selectedDocument.content}
                    </ReactMarkdown>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 p-4 bg-muted">
                  <Button onClick={() => copyToClipboard(selectedDocument.content)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Content
                  </Button>
                  <Button onClick={() => deleteDocument(selectedDocument.id)} variant="destructive">
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="text-center text-muted-foreground">
              Select a document to view its content
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentManager;