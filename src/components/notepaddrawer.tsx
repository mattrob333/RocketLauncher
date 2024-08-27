import React, { useState } from 'react';
import { Download, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@radix-ui/react-tabs';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';
import rehypeParse from 'rehype-parse';
import '../styles/markdown-styles.css';

interface NotepadDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotepadDrawer: React.FC<NotepadDrawerProps> = ({ isOpen, onClose }) => {
  const [content, setContent] = useState('');
  const [activeTab, setActiveTab] = useState('write');

  const handleContentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(event.target.value);
  };

  const exportContent = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notepad-content.md';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={`fixed inset-y-0 right-0 w-1/4 bg-gray-900 shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      <div className="h-full flex flex-col">
        <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-white">Notepad</h2>
          <div className="flex space-x-2">
            <Button onClick={exportContent} variant="ghost" size="sm" className="text-gray-300 hover:text-white">
              <Download size={16} className="mr-2" />
              Export
            </Button>
            <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-300 hover:text-white">
              <X size={16} />
            </Button>
          </div>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-grow flex flex-col">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="write" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700">Write</TabsTrigger>
            <TabsTrigger value="preview" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700">Preview</TabsTrigger>
            <TabsTrigger value="text" className="text-gray-300 data-[state=active]:text-white data-[state=active]:bg-gray-700">Plain Text</TabsTrigger>
          </TabsList>
          <TabsContent value="write" className="flex-grow">
            <textarea
              className="h-full p-4 w-full resize-none focus:outline-none bg-gray-800 text-white"
              value={content}
              onChange={handleContentChange}
              placeholder="Write your markdown here..."
            />
          </TabsContent>
          <TabsContent value="preview" className="flex-grow overflow-auto p-4 bg-gray-800 text-white">
            <div className="markdown-body">
              <ReactMarkdown 
                rehypePlugins={[rehypeRaw, rehypeParse]} 
                remarkPlugins={[remarkGfm]}
                className="prose dark:prose-invert max-w-none"
              >
                {content}
              </ReactMarkdown>
            </div>
          </TabsContent>
          <TabsContent value="text" className="flex-grow">
            <textarea
              className="h-full p-4 w-full resize-none focus:outline-none bg-gray-800 text-white font-mono"
              value={content}
              onChange={handleContentChange}
              placeholder="Edit as plain text..."
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default NotepadDrawer;