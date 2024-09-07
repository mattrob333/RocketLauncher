import OpenAI from 'openai';
import { Expert } from '../types';

const openai = new OpenAI({
  apiKey: process.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

interface AIAssistantProps {
  agent: Expert;
  messages: { content: string; timestamp: Date; sender: string }[];
  workflowOutput: string;
  onMessageReceived: (message: string) => void;
}

export class AIAssistant {
  private agent: Expert;
  private messages: { content: string; timestamp: Date; sender: string }[];
  private workflowOutput: string;
  private onMessageReceived: (message: string) => void;

  constructor({ agent, messages, workflowOutput, onMessageReceived }: AIAssistantProps) {
    this.agent = agent;
    this.messages = messages;
    this.workflowOutput = workflowOutput;
    this.onMessageReceived = onMessageReceived;
  }

  async getResponse(message: string): Promise<string> {
    try {
      if (!this.agent.assistantId) {
        throw new Error("Assistant ID is not set");
      }

      const context = this.workflowOutput;
      const thread = await openai.beta.threads.create();

      await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: `Context: ${context}\n\nUser: ${message}`
      });

      const run = await openai.beta.threads.runs.create(thread.id, {
        assistant_id: this.agent.assistantId,
      });

      let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

      while (runStatus.status !== "completed") {
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);
      }

      const messages = await openai.beta.threads.messages.list(thread.id);

      const lastMessageForRun = messages.data
        .filter(message => message.run_id === run.id && message.role === "assistant")
        .pop();

      if (lastMessageForRun && lastMessageForRun.content[0].type === 'text') {
        const response = lastMessageForRun.content[0].text.value;
        this.onMessageReceived(response);
        return response;
      }

      throw new Error("No response from assistant");
    } catch (error) {
      console.error("Error in AI response:", error);
      return "Error: Unable to get AI response";
    }
  }
}