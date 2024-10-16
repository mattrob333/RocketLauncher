export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface Workflow {
  id: string;
  title: string;
  description: string;
  chatflowId: string;
  expectedInput: string[];
  exampleInput: string;
  category: string;
  keyObjectives: string[];
  steps: string[];
  tags: string[];
}

export interface Webhook {
  id: string;
  label: string;
  url: string;
  method: string;
}

export interface Expert {
  id: string;
  name: string;
  role: string;
  description: string;
  avatar: string;
  assistantId?: string;
}
