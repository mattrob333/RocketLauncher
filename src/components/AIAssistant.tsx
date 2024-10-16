import OpenAI from 'openai';
import { Expert } from '../types';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
  dangerouslyAllowBrowser: true
});

interface AIAssistantProps {
  agent: Expert;
  onMessageReceived: (message: string) => void;
  initialConversation?: string[];
}

export class AIAssistant {
  private agent: Expert;
  private onMessageReceived: (message: string) => void;
  private thread: OpenAI.Beta.Threads.Thread | null = null;
  private conversationHistory: string[];

  constructor({ agent, onMessageReceived, initialConversation = [] }: AIAssistantProps) {
    this.agent = agent;
    this.onMessageReceived = onMessageReceived;
    this.conversationHistory = initialConversation;
  }

  updateConversationHistory(history: string[]) {
    this.conversationHistory = history;
  }

  addToConversation(message: string, sender: 'user' | 'assistant' | 'workflow') {
    this.conversationHistory.push(`${sender}: ${message}`);
  }

  async getResponse(message: string): Promise<string> {
    try {
      if (!this.agent.assistantId) {
        console.error("Assistant ID is not set for agent:", this.agent);
        throw new Error("Assistant ID is not set");
      }

      // Create a thread if it doesn't exist
      if (!this.thread) {
        this.thread = await openai.beta.threads.create();
        console.log("New thread created:", this.thread.id);
      }

      // Add the entire conversation history to the thread
      const fullContext = [...this.conversationHistory, `user: ${message}`].join('\n');
      await openai.beta.threads.messages.create(this.thread.id, {
        role: "user",
        content: fullContext
      });

      // Run the assistant
      const run = await openai.beta.threads.runs.create(this.thread.id, {
        assistant_id: this.agent.assistantId,
      });

      // Wait for the run to complete
      let runStatus = await openai.beta.threads.runs.retrieve(this.thread.id, run.id);
      while (runStatus.status !== "completed") {
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(this.thread.id, run.id);
      }

      // Retrieve the messages
      const messages = await openai.beta.threads.messages.list(this.thread.id);

      // Find the last assistant message
      const lastAssistantMessage = messages.data
        .filter(message => message.role === "assistant")
        .pop();

      if (lastAssistantMessage && lastAssistantMessage.content[0].type === 'text') {
        const response = lastAssistantMessage.content[0].text.value;
        this.addToConversation(response, 'assistant');
        // Remove this line to avoid triggering a new message in the chat
        // this.onMessageReceived(response);
        return response;
      }

      throw new Error("No response from assistant");
    } catch (error: any) {
      console.error("Detailed error in AI response:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      return "Error: Unable to get AI response. Please check the console for more details.";
    }
  }
}
