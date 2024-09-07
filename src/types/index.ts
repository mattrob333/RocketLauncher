// src/types/index.ts

export interface Workflow {
  id: string;
  title: string;
  description: string;
  chatflowId: string;
  expectedInput: string[]; // Array of strings
  exampleInput: string;
  category: string;
  keyObjectives: string[]; // Array of strings
  steps: string[]; // Array of strings
  tags: string[]; // Array of strings
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
