/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

// NOTE: This file contains the original implementation of the CAD page. It is imported dynamically from the server wrapper (page.tsx) with `ssr:false` so that Web Worker APIs are not evaluated during server-side rendering.

import React, { useState, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { SandpackProvider, SandpackLayout, SandpackCodeEditor, useSandpack } from '@codesandbox/sandpack-react';
import { amethyst } from '@codesandbox/sandpack-themes';
import { MessageCircle, Play, Command } from 'lucide-react';
import styles from './page.module.css';

// Components
import ChatInterface from './components/ChatInterface';
import SettingsPopover, { SettingsButton } from './components/SettingsPopover';
import { conversationStore } from './lib/conversationStore';

// Components
import ErrorDisplay from './components/ErrorDisplay';
import CADViewer from './components/CADViewer';

// Convert CADShape to WorkerShape format for compatibility
export interface WorkerShape {
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
export interface ReplicadShape {
  name: string;
  shape: any; // The actual replicad shape object
  color?: string;
  opacity?: number;
}

// Default example code showing replicad-threejs-helper usage
const DEFAULT_CODE = `// Migrated to replicad-threejs-helper - No CSP Issues!
// This code demonstrates the proper way to use replicad with Three.js

import { drawCircle, drawRoundedRectangle } from 'replicad';
import { syncGeometries } from 'replicad-threejs-helper';

// Example 1: Simple cylinder
const cylinder = drawCircle(20).sketchOnPlane().extrude(50);

// Example 2: Rounded rectangle
const roundedRect = drawRoundedRectangle(40, 30, 5)
  .sketchOnPlane()
  .extrude(10);

// Create meshed shapes for replicad-threejs-helper
const meshedShapes = [
  {
    name: 'Cylinder',
    faces: cylinder.mesh({ tolerance: 0.05, angularTolerance: 30 }),
    edges: cylinder.meshEdges({ keepMesh: true }),
  },
  {
    name: 'Rounded Rectangle',
    faces: roundedRect.mesh({ tolerance: 0.05, angularTolerance: 30 }),
    edges: roundedRect.meshEdges({ keepMesh: true }),
  }
];

// Use replicad-threejs-helper to convert to Three.js BufferGeometry
// This approach avoids CSP issues entirely
const geometries = syncGeometries(meshedShapes, []);

// Export for use in Three.js scene
export { geometries };`;



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
  const [error, setError] = useState<string | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [chatState, setChatState] = useState<'hidden' | 'panel' | 'overlay' | 'replace'>('hidden');
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [model, setModel] = useState<string>('google/gemini-2.0-flash-exp:free');
  const [showSettings, setShowSettings] = useState(false);

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
        setError(errorMessage);
        
        toast.error('Failed to load CAD engine', {
          id: toastId,
          description: errorMessage.slice(0, 80) + (errorMessage.length > 80 ? '...' : ''),
        });
      }
    };

    initializeOpenCascade();
  }, [isInitialized]);

  // Execute current code
  const executeCode = useCallback(async () => {
    if (isExecuting || !isInitialized) return;

    setIsExecuting(true);
    setError(null);
    const toastId = toast.loading('Generating shapes...', {
      description: 'Creating 3D models with C3D Engine.',
    });

    try {
      // For now, execute the default example (user code execution requires eval)
      // Import replicad and helper
      const replicad = await import('replicad');
      const { syncGeometries } = await import('replicad-threejs-helper');

      // Create shapes using replicad
      const cylinder = replicad.drawCircle(20).sketchOnPlane().extrude(50);
      const roundedRect = replicad.drawRoundedRectangle(40, 30, 5)
        .sketchOnPlane()
        .extrude(10);

      // Store original replicad shapes for export
      const originalShapes: ReplicadShape[] = [
        {
          name: 'Cylinder',
          shape: cylinder,
          color: '#667eea',
          opacity: 1
        },
        {
          name: 'Rounded Rectangle',
          shape: roundedRect,
          color: '#f093fb',
          opacity: 1
        }
      ];

      // Mesh the shapes
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
        }
      ];

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
      setReplicadShapes(originalShapes);  // Store original shapes for export
      toast.success('Shapes generated successfully!', {
        id: toastId,
        description: `Generated ${workerShapes.length} shapes.`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error('Generation failed', {
        id: toastId,
        description: errorMessage.slice(0, 80) + (errorMessage.length > 80 ? '...' : ''),
      });
    } finally {
      setIsExecuting(false);
    }
  }, [isExecuting, isInitialized]);

  // Auto-execute once after initialization
  useEffect(() => {
    if (isInitialized && shapes.length === 0) {
      executeCode();
    }
  }, [isInitialized, executeCode, shapes.length]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault();
        // Disable Cmd+Enter when chat replaces the editor
        if (isInitialized && chatState !== 'replace') {
          executeCode();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isInitialized, executeCode, chatState]);

  // Set up global function for AI agents
  useEffect(() => {
    window.setCADCode = (newCode: string) => {
      setCode(newCode);
      if (isInitialized) {
        executeCode();
      }
    };

    return () => {
      delete window.setCADCode;
    };
  }, [isInitialized, executeCode]);



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
    setChatState(prev => {
      if (prev === 'hidden') return 'panel';
      if (prev === 'panel') return 'overlay';
      if (prev === 'overlay') return 'replace';
      return 'hidden';
    });
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
        {/* Left Panel - 3D Viewer */}
        <div className={styles.leftPanel}>
          {error ? (
            <ErrorDisplay error={error} onClose={() => setError(null)} />
          ) : (
            <CADViewer shapes={shapes} />
          )}
        </div>

        {/* Middle Panel - Code Editor with Sandpack OR Chat Replace */}
        <div className={`${styles.rightPanel} ${chatState === 'panel' ? styles.withChatPanel : ''}`}>
          <div className={styles.editorHeader}>
            <div className={styles.editorHeaderLeft}>
              {chatState === 'replace' ? (
                <h3>AI Agent</h3>
              ) : (
                <>
                  <button
                    className={styles.runButton}
                    onClick={executeCode}
                    disabled={isExecuting}
                  >
                    <Play size={14} style={{ marginRight: '4px' }} />
                    {isExecuting ? 'Running...' : 'Run'}
                  </button>
                  <span className={styles.shortcutHint}>
                                          <span className={styles.commandKey}><Command size={12} /></span>
                    <span className={styles.plusKey}>+</span>
                    <span className={styles.enterKey}>Enter</span>
                  </span>
                </>
              )}
            </div>
            <div className={styles.editorHeaderRight}>
              <button
                className={styles.exportButton}
                onClick={handleExportSTEP}
                disabled={shapes.length === 0}
              >
                Export STEP
              </button>
              <SettingsButton onClick={() => setShowSettings(true)} />
              <button
                className={styles.aiButton}
                onClick={toggleChat}
                title={`AI Agent (${chatState})`}
              >
                <MessageCircle size={16} />
              </button>
            </div>
          </div>

          {/* Conditionally render chat replace or sandpack editor */}
          {chatState === 'replace' ? (
            <ChatInterface 
              state="replace" 
              currentCode={code}
              onCodeChange={setCode}
              apiKey={apiKey}
              model={model}
              onApiKeyRequired={handleApiKeyRequired}
              onCodeExecute={executeCode}
            />
          ) : (
            <div className={styles.sandpackContainer}>
              <SandpackProvider
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
          )}
          
          {/* Chat overlay - on top of code editor */}
          {chatState === 'overlay' && (
            <ChatInterface 
              state="overlay"
              currentCode={code}
              onCodeChange={setCode}
              apiKey={apiKey}
              model={model}
              onApiKeyRequired={handleApiKeyRequired}
              onCodeExecute={executeCode}
            />
          )}
        </div>

                  {/* Right Panel - Chat (when in panel mode) */}
        {chatState === 'panel' && (
          <ChatInterface 
            state="panel"
            currentCode={code}
            onCodeChange={setCode}
            apiKey={apiKey}
            model={model}
            onApiKeyRequired={handleApiKeyRequired}
            onCodeExecute={executeCode}
          />
        )}
      </div>

      {/* Settings Popover */}
      <SettingsPopover
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onApiKeyChange={handleApiKeyChange}
        onModelChange={handleModelChange}
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