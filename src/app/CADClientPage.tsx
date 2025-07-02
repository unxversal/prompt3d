/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

// NOTE: This file contains the original implementation of the CAD page. It is imported dynamically from the server wrapper (page.tsx) with `ssr:false` so that Web Worker APIs are not evaluated during server-side rendering.

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { SandpackProvider, SandpackLayout, SandpackCodeEditor, useSandpack } from '@codesandbox/sandpack-react';
import { amethyst } from '@codesandbox/sandpack-themes';
import styles from './page.module.css';
import CADViewer from './components/CADViewer';
import ChatInterface from './components/ChatInterface';
import SettingsPopover from './components/SettingsPopover';
import ChatHistoryModal from './components/ChatHistoryModal';
import { conversationStore } from './lib/conversationStore';
import { Conversation } from './types/ai';

// Define WorkerShape interface to match what's used in CADViewer
interface WorkerShape {
  name?: string;
  color?: string;
  opacity?: number;
  meshData: {
    vertices: Float32Array;
    indices: Uint32Array | Uint16Array;
    normals?: Float32Array;
  };
}

// Add interface for storing original replicad shapes
interface ReplicadShape {
  name: string;
  shape: any; // The actual replicad shape object
  color?: string;
  opacity?: number;
}

// Default example code demonstrating use of Replicad without explicit imports.
// All Replicad functions (drawCircle, makeCuboid, union, etc.) are automatically
// available in this editor.

const DEFAULT_CODE = `import { draw, drawRoundedRectangle, drawCircle, drawPolygon, sketchCircle, sketchRectangle } from "replicad";

const main = () => {
  // Create a base profile - rounded rectangle
  const profile = drawRoundedRectangle(50, 30, 5)
    .sketchOnPlane("XY")
    .extrude(10);

  // Create a cylindrical hole
  const hole = sketchCircle(8)
    .sketchOnPlane("XY", [0, 0, 5])
    .extrude(15);

  // Subtract the hole from the profile
  const result = profile.cut(hole);

  return result;
};

export default main;`;

// Component to handle code changes within Sandpack context
function CodeEditor({ onCodeChange }: { onCodeChange: (code: string) => void }) {
  const { sandpack } = useSandpack();
  
  useEffect(() => {
    const file = sandpack.files['/index.ts'];
    if (file && file.code) {
      onCodeChange(file.code);
    }
  }, [sandpack.files, onCodeChange]);

  return (
    <SandpackCodeEditor 
      showTabs={false}
      showLineNumbers={true}
      showInlineErrors={false}
      wrapContent={false}
      closableTabs={false}
      style={{ height: "100vh" }}
    />
  );
}

export default function CADClientPage() {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [shapes, setShapes] = useState<WorkerShape[]>([]);
  const [replicadShapes, setReplicadShapes] = useState<ReplicadShape[]>([]);  // Store original shapes for export
  const [isExecuting, setIsExecuting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [chatState, setChatState] = useState<'minimal' | 'panel'>('minimal');
  const [codeState, setCodeState] = useState<'hidden' | 'visible'>('hidden');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [model, setModel] = useState<string>('google/gemini-2.0-flash-exp:free');
  const [showSettings, setShowSettings] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  // Load API key and model on startup
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedApiKey = await conversationStore.getApiKey();
        const savedModel = await conversationStore.getModel();
        
        if (savedApiKey) {
          setApiKey(savedApiKey);
        }
        setModel(savedModel);
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, []);

    // Initialize OpenCascade once
  useEffect(() => {
    const initializeOpenCascade = async () => {
      if (isInitialized) return;

      const toastId = toast.loading('Loading CAD engine...', {
        description: 'Initializing C3D Engine.',
      });

      try {
        console.log('Initializing OpenCascade...');
        
        const replicad = await import('replicad');
        const opencascadeModule = await import('replicad-opencascadejs');
        
        const opencascade = opencascadeModule.default;
        // @ts-expect-error - opencascade types are outdated
        const OC = await opencascade({
          locateFile: (file: string) => {
            console.log('OpenCascade requesting file:', file);
            if (file.endsWith('.wasm')) {
              return '/replicad_single.wasm';
            }
            return file;
          }
        });
        
        console.log('OpenCascade loaded, setting OC...');
        replicad.setOC(OC);
        console.log('OpenCascade setup complete');
        
        setIsInitialized(true);
        
        toast.success('C3D Engine Loaded!', {
          id: toastId,
          description: 'Ready to generate 3D models.',
        });
      } catch (err) {
        console.error('Failed to initialize OpenCascade:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to initialize OpenCascade';
        
        toast.error('Failed to load CAD engine', {
          id: toastId,
          description: errorMessage.slice(0, 80) + (errorMessage.length > 80 ? '...' : ''),
        });
      }
    };

    initializeOpenCascade();
  }, [isInitialized]);

  // Execute current code
  const executeCode = useCallback(async (codeToRun: string) => {
    if (isExecuting || !isInitialized) return;

    setIsExecuting(true);
    const toastId = toast.loading('Generating shapes...', {
      description: 'Creating 3D models with C3D Engine.',
    });

    try {
      // Import replicad and helper
      const replicad = await import('replicad');
      const { syncGeometries } = await import('replicad-threejs-helper');

      // If code is empty or default, use the demo code
      const codeToExecute = codeToRun.trim() === DEFAULT_CODE.trim() || !codeToRun.trim() ? `
        // Default demo shapes
        const cylinder = drawCircle(20).sketchOnPlane().extrude(50);
        const roundedRect = drawRoundedRectangle(40, 30, 5)
          .sketchOnPlane()
          .extrude(10);
        
        const meshedShapes = [
          {
            name: 'Cylinder',
            faces: cylinder.mesh({ tolerance: 0.05, angularTolerance: 30 }),
            edges: cylinder.meshEdges(),
          },
          {
            name: 'Rounded Rectangle',
            faces: roundedRect.mesh({ tolerance: 0.05, angularTolerance: 30 }),
            edges: roundedRect.meshEdges(),
          },
        ];
      ` : codeToRun;

      // Remove any static import/export lines to avoid syntax errors inside AsyncFunction
      const sanitizedCode = codeToExecute
        .replace(/^\s*import[^\n]*$/gm, '')
        .replace(/^\s*export[^\n]*$/gm, '');

      // Dynamically inject *all* Replicad exports so they are available without explicit import.
      // Build an AsyncFunction that receives the `replicad` module object, then immediately
      // destructures every named export into local variables.

      const replicadKeys = Object.keys(replicad).filter(k => k !== 'default');

      let meshedShapes: any[] = [];
      let originalShapes: ReplicadShape[] = [];

      try {
        const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

        // Generate the function body. We create a destructuring statement so that each export
        // (e.g. drawCircle, extrude, union, …) becomes a local identifier.
        const asyncBody = `
          // Make all Replicad exports available in the execution scope
          const { ${replicadKeys.join(', ')} } = replicad;

          ${sanitizedCode}

          // Return the meshedShapes if they exist
          if (typeof meshedShapes !== 'undefined') {
            return meshedShapes;
          }

          // If no meshedShapes, return empty array
          return [];
        `;

        const execFunction = new AsyncFunction('replicad', asyncBody);

        // Execute with the full Replicad object injected
        const result = await execFunction(replicad);
        meshedShapes = Array.isArray(result) ? result : [];

        // Create original shapes for export (simplified for now)
        originalShapes = meshedShapes.map((shape, index) => ({
          name: shape.name || `Shape ${index + 1}`,
          shape: shape.faces ? shape : null,
          color: '#667eea',
          opacity: 1,
        }));
      } catch (codeError) {
        // Instead of falling back to demo shapes, re-throw the error
        // so it can be caught by the agent's function handler.
        console.error('Code execution error:', codeError);
        throw codeError;
      }

      // Use replicad-threejs-helper to create Three.js geometries
      const geometries = syncGeometries(meshedShapes, []);

       // Convert to WorkerShape format for the viewer
       const workerShapes: WorkerShape[] = geometries.map((geom: any, index: number) => {
        const faces = geom.faces;
        const vertices = faces.attributes.position.array as Float32Array;
        const indices = faces.index?.array as Uint32Array | Uint16Array;
        const normals = faces.attributes.normal?.array as Float32Array;

        return {
          name: meshedShapes[index]?.name || `Shape ${index + 1}`,
          color: index === 0 ? '#667eea' : '#f093fb',
          opacity: 1,
          meshData: {
            vertices,
            indices: indices || new Uint32Array(),
            normals
          }
        };
      });

      setShapes(workerShapes);
      setReplicadShapes(originalShapes);
      toast.success('Shapes generated successfully!', {
        id: toastId,
        description: `Generated ${workerShapes.length} shapes.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast.error('Generation failed', {
        id: toastId,
        description: errorMessage.slice(0, 80) + (errorMessage.length > 80 ? '...' : ''),
      });
      // Re-throw so the agent's promise can reject
      throw err;
    } finally {
      setIsExecuting(false);
    }
  }, [isExecuting, isInitialized]);

  // Auto-execute once after initialization
  useEffect(() => {
    if (isInitialized && shapes.length === 0) {
      executeCode(code);
    }
  }, [isInitialized, executeCode, shapes.length, code]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        // Execute code when Cmd+Enter is pressed
        if (isInitialized) {
          executeCode(code);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInitialized, executeCode, chatState, code]);

  const handleAgentCodeChange = async (newCode: string): Promise<void> => {
    // This function will be called by the ChatInterface when the agent
    // provides new code. It updates the state and then executes.
    setCode(newCode);
    
    // We need to ensure the `executeCode` function runs with the `newCode`.
    // By passing it directly, we avoid issues with stale state.
    // The `try/catch` is handled inside the ChatInterface's function handler.
    await executeCode(newCode);
  };

  const handleExportSTEP = useCallback(async () => {
    if (shapes.length === 0 || replicadShapes.length === 0) {
      toast.error('No shapes to export');
      return;
    }

    const toastId = toast.loading('Exporting STEP file...', {
      description: 'Creating STEP file from C3D models.',
    });

    try {
      // Import replicad's export function
      const { exportSTEP } = await import('replicad');
      
      // Convert replicad shapes to the format expected by exportSTEP
      const shapesToExport = replicadShapes.map(({ shape, name }) => ({
        shape,
        name: name || 'Unnamed Shape'
      }));

      // Export to STEP with proper units
      const stepBlob = exportSTEP(shapesToExport, {
        unit: 'mm',
        modelUnit: 'mm'
      });

      // Download the file
      const url = URL.createObjectURL(stepBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `c3d-model-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.step`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('STEP file exported successfully!', {
        id: toastId,
        description: `Exported ${replicadShapes.length} shapes to STEP format.`,
      });
    } catch (error) {
      console.error('STEP export failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Failed to export STEP file', {
        id: toastId,
        description: errorMessage.slice(0, 80) + (errorMessage.length > 80 ? '...' : ''),
      });
    }
  }, [shapes.length, replicadShapes]);

  const toggleChat = () => {
    setChatState(chatState === 'panel' ? 'minimal' : 'panel');
  };

  const toggleCode = () => {
    setCodeState(codeState === 'visible' ? 'hidden' : 'visible');
  };

  const handleApiKeyRequired = () => {
    setShowSettings(true);
  };

  const handleApiKeyChange = (newApiKey: string) => {
    setApiKey(newApiKey);
  };

  const handleModelChange = (newModel: string) => {
    setModel(newModel);
  };

  const handleProviderSettingsChange = (settings: {
    baseUrl: string;
    useToolCalling: boolean;
  }) => {
    // Provider settings are stored in the conversation store
    // and will be used by the AI agent automatically
    console.log('Provider settings updated:', settings);
  };

  const handleNewChat = async () => {
    if (isCreatingChat) return;
    setIsCreatingChat(true);
    try {
      // Create a new conversation
      const newConversation: Conversation = {
        id: Math.random().toString(36).substr(2, 9),
        title: 'New CAD Session',
        messages: [{
          id: Math.random().toString(36).substr(2, 9),
          role: 'assistant',
          content: "Hi! I'm C3D, your intelligent CAD assistant. Describe what you'd like to build and I'll generate it!",
          timestamp: new Date(),
        }],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await conversationStore.saveConversation(newConversation);
      setCurrentConversation(newConversation);

      // Reset the code editor back to the default template
      setCode(DEFAULT_CODE);

      // Close chat history modal if open
      setShowChatHistory(false);

      // Reset chat state to show the new conversation
      setChatState('minimal');
      setTimeout(() => setChatState('panel'), 100);

      toast.success('Started new chat');
    } catch (error) {
      console.error('Failed to create new chat:', error);
      toast.error('Failed to create new chat');
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleLoadConversation = (conversation: Conversation) => {
    setCurrentConversation(conversation);
    setShowChatHistory(false);
    
    // Attempt to retrieve the most recent code snapshot stored in messages
    let foundCode: string | undefined;

    for (let i = conversation.messages.length - 1; i >= 0; i--) {
      const message = conversation.messages[i];
      const funcCall = message.metadata?.functionCall;
      if (funcCall && (funcCall.name === 'write_code' || funcCall.name === 'edit_code')) {
        const codeArg = (funcCall.arguments as Record<string, unknown>)?.code as string | undefined;
        if (typeof codeArg === 'string' && codeArg.trim().length > 0) {
          foundCode = codeArg;
          break;
        }
      }
    }

    if (foundCode) {
      // Load the code snapshot from history
      setCode(foundCode);
      // Execute the code to update the CAD viewer
      executeCode(foundCode);
    } else {
      // Conversation has no generated code yet – reset to default template
      setCode(DEFAULT_CODE);
      // Execute the default code to show something in the viewer
      executeCode(DEFAULT_CODE);
    }
    
    // Open chat panel
    setChatState('panel');
  };

  const handleConversationRenamed = (conversationId: string, newTitle: string) => {
    // Update current conversation if it's the one being renamed
    if (currentConversation && currentConversation.id === conversationId) {
      setCurrentConversation(prev => prev ? {
        ...prev,
        title: newTitle,
        updatedAt: new Date()
      } : null);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <a 
          href="https://cxmpute.cloud" 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.titleContainer}
        >
          <Image src="/6.png" alt="C3D Logo" className={styles.logo} width={10} height={10} />
          <h1 className={styles.title}>C3D CAD</h1>
        </a>
        <p className={styles.subtitle}>An agentic, code-first CAD editor.</p>
      </header>

      <div className={styles.mainContent}>
        {/* Main Workspace */}
        <div className={styles.workspace}>
          {/* Left Panel - CAD Viewer */}
          <div className={`${styles.viewerPanel} ${chatState === 'panel' ? styles.withChatPanel : ''} ${codeState === 'visible' ? styles.withCodePanel : ''}`}>
            <CADViewer shapes={shapes} isMinimalView={chatState === 'minimal'} />
          </div>

          {/* Middle Panel - Code Editor */}
          {codeState === 'visible' && (
            <div className={styles.editorPanel}>
              <div className={styles.sandpackContainer}>
                <SandpackProvider
                  key={currentConversation?.id || 'default'}
                  template="vanilla-ts"
                  theme={amethyst}
                  files={{
                    "/index.ts": {
                      code: code,
                    },
                    "/package.json": {
                      code: JSON.stringify({
                        dependencies: {
                          "replicad": "^0.19.0",
                          "replicad-threejs-helper": "^0.19.0",
                          "three": "^0.177.0"
                        }
                      }, null, 2)
                    }
                  }}
                  options={{
                    autorun: false,
                  }}
                >
                  <SandpackLayout>
                    <CodeEditor onCodeChange={setCode} />
                  </SandpackLayout>
                </SandpackProvider>
              </div>
            </div>
          )}

          {/* Right Panel - Chat (when in panel mode) */}
          {chatState === 'panel' && (
            <ChatInterface 
              state="panel"
              currentCode={code}
              onAgentCodeChange={handleAgentCodeChange}
              apiKey={apiKey}
              model={model}
              onApiKeyRequired={handleApiKeyRequired}
              currentConversation={currentConversation}
              onRunCode={() => executeCode(code)}
              onExportSTEP={handleExportSTEP}
              onOpenSettings={() => setShowSettings(true)}
              onNewChat={handleNewChat}
              onChatHistory={() => setShowChatHistory(true)}
              onToggleChat={toggleChat}
              onToggleCode={toggleCode}
              isExecuting={isExecuting}
              canExport={shapes.length > 0}
            />
          )}

          {/* Minimal Chat Interface - overlaid on the entire layout */}
          {chatState === 'minimal' && (
            <ChatInterface 
              state="minimal"
              currentCode={code}
              onAgentCodeChange={handleAgentCodeChange}
              apiKey={apiKey}
              model={model}
              onApiKeyRequired={handleApiKeyRequired}
              currentConversation={currentConversation}
              onRunCode={() => executeCode(code)}
              onExportSTEP={handleExportSTEP}
              onOpenSettings={() => setShowSettings(true)}
              onNewChat={handleNewChat}
              onChatHistory={() => setShowChatHistory(true)}
              onToggleChat={toggleChat}
              onToggleCode={toggleCode}
              isExecuting={isExecuting}
              canExport={shapes.length > 0}
            />
          )}
        </div>
      </div>

      {/* Settings Popover */}
      <SettingsPopover
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onApiKeyChange={handleApiKeyChange}
        onModelChange={handleModelChange}
        onProviderSettingsChange={handleProviderSettingsChange}
      />

      {/* Chat History Modal */}
      <ChatHistoryModal
        isOpen={showChatHistory}
        onClose={() => setShowChatHistory(false)}
        onNewChat={handleNewChat}
        onLoadConversation={handleLoadConversation}
        onConversationRenamed={handleConversationRenamed}
        currentCode={code}
      />
    </div>
  );
}

// Extend the Window interface for our global function
declare global {
  interface Window {
    setCADCode?: (code: string) => void;
  }
} 