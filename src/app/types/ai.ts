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
    description: 'Send a notification or update message to the user',
    parameters: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'The message to display to the user'
        },
        type: {
          type: 'string',
          enum: ['info', 'warning', 'error', 'success'],
          description: 'The type of notification'
        },
        isCollapsedMessage: {
          type: 'boolean',
          description: 'Whether this is a short message for collapsed mode'
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
    name: 'update_code',
    description: 'Apply a diff-based update to the existing code',
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
    name: 'send_plan',
    description: 'Send the initial plan for what the agent will do',
    parameters: {
      type: 'object',
      properties: {
        plan: {
          type: 'string',
          description: 'Detailed plan of what the agent will accomplish'
        },
        steps: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of steps the agent will take'
        }
      },
      required: ['plan']
    }
  },
  {
    name: 'update_plan',
    description: 'Update or modify the current plan',
    parameters: {
      type: 'object',
      properties: {
        updatedPlan: {
          type: 'string',
          description: 'The updated plan description'
        },
        reason: {
          type: 'string',
          description: 'Why the plan was updated'
        }
      },
      required: ['updatedPlan', 'reason']
    }
  },
  {
    name: 'complete_task',
    description: 'Mark the task as complete and provide a summary',
    parameters: {
      type: 'object',
      properties: {
        summary: {
          type: 'string',
          description: 'Summary of what was accomplished'
        },
        finalMessage: {
          type: 'string',
          description: 'Final message to the user'
        }
      },
      required: ['summary', 'finalMessage']
    }
  }
]; 