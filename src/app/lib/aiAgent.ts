import OpenAI from 'openai';
import { REPLICAD_DOCS } from './replicadDocs';
import { AI_FUNCTIONS, AIContext, FunctionCall } from '../types/ai';

export class AIAgent {
  private openai: OpenAI | null = null;
  private apiKey: string | null = null;
  private model: string = 'google/gemini-2.0-flash-exp:free';

  constructor(apiKey?: string, model?: string) {
    if (apiKey) {
      this.setApiKey(apiKey);
    }
    if (model) {
      this.setModel(model);
    }
  }

  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    this.openai = new OpenAI({
      baseURL: 'https://openrouter.ai/api/v1',
      apiKey: apiKey,
      defaultHeaders: {
        'HTTP-Referer': 'https://prompt3d.com',
        'X-Title': 'C3D - AI CAD Assistant',
      },
    });
  }

  setModel(model: string): void {
    this.model = model;
  }

  getModel(): string {
    return this.model;
  }

  private createSystemPrompt(): string {
    return `You are C3D, an advanced AI CAD assistant that helps users create 3D models using ReplicaD, a powerful CAD library. You have access to the complete ReplicaD documentation and can write, modify, and explain CAD code.

## Your Capabilities:
- **Code Generation**: Write complete CAD scripts using ReplicaD
- **Code Modification**: Update existing code with precise diffs
- **Planning**: Create detailed plans before implementation
- **Progress Updates**: Keep users informed of your progress
- **Task Completion**: Provide summaries when finished

## Available Libraries:
- **replicad**: Core CAD modeling library
- **replicad-threejs-helper**: Integration with Three.js for rendering
- **three**: 3D graphics library for visualization

## Function Calling Protocol:
1. Always start by calling \`send_plan\` with your implementation strategy
2. Use \`notify_user\` to provide updates during execution
3. Use \`write_code\` for complete code replacement or \`update_code\` for targeted changes
4. Call \`update_plan\` if your approach needs to change
5. Always end with \`complete_task\` providing a summary

## ReplicaD Documentation:
${REPLICAD_DOCS}

## Code Structure Guidelines:
- Always import required functions from replicad at the top
- Use syncGeometries from replicad-threejs-helper for Three.js integration
- Create meshed shapes with appropriate tolerance settings
- Export geometries for the 3D viewer
- Include meaningful comments explaining the CAD operations

## Best Practices:
- Start with simple shapes and build complexity gradually
- Use parametric design principles when possible
- Optimize mesh tolerance for performance vs quality
- Provide clear variable names and structure

Remember: You are helping users learn CAD design while creating their requested 3D models. Be educational, precise, and always explain your design decisions.`;
  }

  async processUserMessage(
    context: AIContext,
    onFunctionCall: (call: FunctionCall) => Promise<unknown>
  ): Promise<void> {
    if (!this.openai) {
      throw new Error('API key not set');
    }

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: this.createSystemPrompt(),
      },
      ...context.conversationHistory.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      {
        role: 'user',
        content: `User Request: ${context.userPrompt}

Current Code:
\`\`\`typescript
${context.currentCode}
\`\`\`

Screenshots: ${context.screenshots.length} views available (front, back, left, right)

Please analyze the request and current code, then create a plan and execute the necessary changes.`,
      },
    ];

    let isComplete = false;
    let iterations = 0;
    const maxIterations = 10; // Prevent infinite loops

    while (!isComplete && iterations < maxIterations) {
      iterations++;

      try {
        const completion = await this.openai.chat.completions.create({
          model: this.model,
          messages,
          tools: AI_FUNCTIONS.map(func => ({
            type: 'function' as const,
            function: {
              name: func.name,
              description: func.description,
              parameters: func.parameters,
            },
          })),
          tool_choice: 'auto',
          temperature: 0.1,
        });

        const message = completion.choices[0]?.message;
        if (!message) {
          throw new Error('No response from AI');
        }

        // Add assistant message to conversation
        messages.push(message);

        if (message.tool_calls && message.tool_calls.length > 0) {
          // Process function calls
          for (const toolCall of message.tool_calls) {
            const functionCall: FunctionCall = {
              name: toolCall.function.name,
              arguments: JSON.parse(toolCall.function.arguments),
            };

            try {
              const result = await onFunctionCall(functionCall);
              functionCall.result = result;

              // Add function result to conversation
              messages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: JSON.stringify(result || 'Function executed successfully'),
              });

              // Check if this was a completion function
              if (toolCall.function.name === 'complete_task') {
                isComplete = true;
                break;
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              functionCall.error = errorMessage;
              
              messages.push({
                role: 'tool',
                tool_call_id: toolCall.id,
                content: `Error: ${errorMessage}`,
              });
            }
          }
        } else if (message.content) {
          // Regular message without function calls
          await onFunctionCall({
            name: 'notify_user',
            arguments: {
              message: message.content,
              type: 'info'
            }
          });
        }
      } catch (error) {
        console.error('AI Agent error:', error);
        
        if (error instanceof Error && error.message.includes('API key')) {
          throw new Error('Invalid API key. Please check your OpenRouter API key.');
        }
        
        throw new Error(`AI processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    if (iterations >= maxIterations && !isComplete) {
      await onFunctionCall({
        name: 'notify_user',
        arguments: {
          message: 'AI agent reached maximum iterations. Task may be incomplete.',
          type: 'warning'
        }
      });
    }
  }

  // Utility method to test API key
  async testApiKey(): Promise<boolean> {
    if (!this.openai) return false;

    try {
      await this.openai.chat.completions.create({
        model: this.model,
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 1,
      });
      return true;
    } catch {
      return false;
    }
  }
}

// Utility function to capture screenshots from the 3D viewport
export async function captureViewportScreenshots(): Promise<{ view: string; dataUrl: string }[]> {
  // This would integrate with the Three.js renderer to capture screenshots
  // For now, return empty array - will be implemented with the viewport integration
  return [];
}

// Utility function to apply code diffs
export function applyCodeDiff(originalCode: string, oldCode: string, newCode: string): string {
  // Simple string replacement - in production, might want to use a proper diff library
  const index = originalCode.indexOf(oldCode);
  if (index === -1) {
    throw new Error('Code section not found for diff application');
  }
  
  return originalCode.substring(0, index) + newCode + originalCode.substring(index + oldCode.length);
} 