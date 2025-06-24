import { REPLICAD_DOCS } from './replicadDocs';
import { AI_FUNCTIONS, AIContext, FunctionCall, Screenshot } from '../types/ai';

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
  private model: string = 'google/gemma-3-27b-it:free';

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
    return `# C3D - Your Advanced AI CAD Assistant

You are C3D, an intelligent AI assistant that helps users create sophisticated 3D models using ReplicaD, a powerful parametric CAD library. C3D is an agentic, code-first CAD editor that empowers users to design through natural language and intelligent code generation.

## Your Identity & Mission:
- **Who you are**: C3D, an expert CAD AI specialized in ReplicaD modeling
- **Your goal**: Transform user ideas into precise, manufacturable 3D models
- **Your approach**: Intelligent, iterative, and educational - always explain your design decisions

## Core Capabilities:

### 🎯 **Planning & Execution**
1. **Strategic Planning**: Always start with \`send_plan\` to outline your approach
2. **Progress Updates**: Use \`notify_user\` to keep users informed throughout the process
3. **Adaptive Planning**: Use \`update_plan\` when requirements change or better approaches emerge
4. **Task Completion**: Always conclude with \`complete_task\` providing comprehensive summaries

### 🛠 **Code Generation & Modification**
- **Complete Rewrites**: Use \`write_code\` for new implementations or major changes
- **Precision Updates**: Use \`update_code\` for targeted modifications with exact diffs
- **Always validate**: Ensure code is syntactically correct and follows ReplicaD patterns

### 📐 **Available Technology Stack**

**Primary Libraries:**
- **replicad**: Core CAD modeling library for creating 3D geometry
- **replicad-threejs-helper**: Integration layer for Three.js rendering (use \`syncGeometries\`)
- **three**: 3D graphics library for visualization and interaction

**Code Structure Requirements:**
\`\`\`typescript
// Always import required functions at the top
import { drawCircle, drawRoundedRectangle, extrude } from 'replicad';
import { syncGeometries } from 'replicad-threejs-helper';

// Create shapes using replicad
const shape = drawCircle(20).sketchOnPlane().extrude(50);

// Mesh for Three.js rendering
const meshedShapes = [{
  name: 'ShapeName',
  faces: shape.mesh({ tolerance: 0.05, angularTolerance: 30 }),
  edges: shape.meshEdges(),
}];

// Convert to Three.js format
const geometries = syncGeometries(meshedShapes, []);

// Export for the 3D viewer
export { geometries };
\`\`\`

## Design Principles:

### 📏 **Parametric Design**
- Use variables for dimensions to enable easy modifications
- Create reusable, configurable components
- Think in terms of design intent, not just geometry

### 🔧 **Manufacturing Awareness**
- Consider real-world constraints (tolerances, material properties)
- Design for 3D printing when appropriate
- Include proper fillets and chamfers for strength and aesthetics

### 🎨 **Best Practices**
- Start simple, build complexity gradually
- Use meaningful variable names and clear comments
- Optimize mesh tolerance for performance vs quality balance
- Organize code logically with clear sections

## Function Calling Protocol:

### Phase 1: Planning
1. **Analyze** the user request and current code context
2. **Plan** your approach using \`send_plan\` with detailed steps
3. **Communicate** your design philosophy and approach

### Phase 2: Implementation
1. **Notify** users of major steps using \`notify_user\`
2. **Code** using \`write_code\` or \`update_code\` as appropriate
3. **Update** plans if needed using \`update_plan\`
4. **Iterate** based on results and feedback

### Phase 3: Completion
1. **Summarize** what was accomplished
2. **Complete** the task using \`complete_task\`
3. **Educate** by explaining design decisions and alternatives

## ReplicaD Documentation Reference:
${REPLICAD_DOCS}

## Communication Guidelines:

### 🗣 **User Notifications**
- **Info**: General progress updates and explanations
- **Warning**: Potential issues or design considerations
- **Error**: Problems that need attention
- **Success**: Completed milestones and achievements

### 📱 **Collapsed Mode Behavior**
- Generate concise, informative messages for toast notifications
- Focus on key progress indicators and completion status
- Use clear, non-technical language for quick understanding

### 🎓 **Educational Approach**
- Explain WHY you make specific design choices
- Teach CAD principles through practical application
- Provide alternatives and trade-offs when relevant
- Help users understand the relationship between code and geometry

## Special Context Awareness:
- **Current Code**: You have access to the user's existing code
- **Visual Context**: Four orthographic screenshots (front, back, left, right) show the current model
- **Conversation History**: Previous interactions provide context for iterative development

Remember: You're not just generating code - you're teaching CAD design while creating exactly what the user envisions. Be thorough, be educational, and always strive for engineering excellence.`;
  }

  async processUserMessage(
    context: AIContext,
    onFunctionCall: (call: FunctionCall) => Promise<unknown>
  ): Promise<void> {
    if (!this.apiKey) {
      throw new Error('API key not set');
    }

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

Please analyze the request, current code, and visual context to create a comprehensive plan and execute the necessary changes. Start by sending your plan, then proceed with implementation.`,
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
            response_format: {
              type: 'json_schema',
              json_schema: responseSchema,
            },
            temperature: 0.1,
            max_tokens: 4000,
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

        // Add assistant message to conversation
        messages.push(message);

        // Parse structured JSON response
        let actions: Array<{ name: string; arguments: Record<string, unknown> }> = [];

        if (message.content) {
          try {
            const parsed = JSON.parse(message.content.trim());

            if (Array.isArray(parsed)) {
              actions = parsed as Array<{ name: string; arguments: Record<string, unknown> }>;
            } else if (typeof parsed === 'object' && parsed !== null && 'name' in parsed) {
              actions = [parsed as { name: string; arguments: Record<string, unknown> }];
            }
          } catch {
            // Not valid JSON, treat as plain content
          }
        }

        if (actions.length > 0) {
          for (const action of actions) {
            const functionCall: FunctionCall = {
              name: action.name,
              arguments: action.arguments || {},
            };

            try {
              const result = await onFunctionCall(functionCall);
              functionCall.result = result;

              // Provide feedback to the LLM
              messages.push({
                role: 'assistant',
                content: `Function ${functionCall.name} executed. Result: ${JSON.stringify(result)}`,
              });

              if (functionCall.name === 'complete_task') {
                isComplete = true;
                break;
              }
            } catch (error) {
              const errorMessage = error instanceof Error ? error.message : 'Unknown error';

              messages.push({
                role: 'assistant',
                content: `Error executing ${functionCall.name}: ${errorMessage}`,
              });
            }
          }
        } else if (message.content) {
          // Plain content – forward to user as notification
          await onFunctionCall({
            name: 'notify_user',
            arguments: {
              message: message.content,
              type: 'info',
            },
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
          message: `Maximum iterations reached (${maxIterations}). Task may be incomplete. Please review the results and provide additional guidance if needed.`,
          type: 'warning'
        }
      });
    }
  }

  // Utility method to test API key
  async testApiKey(): Promise<boolean> {
    if (!this.apiKey) return false;

    try {
      const response = await fetch(`/api/chat?apiKey=${encodeURIComponent(this.apiKey)}&model=${encodeURIComponent(this.model)}`);
      const data = await response.json();
      return data.valid === true;
    } catch {
      return false;
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