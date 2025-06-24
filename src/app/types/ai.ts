export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  isCollapsed?: boolean;
  metadata?: {
    functionCall?: FunctionCall;
    status?: 'pending' | 'completed' | 'error';
    plan?: string;
    summary?: string;
  };
}

export interface FunctionCall {
  name: string;
  arguments: Record<string, unknown>;
  result?: unknown;
  error?: string;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface AIAgentFunction {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
}

export interface AIAgentState {
  isProcessing: boolean;
  currentFunction?: string;
  plan?: string;
  isCollapsed: boolean;
}

export interface Screenshot {
  view: 'front' | 'back' | 'left' | 'right';
  dataUrl: string;
}

export interface AIContext {
  userPrompt: string;
  currentCode: string;
  screenshots: Screenshot[];
  conversationHistory: Message[];
}

// Available AI agent functions
export const AI_FUNCTIONS: AIAgentFunction[] = [
  {
    name: 'notify_user',
    description: 'Send a notification or message to the user with markdown support',
    parameters: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'The message to display to the user in markdown format'
        },
        type: {
          type: 'string',
          enum: ['info', 'warning', 'error', 'success'],
          description: 'The type of notification'
        }
      },
      required: ['message']
    }
  },
  {
    name: 'write_code',
    description: 'Replace the entire code in the editor with new code',
    parameters: {
      type: 'object',
      properties: {
        code: {
          type: 'string',
          description: 'The complete code to replace the current editor content'
        },
        explanation: {
          type: 'string',
          description: 'Brief explanation of what the code does'
        }
      },
      required: ['code']
    }
  },
  {
    name: 'edit_code',
    description: 'Apply a targeted edit to specific parts of the existing code',
    parameters: {
      type: 'object',
      properties: {
        oldCode: {
          type: 'string',
          description: 'The exact code section to replace'
        },
        newCode: {
          type: 'string',
          description: 'The new code to replace the old section'
        },
        explanation: {
          type: 'string',
          description: 'Brief explanation of the change'
        }
      },
      required: ['oldCode', 'newCode']
    }
  },
  {
    name: 'idle',
    description: 'Mark the current task as complete and stop processing',
    parameters: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          description: 'Summary of what was accomplished'
        },
        message: {
          type: 'string',
          description: 'Final message to the user'
        }
      },
      required: ['summary', 'message']
    }
  }
]; 