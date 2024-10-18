// src/types/index.ts

export interface Workflow {
  id: string;
  category: string;
  chatflowId: string;
  description: string;
  exampleInput: string;
  expectedInput: string[];
  keyObjectives: string[];
  steps: string[];
  tags: string[];
  title: string;
}

export interface Webhook {
  id: string;
  label: string;
  url: string;
  method: string;
}

export interface Assistants {
  id: string;
  assistantId: string;
  avatar: string;
  department: string;
  description: string;
  name: string;
  role: string;
  tools: string;
}

// Note: We've removed the Assistants interface as it's not being used correctly



