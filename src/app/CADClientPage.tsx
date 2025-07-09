/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

// NOTE: This file contains the original implementation of the CAD page. It is imported dynamically from the server wrapper (page.tsx) with `ssr:false` so that Web Worker APIs are not evaluated during server-side rendering.

import React, { useState, useCallback, useEffect, useRef } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { SandpackProvider, SandpackLayout, SandpackCodeEditor, useSandpack } from '@codesandbox/sandpack-react';
import { amethyst } from '@codesandbox/sandpack-themes';
import styles from './page.module.css';
import CADViewer from './components/CADViewer';
import ChatInterface from './components/ChatInterface';
import SettingsPopover from './components/SettingsPopover';
import ChatHistoryModal from './components/ChatHistoryModal';
import ResizableSplitter from './components/ResizableSplitter';
import DebugChatModal from './components/DebugChatModal';
import VersionHistoryModal from './components/VersionHistoryModal';
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

const DEFAULT_CODE = `// Default demo shapes
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
];`;

// Component to handle code changes within Sandpack context
function CodeEditor({ onCodeChange, codeRef }: { 
  onCodeChange: (code: string) => void;
  codeRef: React.MutableRefObject<string>;
}) {
  const { sandpack } = useSandpack();
  
  useEffect(() => {
    const file = sandpack.files['/index.ts'];
    if (file && file.code) {
      // Update both the state and the ref
      codeRef.current = file.code;
      onCodeChange(file.code);
    }
  }, [sandpack.files, onCodeChange, codeRef]);

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
  const [chatState, setChatState] = useState<'panel' | 'minimal'>('minimal');
  const [codeState, setCodeState] = useState<'visible' | 'hidden'>('hidden');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [model, setModel] = useState<string>('google/gemini-2.0-flash-exp:free');
  const [showSettings, setShowSettings] = useState(false);
  const [showChatHistory, setShowChatHistory] = useState(false);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [editorWidth, setEditorWidth] = useState(480);
  const [showDebugChat, setShowDebugChat] = useState(false);
  const [currentModelName, setCurrentModelName] = useState<string>('');
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  const [editModelId, setEditModelId] = useState<string | null>(null);
  const hasExecutedInitialCode = useRef(false);
  const currentCodeRef = useRef<string>(DEFAULT_CODE);

  // Helper function to extract the most recent code from a conversation
  const extractCodeFromConversation = useCallback((conversation: Conversation): string | undefined => {
    for (let i = conversation.messages.length - 1; i >= 0; i--) {
      const message = conversation.messages[i];
      const funcCall = message.metadata?.functionCall;
      if (funcCall && (funcCall.name === 'write_code' || funcCall.name === 'edit_code')) {
        const codeArg = (funcCall.arguments as Record<string, unknown>)?.code as string | undefined;
        if (typeof codeArg === 'string' && codeArg.trim().length > 0) {
          return codeArg;
        }
      }
    }
    return undefined;
  }, []);

  // Load saved editor width on startup
  useEffect(() => {
    const savedWidth = localStorage.getItem('cad-editor-width');
    if (savedWidth) {
      const width = parseInt(savedWidth, 10);
      if (width >= 320 && width <= 800) {
        setEditorWidth(width);
      }
    }
  }, []);

  // Save editor width when it changes
  const handleEditorResize = useCallback((width: number) => {
    setEditorWidth(width);
    localStorage.setItem('cad-editor-width', width.toString());
  }, []);

  // Load API key, model, and last conversation on startup
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedApiKey = await conversationStore.getApiKey();
        const savedModel = await conversationStore.getModel();
        
        if (savedApiKey) {
          setApiKey(savedApiKey);
        }
        setModel(savedModel);

        // Load the last conversation and its code
        const conversations = await conversationStore.getAllConversations();
        const latestConversation = conversations[conversations.length - 1];
        
        if (latestConversation) {
          console.log('🔄 Loading latest conversation on startup:', latestConversation.id);
          setCurrentConversation(latestConversation);
          
          const foundCode = extractCodeFromConversation(latestConversation);
          
          if (foundCode) {
            console.log('📝 Found code from conversation, setting it:', foundCode.slice(0, 100) + '...');
            setCode(foundCode);
            currentCodeRef.current = foundCode;
          } else {
            console.log('📝 No code found in conversation, using default');
            setCode(DEFAULT_CODE);
            currentCodeRef.current = DEFAULT_CODE;
          }
        } else {
          console.log('📝 No conversations found, using default code');
          setCode(DEFAULT_CODE);
          currentCodeRef.current = DEFAULT_CODE;
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    loadSettings();
  }, [ extractCodeFromConversation ]);

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

  // Initialize settings on mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const savedApiKey = await conversationStore.getApiKey();
        const savedModel = await conversationStore.getModel();
        const activeConfig = await conversationStore.getActiveModelConfiguration();
        
        if (savedApiKey) {
          setApiKey(savedApiKey);
        }
        if (savedModel) {
          setModel(savedModel);
        }
        
        // Load current model name from active configuration
        if (activeConfig) {
          setCurrentModelName(activeConfig.name);
          setActiveModelId(activeConfig.id);
        } else {
          // Fallback to just the model string if no configuration exists
          setCurrentModelName(savedModel || 'google/gemini-2.0-flash-exp:free');
          setActiveModelId(null);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };
    
    loadSettings();
  }, []);

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

      // If code is empty, use the default code
      const codeToExecute = !codeToRun.trim() ? DEFAULT_CODE : codeToRun;

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
    if (isInitialized && !hasExecutedInitialCode.current) {
      executeCode(code);
      hasExecutedInitialCode.current = true;
    }
  }, [isInitialized, executeCode, code]);

  // Get the current code from the editor (ensures we have the latest version)
  const getCurrentCode = () => {
    return currentCodeRef.current;
  };

  // Run the current code from the editor
  const handleRunCode = async () => {
    const currentCode = getCurrentCode();
    
    // Save code version if versioning is enabled for this conversation
    if (currentConversation) {
      try {
        const isVersioningEnabled = await conversationStore.isVersioningEnabledForConversation(currentConversation.id);
        if (isVersioningEnabled) {
          await conversationStore.createCodeVersion({
            conversationId: currentConversation.id,
            code: currentCode,
            description: `Code run at ${new Date().toLocaleTimeString()}`,
            isAutoSaved: true,
          });
          console.log('📦 Code version saved for conversation:', currentConversation.id);
        }
      } catch (error) {
        console.error('Failed to save code version:', error);
        // Don't prevent code execution if versioning fails
      }
    }
    
    executeCode(currentCode);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        // Execute code when Cmd+Enter is pressed
        if (isInitialized) {
          handleRunCode();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInitialized, handleRunCode]);

  const handleAgentCodeChange = async (newCode: string): Promise<void> => {
    // This function will be called by the ChatInterface when the agent
    // provides new code. It updates the state and then executes.
    setCode(newCode);
    currentCodeRef.current = newCode;
    
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
    // Update the model name display as well
    const loadActiveModelName = async () => {
      try {
        const activeConfig = await conversationStore.getActiveModelConfiguration();
        if (activeConfig) {
          setCurrentModelName(activeConfig.name);
        } else {
          setCurrentModelName(newModel);
        }
      } catch (error) {
        console.error('Failed to load active model name:', error);
        setCurrentModelName(newModel);
      }
    };
    loadActiveModelName();
  };

  const handleProviderSettingsChange = (settings: {
    baseUrl: string;
    useToolCalling: boolean;
    sendScreenshots: boolean;
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
      currentCodeRef.current = DEFAULT_CODE;

      // Close chat history modal if open
      setShowChatHistory(false);

      // Preserve current chat view (panel or minimal)
      // No need to change chatState here

      toast.success('Started new chat');
    } catch (error) {
      console.error('Failed to create new chat:', error);
      toast.error('Failed to create new chat');
    } finally {
      setIsCreatingChat(false);
    }
  };

  const handleLoadConversation = (conversation: Conversation) => {
    console.log('🔄 Loading conversation:', conversation.id);
    setCurrentConversation(conversation);
    setShowChatHistory(false);
    
    const foundCode = extractCodeFromConversation(conversation);

    if (foundCode) {
      console.log('📝 Loading code from conversation:', foundCode.slice(0, 100) + '...');
      // Load the code snapshot from history
      setCode(foundCode);
      currentCodeRef.current = foundCode;
      // Execute the code to update the CAD viewer
      executeCode(foundCode);
    } else {
      console.log('📝 No code found in conversation, using default');
      // Conversation has no generated code yet – reset to default template
      setCode(DEFAULT_CODE);
      currentCodeRef.current = DEFAULT_CODE;
      // Execute the default code to show something in the viewer
      executeCode(DEFAULT_CODE);
    }
    
    // Preserve the current chat view (do not force switch)
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

  const handleDebugChat = () => {
    setShowDebugChat(true);
  };

  const handleVersionHistory = () => {
    setShowVersionHistory(true);
  };

  const handleVersionLoad = (code: string) => {
    setCode(code);
    currentCodeRef.current = code;
    executeCode(code);
    setShowVersionHistory(false);
  };

  const handleVersioningToggle = (enabled: boolean) => {
    console.log(`Version history ${enabled ? 'enabled' : 'disabled'} for conversation:`, currentConversation?.id);
  };

  const handleModelNameClick = () => {
    if (activeModelId) {
      setEditModelId(activeModelId);
      setShowSettings(true);
    }
  };

  const handleSettingsClose = () => {
    setShowSettings(false);
    setEditModelId(null);
  };

  return (
    <div className={styles.pageContainer}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <a 
            href="https://cxmpute.cloud" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.titleContainer}
          >
            <Image src="/6.png" alt="C3D Logo" className={styles.logo} width={10} height={10} />
            <h1 className={styles.title}>C3D CAD</h1>
          </a>
          {currentModelName && (
            <span 
              className={styles.modelName}
              onClick={handleModelNameClick}
              style={{ cursor: activeModelId ? 'pointer' : 'default' }}
              title={activeModelId ? 'Click to edit model settings' : undefined}
            >
              • {currentModelName}
            </span>
          )}
        </div>
        <p className={styles.subtitle}>An agentic, code-first CAD editor.</p>
      </header>

      <div className={styles.mainContent}>
        {/* Main Workspace */}
        <div className={styles.workspace}>
          {/* Left Panel - CAD Viewer */}
          <div className={`${styles.viewerPanel} ${chatState === 'panel' ? styles.withChatPanel : ''} ${codeState === 'visible' ? styles.withCodePanel : ''}`}>
            <CADViewer shapes={shapes} isMinimalView={chatState === 'minimal'} onDebugChat={handleDebugChat} />
          </div>

          {/* Middle Panel - Code Editor */}
          {codeState === 'visible' && (
            <>
              <div className={styles.editorPanel} style={{ width: `${editorWidth}px` }}>
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
                      <CodeEditor onCodeChange={setCode} codeRef={currentCodeRef} />
                    </SandpackLayout>
                  </SandpackProvider>
                </div>
              </div>
              <ResizableSplitter
                onResize={handleEditorResize}
                initialWidth={editorWidth}
                minWidth={320}
                maxWidth={800}
                orientation="vertical"
              />
            </>
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
              onRunCode={handleRunCode}
              onExportSTEP={handleExportSTEP}
              onOpenSettings={() => setShowSettings(true)}
              onNewChat={handleNewChat}
              onChatHistory={() => setShowChatHistory(true)}
              onVersionHistory={handleVersionHistory}
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
              onRunCode={handleRunCode}
              onExportSTEP={handleExportSTEP}
              onOpenSettings={() => setShowSettings(true)}
              onNewChat={handleNewChat}
              onChatHistory={() => setShowChatHistory(true)}
              onVersionHistory={handleVersionHistory}
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
        onClose={handleSettingsClose}
        onApiKeyChange={handleApiKeyChange}
        onModelChange={handleModelChange}
        onProviderSettingsChange={handleProviderSettingsChange}
        editModelId={editModelId || undefined}
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

      {/* Debug Chat Modal */}
      <DebugChatModal
        isOpen={showDebugChat}
        onClose={() => setShowDebugChat(false)}
        apiKey={apiKey}
        model={model}
      />

      {/* Version History Modal */}
      <VersionHistoryModal
        isOpen={showVersionHistory}
        onClose={() => setShowVersionHistory(false)}
        conversationId={currentConversation?.id || null}
        onLoadVersion={handleVersionLoad}
        onToggleVersioning={handleVersioningToggle}
        currentCode={getCurrentCode()}
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