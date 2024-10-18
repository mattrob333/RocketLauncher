import OpenAI from 'openai';
import { Assistants } from '../types';
import { Message } from './chatcontainer'; // Import the Message type from chatcontainer

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export class AIAssistant {
  private agent: Assistants;
  private onMessageReceived: (message: string) => void;
  private thread: OpenAI.Beta.Threads.Thread | null = null;

  constructor({ agent, onMessageReceived }: { agent: Assistants; onMessageReceived: (message: string) => void }) {
    this.agent = agent;
    this.onMessageReceived = onMessageReceived;
    console.log("AIAssistant initialized with agent:", agent);
  }

  async getResponse(message: string, conversationHistory: Message[]): Promise<{ response: string, updatedThread: OpenAI.Beta.Threads.Thread }> {
    try {
      console.log("Getting response for assistant:", this.agent.assistantId);
      if (!this.agent.assistantId) {
        throw new Error("Assistant ID is not set");
      }

      if (!this.thread) {
        this.thread = await openai.beta.threads.create();
        console.log("New thread created:", this.thread.id);

        for (const msg of conversationHistory) {
          await openai.beta.threads.messages.create(this.thread.id, {
            role: msg.role,
            content: msg.content
          });
        }
        console.log("Conversation history added to thread");
      }

      console.log("Adding user message to thread:", message);
      await openai.beta.threads.messages.create(this.thread.id, {
        role: "user",
        content: message
      });

      console.log("Creating run for assistant:", this.agent.assistantId);
      const run = await openai.beta.threads.runs.create(this.thread.id, {
        assistant_id: this.agent.assistantId,
      });

      console.log("Run created:", run.id);
      const completedRun = await this.waitForRunCompletion(this.thread.id, run.id);
      console.log("Run completed:", completedRun.status);

      if (completedRun.status === 'completed') {
        const messages = await openai.beta.threads.messages.list(this.thread.id);
        console.log("Retrieved messages:", messages.data.length);

        const lastAssistantMessage = messages.data
          .filter(message => message.role === "assistant")
          .shift();

        if (lastAssistantMessage && lastAssistantMessage.content[0].type === 'text') {
          const response = lastAssistantMessage.content[0].text.value;
          console.log("Assistant response:", response);
          return { response, updatedThread: this.thread };
        }
      }

      throw new Error("No response from assistant or run failed");
    } catch (error: any) {
      console.error("Detailed error in AI response:", error);
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }
      throw error; // Re-throw the error to be caught in the ChatContainer
    }
  }

  private async waitForRunCompletion(threadId: string, runId: string, timeout = 60000): Promise<OpenAI.Beta.Threads.Runs.Run> {
    const startTime = Date.now();
    while (true) {
      const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
      console.log("Run status:", runStatus.status);
      if (runStatus.status === "completed" || runStatus.status === "failed" || runStatus.status === "expired") {
        return runStatus;
      }
      if (Date.now() - startTime > timeout) {
        throw new Error("Run timed out");
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  resetThread() {
    this.thread = null;
    console.log("Thread reset for new conversation");
  }

  setThread(thread: OpenAI.Beta.Threads.Thread | null) {
    this.thread = thread;
  }

  getThread(): OpenAI.Beta.Threads.Thread | null {
    return this.thread;
  }
}
