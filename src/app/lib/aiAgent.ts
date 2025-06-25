import { REPLICAD_DOCS } from './replicadDocs';
import { AI_FUNCTIONS, AIContext, FunctionCall, Screenshot } from '../types/ai';
import { conversationStore } from './conversationStore';

// Define types for our API responses
interface ChatCompletionResponse {
  choices: Array<{
    message: {
      role: string;
      content?: string;
      tool_calls?: Array<{
        id: string;
        type: string;
        function: {
          name: string;
          arguments: string;
        };
      }>;
    };
  }>;
}



export class AIAgent {
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
  }

  setModel(model: string): void {
    this.model = model;
  }

  getModel(): string {
    return this.model;
  }

  private createSystemPrompt(): string {
    return `# C3D - Your AI CAD Assistant

You are C3D, an intelligent AI assistant that helps users create 3D models using ReplicaD, a powerful parametric CAD library. You work directly and efficiently with minimal overhead.

## Your Mission:
Transform user ideas into precise, well-commented 3D model code using ReplicaD.

## Available Tools:

### 🛠 **Code Generation & Modification**
- **write_code**: Replace the entire code with new implementation
- **edit_code**: Make targeted edits to specific code sections  
- **notify_user**: Send markdown messages to keep the user informed
- **idle**: Mark the task as complete when finished

## Code Requirements:

**Always use extensive comments in your code to explain what you're doing:**

\`\`\`typescript
// Import required functions from replicaD
import { drawCircle, drawRoundedRectangle, extrude } from 'replicad';
import { syncGeometries } from 'replicad-threejs-helper';

// Create the main cylinder shape
// Radius: 20mm, Height: 50mm
const cylinder = drawCircle(20)
  .sketchOnPlane()
  .extrude(50);

// Create a rounded rectangle base
// Width: 40mm, Height: 30mm, Corner radius: 5mm
const base = drawRoundedRectangle(40, 30, 5)
  .sketchOnPlane()
  .extrude(10);

// Mesh shapes for Three.js rendering
const meshedShapes = [
  {
    name: 'Main Cylinder',
    faces: cylinder.mesh({ tolerance: 0.05, angularTolerance: 30 }),
    edges: cylinder.meshEdges(),
  },
  {
    name: 'Base Plate', 
    faces: base.mesh({ tolerance: 0.05, angularTolerance: 30 }),
    edges: base.meshEdges(),
  }
];

// Convert to Three.js format for the 3D viewer
const geometries = syncGeometries(meshedShapes, []);

// Export for the 3D viewer
export { geometries };
\`\`\`

## Design Principles:

### 📏 **Clear Documentation**
- Use detailed comments explaining dimensions, design decisions, and functionality
- Name variables and shapes descriptively
- Include units in comments (mm, degrees, etc.)

### 🔧 **Manufacturing Awareness**
- Consider real-world constraints and tolerances
- Design for 3D printing when appropriate
- Include proper fillets and chamfers

### ⚡ **Efficient Workflow**
- Work directly without extensive planning overhead
- Use notify_user sparingly for key updates
- Complete tasks efficiently with idle when done

## ReplicaD Documentation Reference:
${REPLICAD_DOCS}

## Approach:
1. **Understand** the user's request
2. **Implement** using write_code or edit_code with comprehensive comments
3. **Notify** user of key insights or considerations if needed
4. **Complete** with idle when finished

**Important Guidelines:**
- Keep JSON responses concise to prevent truncation
- Use extensive code comments for education rather than long explanations
- Focus on direct implementation rather than verbose descriptions
- Remember: Your code comments are your main teaching tool`;
  }

  async processUserMessage(
    context: AIContext,
    onFunctionCall: (call: FunctionCall) => Promise<unknown>
  ): Promise<void> {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

    // Get provider settings
    const providerSettings = await conversationStore.getProviderSettings();

    // Capture screenshots if we have the capability
    let screenshots: Screenshot[] = [];
    try {
      screenshots = await captureViewportScreenshots();
    } catch (error) {
      console.warn('Failed to capture screenshots:', error);
    }

    // Define message format compatible with OpenAI API
    interface ChatMessage {
      role: string;
      content?: string;
      tool_call_id?: string;
    }

    const messages: ChatMessage[] = [
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

Visual Context: I have captured ${screenshots.length} orthographic views of the current 3D model:
${screenshots.map(shot => `- ${shot.view.toUpperCase()} view: Current geometry visible`).join('\n')}

Please implement this request directly using the available tools. Use write_code to replace the entire code or edit_code to make targeted changes. Include comprehensive comments explaining your design decisions. Complete the task with idle when finished.`,
      },
    ];

    let isComplete = false;
    let iterations = 0;
    const maxIterations = 15; // Increased for more complex tasks

    while (!isComplete && iterations < maxIterations) {
      iterations++;

      try {
        // Build a JSON schema for structured outputs
        const functionNames = AI_FUNCTIONS.map(f => f.name);
        const responseSchema = {
          name: 'ai_function_call',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Name of the function to invoke',
                enum: functionNames,
              },
              arguments: {
                type: 'object',
                description: 'Arguments for the function call',
              },
            },
            required: ['name', 'arguments'],
            additionalProperties: false,
          },
        };

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            apiKey: this.apiKey,
            model: this.model,
            messages,
            baseUrl: providerSettings.baseUrl,
            useToolCalling: providerSettings.useToolCalling,
            tools: providerSettings.useToolCalling ? AI_FUNCTIONS : undefined,
            response_format: !providerSettings.useToolCalling ? {
              type: 'json_schema',
              json_schema: responseSchema,
            } : undefined,
            temperature: 0.9,
            max_tokens: 2000,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'API request failed');
        }

        const data: ChatCompletionResponse = await response.json();

        const message = data.choices[0]?.message;
        if (!message) {
          throw new Error('No response from AI');
        }

        console.log('Received message', message);

        // Add assistant message to conversation
        messages.push(message);

        // Parse structured JSON response
        let actions: Array<{ name: string; arguments: Record<string, unknown> }> = [];

        if (message.content) {
          console.log('Processing message content:', message.content);
          try {
            // Check if the content looks like truncated JSON
            if (message.content.trim().startsWith('{') && !message.content.trim().endsWith('}')) {
              console.warn('Content appears to be truncated JSON, attempting to recover...');
              
              // Try to find a complete function call pattern within the truncated content
              const functionCallMatch = message.content.match(/"name":\s*"(\w+)".*?"arguments":\s*{/);
              if (functionCallMatch) {
                const functionName = functionCallMatch[1];
                console.log(`Found truncated function call: ${functionName}, treating as notify_user`);
                
                // Treat truncated responses as notifications with error info
                await onFunctionCall({
                  name: 'notify_user',
                  arguments: {
                    message: `I encountered an issue with my response (truncated JSON). The function I was trying to call was "${functionName}". Please try rephrasing your request or try again.`,
                    type: 'error',
                  },
                });
                continue;
              } else {
                console.warn('Could not identify function in truncated JSON, notifying user of error');
                await onFunctionCall({
                  name: 'notify_user',
                  arguments: {
                    message: 'I encountered a technical issue with my response (incomplete data). Please try your request again.',
                    type: 'error',
                  },
                });
                continue;
              }
            }
            
            const parsed = JSON.parse(message.content.trim());
            console.log('Successfully parsed JSON:', parsed);

            if (Array.isArray(parsed)) {
              actions = parsed as Array<{ name: string; arguments: Record<string, unknown> }>;
              console.log('Parsed as array of actions:', actions.length);
            } else if (typeof parsed === 'object' && parsed !== null && 'name' in parsed) {
              actions = [parsed as { name: string; arguments: Record<string, unknown> }];
              console.log('Parsed as single action:', actions[0]);
            }
          } catch (parseError) {
            console.warn('Failed to parse as JSON:', parseError);
            
            // If the content starts with { but failed to parse, it's likely truncated
            if (message.content.trim().startsWith('{')) {
              console.error('Detected malformed/truncated JSON response');
              await onFunctionCall({
                name: 'notify_user',
                arguments: {
                  message: 'I encountered a technical issue with my response (malformed JSON). Please try your request again.',
                  type: 'error',
                },
              });
              continue;
            }
            
            // Try to parse raw function call format like "send_plan({...})"
            const functionCallMatch = message.content.match(/(\w+)\(({[\s\S]*})\)/);
            if (functionCallMatch) {
              const [, functionName, argsString] = functionCallMatch;
              console.log(`Found function call pattern: ${functionName}(...)`);
              try {
                const parsedArgs = JSON.parse(argsString);
                actions = [{
                  name: functionName,
                  arguments: parsedArgs
                }];
                console.log('Successfully parsed function call pattern');
              } catch (parseError) {
                console.warn('Failed to parse function call arguments:', parseError);
                await onFunctionCall({
                  name: 'notify_user',
                  arguments: {
                    message: 'I encountered a parsing error in my response. Please try your request again.',
                    type: 'error',
                  },
                });
                continue;
              }
            }
          }
        }

        if (actions.length > 0) {
          console.log(`Executing ${actions.length} actions:`, actions.map(a => a.name));
          for (const action of actions) {
            const functionCall: FunctionCall = {
              name: action.name,
              arguments: action.arguments || {},
            };

            console.log(`Calling function: ${functionCall.name}`, functionCall.arguments);
            try {
              const result = await onFunctionCall(functionCall);
              functionCall.result = result;
              console.log(`Function ${functionCall.name} completed:`, result);

              // Provide feedback to the LLM
              messages.push({
                role: 'assistant',
                content: `Function ${functionCall.name} executed. Result: ${JSON.stringify(result)}`,
              });

              if (functionCall.name === 'idle') {
                console.log('Task marked as complete, stopping processing');
                isComplete = true;
                break;
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';
              console.error(`Function ${functionCall.name} failed:`, errorMessage);

              messages.push({
                role: 'assistant',
                content: `Error executing ${functionCall.name}: ${errorMessage}`,
              });
            }
          }
        } else if (message.content && !message.content.trim().startsWith('{')) {
          // Only forward plain content that's not malformed JSON
          console.log('Forwarding plain content as notification');
          await onFunctionCall({
            name: 'notify_user',
            arguments: {
              message: message.content,
              type: 'info',
            },
          });
        } else {
          console.warn('No valid actions found and content not suitable for display');
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
          message: `Maximum iterations reached (${maxIterations}). Task may be incomplete. Please review the results and provide additional guidance if needed.`,
          type: 'warning'
        }
      });
    }
  }
}

// Utility function to capture screenshots from the 3D viewport
export async function captureViewportScreenshots(): Promise<Screenshot[]> {
  const screenshots: Screenshot[] = [];
  
  // Check if we have access to the Canvas element
  const canvas = document.querySelector('canvas');
  if (!canvas) {
    throw new Error('No 3D canvas found for screenshot capture');
  }

  // Get the Three.js scene and camera from the React Three Fiber context
  // This is a bit tricky since we need to access the Three.js internals
  // We'll use a global hook for this
    interface Vector3 {
    x: number;
    y: number;
    z: number;
  }
  
  interface CameraController {
    camera: { position: Vector3 };
    controls?: { target: Vector3 };
    moveToView: (position: [number, number, number], target: [number, number, number]) => Promise<void>;
  }
  
  if (typeof window !== 'undefined' && (window as { __CAD_CAMERA_CONTROLLER__?: CameraController }).__CAD_CAMERA_CONTROLLER__) {
    const controller = (window as { __CAD_CAMERA_CONTROLLER__?: CameraController }).__CAD_CAMERA_CONTROLLER__!;
     
     const views: Array<{ name: 'front' | 'back' | 'left' | 'right', position: [number, number, number], target: [number, number, number] }> = [
       { name: 'front', position: [0, 0, 100], target: [0, 0, 0] },
       { name: 'back', position: [0, 0, -100], target: [0, 0, 0] },
       { name: 'left', position: [-100, 0, 0], target: [0, 0, 0] },
       { name: 'right', position: [100, 0, 0], target: [0, 0, 0] }
     ];

     // Store original camera state
     const originalPosition: Vector3 = { ...controller.camera.position };
     const originalTarget: Vector3 | undefined = controller.controls?.target ? { ...controller.controls.target } : undefined;

    try {
      for (const view of views) {
        // Smoothly transition to the view
        await controller.moveToView(view.position, view.target);
        
        // Wait for rendering to complete
        await new Promise(resolve => {
          requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
          });
        });

        // Capture screenshot
        const dataUrl = canvas.toDataURL('image/png');
        screenshots.push({
          view: view.name,
          dataUrl
        });
      }

      // Return to original position
      await controller.moveToView(
        [originalPosition.x, originalPosition.y, originalPosition.z],
        originalTarget ? [originalTarget.x, originalTarget.y, originalTarget.z] : [0, 0, 0]
      );
      
    } catch (error) {
      console.error('Failed to capture screenshots:', error);
      // Return to original position even if capture failed
      if (originalPosition && originalTarget) {
        await controller.moveToView(
          [originalPosition.x, originalPosition.y, originalPosition.z],
          [originalTarget.x, originalTarget.y, originalTarget.z]
        );
      }
      throw error;
    }
  }

  return screenshots;
}

// Utility function to apply code diffs
export function applyCodeDiff(originalCode: string, oldCode: string, newCode: string): string {
  // Simple diff application - find and replace the old code with new code
  const index = originalCode.indexOf(oldCode);
  if (index === -1) {
    throw new Error('Could not find the specified code section to update');
  }
  
  return originalCode.substring(0, index) + newCode + originalCode.substring(index + oldCode.length);
} 