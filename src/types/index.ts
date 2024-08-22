// src/types/index.ts

// src/types/index.ts

export interface Workflow {
  id: string;
  title: string;
  description: string;
  chatflowId: string;
  expectedInput: string;
  exampleInput: string;
}

export interface Webhook {
  id: string;
  label: string;
  url: string;
  method: string;
}