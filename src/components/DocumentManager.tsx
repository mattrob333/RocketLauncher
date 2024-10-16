import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from '@/firebase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Copy, Trash2, Folder, File, ChevronRight, ChevronDown, Plus } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import '@/styles/markdown-styles.css';

interface Document {
  id: string;
  company: string;
  docType: string;
  title: string;
  content: string;
}

interface FileTreeNode {
  name: string;
  type: 'company' | 'docType' | 'document';
  children?: FileTreeNode[];
  document?: Document;
}

const DocumentManager: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [fileTree, setFileTree] = useState<FileTreeNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [newDocument, setNewDocument] = useState<Omit<Document, 'id'>>({
    company: '',
    docType: '',
    title: '',
    content: '',
  });
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    buildFileTree();
  }, [documents]);

  const fetchDocuments = async () => {
    const querySnapshot = await getDocs(collection(db, "markdownFiles"));
    const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Document));
    setDocuments(docs);
  };

  const buildFileTree = () => {
    const tree: FileTreeNode[] = [];
    documents.forEach(doc => {
      let companyNode = tree.find(node => node.name === doc.company);
      if (!companyNode) {
        companyNode = { name: doc.company, type: 'company', children: [] };
        tree.push(companyNode);
      }
      
      let docTypeNode = companyNode.children?.find(node => node.name === doc.docType);
      if (!docTypeNode) {
        docTypeNode = { name: doc.docType, type: 'docType', children: [] };
        companyNode.children?.push(docTypeNode);
      }
      
      docTypeNode.children?.push({
        name: doc.title,
        type: 'document',
        document: doc
      });
    });
    setFileTree(tree);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewDocument(prev => ({ ...prev, [name]: value }));
  };

  const addDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docRef = await addDoc(collection(db, "markdownFiles"), newDocument);
      console.log("Document written with ID: ", docRef.id);
      setNewDocument({ company: '', docType: '', title: '', content: '' });
      fetchDocuments();
      setIsAddDialogOpen(false);
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
      setSelectedDocument(null);
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

  const toggleNodeExpansion = (nodePath: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodePath)) {
        newSet.delete(nodePath);
      } else {
        newSet.add(nodePath);
      }
      return newSet;
    });
  };

  const renderFileTree = (nodes: FileTreeNode[], path: string = '') => {
    return nodes.map((node, index) => {
      const currentPath = `${path}/${node.name}`;
      const isExpanded = expandedNodes.has(currentPath);
      
      return (
        <div key={currentPath} className="ml-4">
          <div 
            className="flex items-center cursor-pointer hover:bg-gray-100 p-1 rounded"
            onClick={() => node.type !== 'document' && toggleNodeExpansion(currentPath)}
          >
            {node.type !== 'document' && (isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />)}
            {node.type === 'company' && <Folder size={16} className="mr-2 text-blue-500" />}
            {node.type === 'docType' && <Folder size={16} className="mr-2 text-green-500" />}
            {node.type === 'document' && <File size={16} className="mr-2 text-gray-500" />}
            <span 
              className="ml-2"
              onClick={() => node.type === 'document' && node.document && setSelectedDocument(node.document)}
            >
              {node.name}
            </span>
          </div>
          {node.children && isExpanded && renderFileTree(node.children, currentPath)}
        </div>
      );
    });
  };

  return (
    <div className="p-6 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-6">Document Manager</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              File Tree
              <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Document
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {renderFileTree(fileTree)}
            </div>
          </CardContent>
        </Card>
        <div className="lg:col-span-3">
          {selectedDocument ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between bg-muted">
                <CardTitle>{selectedDocument.title}</CardTitle>
                <div className="space-x-2">
                  <Button onClick={() => copyToClipboard(selectedDocument.content)}>
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Content
                  </Button>
                  <Button onClick={() => deleteDocument(selectedDocument.id)} variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm mt-4">
                  <ReactMarkdown
                    rehypePlugins={[rehypeRaw]}
                    remarkPlugins={[remarkGfm]}
                  >
                    {selectedDocument.content}
                  </ReactMarkdown>
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
      {isAddDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Add New Document</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={addDocument} className="space-y-4">
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
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    name="content"
                    value={newDocument.content}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button type="submit">Add Document</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DocumentManager;
