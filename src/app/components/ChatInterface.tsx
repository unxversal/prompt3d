import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader, 
  Code,
  Edit3,
  Bell,
  Play,
  CheckSquare,
  Zap,
  X,
  Download,
  Settings,
  Plus,
  History,
  MessageCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../hooks/useTheme';
import { conversationStore } from '../lib/conversationStore';
import { AIAgent, applyCodeDiff } from '../lib/aiAgent';
import { Message, Conversation, FunctionCall, AIAgentState } from '../types/ai';
import styles from './ChatInterface.module.css';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatInterfaceProps {
  state: 'panel' | 'overlay' | 'replace' | 'minimal';
  currentCode: string;
  onAgentCodeChange: (code: string) => Promise<void>;
  apiKey: string | null;
  model: string;
  onApiKeyRequired: () => void;
  currentConversation?: Conversation | null; // Optional external conversation to load
  // Props for minimal view navigation buttons
  onRunCode?: () => void;
  onExportSTEP?: () => void;
  onOpenSettings?: () => void;
  onNewChat?: () => void;
  onChatHistory?: () => void;
  onToggleChat?: () => void;
  isExecuting?: boolean;
  canExport?: boolean;
}

export default function ChatInterface({ 
  state, 
  currentCode, 
  onAgentCodeChange,
  apiKey,
  model,
  onApiKeyRequired,
  currentConversation: externalConversation,
  onRunCode,
  onExportSTEP,
  onOpenSettings,
  onNewChat,
  onChatHistory,
  onToggleChat,
  isExecuting,
  canExport
}: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [agentState, setAgentState] = useState<AIAgentState>({
    isProcessing: false,
    isCollapsed: state !== 'replace',
    plan: undefined
  });
  const [agent, setAgent] = useState<AIAgent | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasInitializedConversation = useRef(false);
  const { theme } = useTheme();

  // Initialize AI agent when API key or model changes
  useEffect(() => {
    if (apiKey) {
      setAgent(new AIAgent(apiKey, model));
    } else {
      setAgent(null);
    }
  }, [apiKey, model]);

  const loadOrCreateConversation = useCallback(async () => {
    try {
      console.log('🔄 Loading or creating conversation...');
      const conversations = await conversationStore.getAllConversations();
      console.log('📚 Found conversations:', conversations.length);
      
      const latest = conversations[conversations.length - 1];
      
      if (latest) {
        console.log('📖 Loading latest conversation:', latest.id, 'with', latest.messages.length, 'messages');
        setCurrentConversation(latest);
      } else {
        console.log('🆕 Creating new conversation with greeting...');
        const newConversation: Conversation = {
          id: generateId(),
          title: 'New CAD Session',
          messages: [{
            id: generateId(),
            role: 'assistant',
            content: "Hi! I'm C3D, your intelligent CAD assistant. I can help you create and modify 3D models using Replicad. Describe what you'd like to build and I'll generate the code for you.",
            timestamp: new Date(),
          }],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await conversationStore.saveConversation(newConversation);
        setCurrentConversation(newConversation);
        console.log('✅ Created new conversation:', newConversation.id);
      }
    } catch (error) {
      console.error('❌ Failed to load conversation:', error);
      toast.error('Failed to load conversation history');
    }
  }, []);

  // Load or create conversation
  useEffect(() => {
    console.log('🔄 Conversation effect triggered:', { 
      hasExternalConversation: !!externalConversation, 
      currentConversationId: currentConversation?.id,
      externalConversationId: externalConversation?.id,
      hasInitialized: hasInitializedConversation.current
    });
    
    if (externalConversation && (!currentConversation || currentConversation.id !== externalConversation.id)) {
      console.log('📝 Setting external conversation:', externalConversation.id);
      setCurrentConversation(externalConversation);
      hasInitializedConversation.current = true;
    } else if (!externalConversation && !currentConversation && !hasInitializedConversation.current) {
      console.log('🆕 Loading or creating new conversation');
      hasInitializedConversation.current = true;
      loadOrCreateConversation();
    }
  }, [externalConversation, currentConversation, loadOrCreateConversation ]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  // Update collapsed state when chat state changes
  useEffect(() => {
    setAgentState(prev => ({ ...prev, isCollapsed: state !== 'replace' }));
  }, [state]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || agentState.isProcessing) return;

    // Check if API key is set
    if (!apiKey || !agent) {
      onApiKeyRequired();
      toast.error('Please set your OpenRouter API key to continue', {
        description: 'API key is required for AI assistance'
      });
      return;
    }

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: message.trim(),
      timestamp: new Date(),
    };

    // Add user message to conversation
    if (currentConversation) {
      const updatedConversation = {
        ...currentConversation,
        messages: [...currentConversation.messages, userMessage],
        updatedAt: new Date(),
      };
      setCurrentConversation(updatedConversation);
      await conversationStore.saveConversation(updatedConversation);
    }

    setMessage('');
    setAgentState(prev => ({ ...prev, isProcessing: true }));

    // Create abort controller for cancellation
    const controller = new AbortController();
    setAbortController(controller);

    try {
      // Process the user message with the AI agent
      await agent.processUserMessage(
        {
          userPrompt: userMessage.content,
          currentCode,
          screenshots: [], // Screenshots are captured internally now
          conversationHistory: currentConversation?.messages.slice(-10) || [] // Last 10 messages for context
        },
        handleFunctionCall,
        controller.signal
      );
    } catch (error) {
      if (controller.signal.aborted) {
        console.log('🛑 AI processing cancelled by user');
        await addMessageToConversation({
          id: generateId(),
          role: 'assistant',
          content: 'Task cancelled by user.',
          timestamp: new Date(),
          metadata: { status: 'error' }
        });
        return;
      }

      console.error('AI processing error:', error);
      // Additional logging to surface the error message for debugging purposes
      if (error instanceof Error) {
        console.log('🔍 AI error message:', error.message);
      } else {
        console.log('🔍 AI error (non-Error type):', error);
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (agentState.isCollapsed) {
        toast.error(`AI Error: ${errorMessage}`);
      }
      
      // Add error message to conversation
      await addMessageToConversation({
        id: generateId(),
        role: 'assistant',
        content: `I encountered an error: ${errorMessage}. Please try again or check your API key.`,
        timestamp: new Date(),
        metadata: { status: 'error' }
      });
    } finally {
      setAgentState(prev => ({ ...prev, isProcessing: false, currentFunction: undefined }));
      setAbortController(null);
    }
  };

  const handleCancelConversation = () => {
    console.log('🛑 Cancelling conversation...');
    if (abortController) {
      abortController.abort();
    }
    setAgentState(prev => ({ ...prev, isProcessing: false, currentFunction: undefined }));
    setAbortController(null);
    toast.info('Conversation cancelled');
  };

  // Handle Enter key for message sending
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleFunctionCall = async (call: FunctionCall): Promise<unknown> => {
    setAgentState(prev => ({ ...prev, currentFunction: call.name }));

    try {
      switch (call.name) {
        case 'notify_user':
          return await handleNotifyUser(call);
          
        case 'write_code':
          return await handleWriteCode(call);
          
        case 'edit_code':
          return await handleEditCode(call);
          
        case 'idle':
          return await handleIdle(call);
          
        default:
          throw new Error(`Unknown function: ${call.name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Function execution failed';
      throw new Error(errorMessage);
    }
  };

    const handleNotifyUser = async (call: FunctionCall): Promise<string> => {
    console.log('🔔 handleNotifyUser called:', call);
    const { message: msg, type = 'info' } = call.arguments as {
      message: string;
      type?: 'info' | 'warning' | 'error' | 'success';
    };

    if (agentState.isCollapsed) {
      // Generate short message for toast in collapsed mode
      const shortMessage = msg.length > 60 ? msg.substring(0, 57) + '...' : msg;
      
      switch (type) {
        case 'success':
          toast.success(shortMessage, { description: 'C3D Assistant' });
          break;
        case 'warning':
          toast.warning(shortMessage, { description: 'C3D Assistant' });
          break;
        case 'error':
          toast.error(shortMessage, { description: 'C3D Assistant' });
          break;
        default:
          toast.info(shortMessage, { description: 'C3D Assistant' });
      }
    }

    // Always add to conversation for full mode
    await addMessageToConversation({
      id: generateId(),
      role: 'assistant',
      content: msg,
      timestamp: new Date(),
      metadata: { status: type === 'info' || type === 'warning' || type === 'success' ? 'completed' : type }
    });

    console.log('✅ handleNotifyUser completed');
    return 'Message sent to user';
  };

  const handleWriteCode = async (call: FunctionCall): Promise<string> => {
    const { code } = call.arguments as { code: string };

    if (typeof code !== 'string') {
      throw new Error('Invalid arguments: `code` must be a string.');
    }

    try {
      await onAgentCodeChange(code);
      
      const successMessage = 'New code has been written and executed successfully.';
      
      await addMessageToConversation({
        id: generateId(),
        role: 'assistant',
        content: successMessage,
        timestamp: new Date(),
        metadata: {
          status: 'completed',
          functionCall: call
        }
      });
      
      return successMessage;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during execution';
      await addMessageToConversation({
        id: generateId(),
        role: 'assistant',
        content: `Code execution failed: ${errorMessage}`,
        timestamp: new Date(),
        metadata: {
          status: 'error',
          functionCall: call
        }
      });
      // Re-throw to be caught by the main processing loop and sent to the LLM
      throw new Error(`Execution failed: ${errorMessage}`);
    }
  };

  const handleEditCode = async (call: FunctionCall): Promise<string> => {
    const { old_code, new_code } = call.arguments as { old_code: string; new_code: string };

    if (typeof old_code !== 'string' || typeof new_code !== 'string') {
      throw new Error('Invalid arguments: `old_code` and `new_code` must be strings.');
    }

    try {
      const updatedCode = applyCodeDiff(currentCode, old_code, new_code);
      await onAgentCodeChange(updatedCode);

      const successMessage = 'Code has been edited and executed successfully.';
      
      // Include the resulting code in the function call arguments so that
      // conversation history contains a snapshot of the full code.
      const enrichedCall: FunctionCall = {
        ...call,
        arguments: {
          ...call.arguments,
          code: updatedCode
        }
      };
      
      await addMessageToConversation({
        id: generateId(),
        role: 'assistant',
        content: successMessage,
        timestamp: new Date(),
        metadata: {
          status: 'completed',
          functionCall: enrichedCall
        }
      });
      
      return successMessage;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error during execution or diff application';
      await addMessageToConversation({
        id: generateId(),
        role: 'assistant',
        content: `Code edit failed: ${errorMessage}`,
        timestamp: new Date(),
        metadata: {
          status: 'error',
          functionCall: call
        }
      });
      // Re-throw to be caught by the main processing loop and sent to the LLM
      throw new Error(`Edit failed: ${errorMessage}`);
    }
  };

  const handleIdle = async (call: FunctionCall): Promise<string> => {
    console.log('💤 handleIdle called:', call);
    const { summary, message: msg } = call.arguments as {
      summary: string;
      message: string;
    };

    // Clear current function
    setAgentState(prev => ({ ...prev, currentFunction: undefined }));

    // Notification for collapsed mode
    if (agentState.isCollapsed) {
      toast.success('Task completed', {
        description: summary,
        icon: <CheckCircle size={16} />
      });
    }

    // Add completion message to conversation
    await addMessageToConversation({
      id: generateId(),
      role: 'assistant',
      content: `✅ **Task Completed**\n\n**Summary:** ${summary}\n\n${msg}`,
      timestamp: new Date(),
      metadata: { 
        status: 'completed' as const,
        summary,
        functionCall: call
      }
    });

    console.log('✅ handleIdle completed');
    return 'Task completed successfully';
  };

  const addMessageToConversation = async (message: Message): Promise<void> => {
    setCurrentConversation(prev => {
      if (!prev) return prev;

      const updated = {
        ...prev,
        messages: [...prev.messages, message],
        updatedAt: new Date(),
      };

      // Persist asynchronously (not awaiting inside setState)
      conversationStore.saveConversation(updated);

      return updated;
    });
  };

  const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9);
  };

  const FunctionCallDisplay: React.FC<{ 
    functionCall: FunctionCall;
    status?: 'pending' | 'completed' | 'error';
  }> = ({ functionCall, status = 'completed' }) => {
    const getFunctionConfig = (name: string) => {
      switch (name) {
        case 'write_code':
          return {
            icon: <Code size={16} />,
            title: 'Code Generated',
            color: '#3b82f6',
            bgColor: 'rgba(59, 130, 246, 0.15)',
            borderColor: 'rgba(59, 130, 246, 0.3)'
          };
        case 'edit_code':
          return {
            icon: <Edit3 size={16} />,
            title: 'Code Edited',
            color: '#3b82f6',
            bgColor: 'rgba(59, 130, 246, 0.15)',
            borderColor: 'rgba(59, 130, 246, 0.3)'
          };
        case 'send_plan':
          return {
            icon: <Zap size={16} />,
            title: 'Planning',
            color: '#f59e0b',
            bgColor: 'rgba(245, 158, 11, 0.1)',
            borderColor: 'rgba(245, 158, 11, 0.3)'
          };
        case 'notify_user':
          return {
            icon: <Bell size={16} />,
            title: 'Notification',
            color: '#6b7280',
            bgColor: 'rgba(107, 114, 128, 0.1)',
            borderColor: 'rgba(107, 114, 128, 0.3)'
          };
        case 'idle':
          return {
            icon: <CheckSquare size={16} />,
            title: 'Task Completed',
            color: '#059669',
            bgColor: 'rgba(5, 150, 105, 0.15)',
            borderColor: 'rgba(5, 150, 105, 0.3)'
          };
        default:
          return {
            icon: <Zap size={16} />,
            title: 'Function Call',
            color: '#6b7280',
            bgColor: 'rgba(107, 114, 128, 0.1)',
            borderColor: 'rgba(107, 114, 128, 0.3)'
          };
      }
    };

    const config = getFunctionConfig(functionCall.name);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const args: any = functionCall.arguments || {};
    const statusIcon = status === 'pending' ? 
      <Loader size={14} className={styles.spinning} /> :
      status === 'error' ? 
      <AlertCircle size={14} style={{ color: '#ef4444' }} /> :
      <CheckCircle size={14} style={{ color: config.color }} />;

    return (
      <div 
        className={styles.functionCallDisplay}
        style={{
          backgroundColor: config.bgColor,
          borderColor: config.borderColor,
          borderLeftColor: config.color
        }}
      >
        <div className={styles.functionHeader}>
          <div className={styles.functionInfo}>
            <div 
              className={styles.functionIcon}
              style={{ color: config.color }}
            >
              {config.icon}
            </div>
            <span className={styles.functionTitle}>{config.title}</span>
          </div>
          <div className={styles.functionStatus}>
            {statusIcon}
          </div>
        </div>
        
                {/* Show function arguments if available */}
        {Object.keys(args).length > 0 && (
          <div className={styles.functionArgs}>
            {args.message && (
              <div className={styles.notificationContent}>
                <div className={styles.markdown}>
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      a: ({...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />
                    }}
                  >
                    {String(args.message)}
                  </ReactMarkdown>
                </div>
              </div>
            )}
            
            {args.explanation && (
              <div className={styles.codeInfo}>
                <div className={styles.codeExplanation}>
                  <Play size={14} style={{ color: config.color }} />
                  <span>{String(args.explanation)}</span>
                </div>
              </div>
            )}
            
            {args.summary && (
              <div className={styles.taskSummary}>
                <div className={styles.summaryContent}>
                  <CheckSquare size={14} style={{ color: config.color }} />
                  <span>{String(args.summary)}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={14} className={styles.statusIcon} style={{ color: '#22c55e' }} />;
      case 'error':
        return <AlertCircle size={14} className={styles.statusIcon} style={{ color: '#ef4444' }} />;
      case 'pending':
        return <Clock size={14} className={styles.statusIcon} style={{ color: '#f59e0b' }} />;
      default:
        return null;
    }
  };

  const getFunctionIcon = (functionName?: string) => {
    switch (functionName) {
      case 'write_code':
        return <Code size={14} className={styles.functionIcon} />;
      case 'edit_code':
        return <Edit3 size={14} className={styles.functionIcon} />;
      case 'notify_user':
        return <Bell size={14} className={styles.functionIcon} />;
      case 'idle':
        return <CheckCircle size={14} className={styles.functionIcon} />;
      default:
        return null;
    }
  };

  const renderMessage = (msg: Message) => (
    <div key={msg.id} className={`${styles.message} ${styles[msg.role]}`}>
      
      {/* Show function call display if present */}
      {msg.metadata?.functionCall && (
        <FunctionCallDisplay 
          functionCall={msg.metadata.functionCall} 
          status={msg.metadata.status}
        />
      )}
      
      <div className={styles.messageContent}>
        <div className={styles.markdown}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              a: ({...props}) => <a {...props} target="_blank" rel="noopener noreferrer" />
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>
        <div className={styles.messageInfo}>
            <span className={styles.messageTimestamp}>
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {msg.metadata?.functionCall && getFunctionIcon(msg.metadata.functionCall.name)}
            {getStatusIcon(msg.metadata?.status)}
        </div>
      </div>
      

    </div>
  );

  // Render based on chat state
  if (state === 'overlay') {
    return (
      <div className={`${styles.chatOverlay} ${styles[theme]}`}>
        <form onSubmit={handleSubmit} className={styles.chatForm}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ask C3D to create or modify your CAD design..."
            className={styles.chatTextarea}
            rows={7}
            disabled={agentState.isProcessing}
            onKeyDown={handleKeyDown}
          />
          <button 
            type={agentState.isProcessing ? "button" : "submit"}
            className={`${styles.chatSubmit} ${agentState.isProcessing ? styles.processingButton : ''}`}
            disabled={!message.trim()}
            onClick={agentState.isProcessing ? handleCancelConversation : undefined}
            title={agentState.isProcessing ? "Cancel conversation" : "Send message"}
          >
            {agentState.isProcessing ? <X size={16} /> : <Send size={16} />}
          </button>
        </form>
        {agentState.currentFunction && (
          <div className={styles.functionStatus}>
            <Loader size={12} className={styles.spinning} />
            {agentState.currentFunction === 'write_code' ? 'C3D is writing code...' :
             agentState.currentFunction === 'edit_code' ? 'C3D is editing code...' :
             agentState.currentFunction === 'notify_user' ? 'C3D is responding...' :
             agentState.currentFunction === 'idle' ? 'C3D is finishing up...' :
             `Executing: ${agentState.currentFunction}`}
          </div>
        )}
      </div>
    );
  }

  // console.log('💬 Rendering messages:', { 
  //   messageCount: currentConversation?.messages?.length || 0,
  //   conversationId: currentConversation?.id,
  //   state 
  // });

  const messagesContent = (
    <div className={styles.chatMessages}>
      {currentConversation?.messages.map(renderMessage)}
      <div ref={messagesEndRef} />
    </div>
  );

  const inputForm = (
    <form onSubmit={handleSubmit} className={styles.chatInputForm}>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask C3D to create or modify your CAD design..."
        className={styles.chatInput}
        rows={7}
        disabled={agentState.isProcessing}
        onKeyDown={handleKeyDown}
      />
      <button 
        type={agentState.isProcessing ? "button" : "submit"}
        className={`${styles.chatSubmitButton} ${agentState.isProcessing ? styles.processingButton : ''}`}
        disabled={!message.trim()}
        onClick={agentState.isProcessing ? handleCancelConversation : undefined}
        title={agentState.isProcessing ? "Cancel conversation" : "Send message"}
      >
        {agentState.isProcessing ? <X size={16} /> : <Send size={16} />}
      </button>
              {agentState.currentFunction && (
          <div className={styles.functionStatusInline}>
            <Loader size={12} className={styles.spinning} />
            {agentState.currentFunction === 'write_code' ? 'C3D is writing code...' :
             agentState.currentFunction === 'edit_code' ? 'C3D is editing code...' :
             agentState.currentFunction === 'notify_user' ? 'C3D is responding...' :
             agentState.currentFunction === 'idle' ? 'C3D is finishing up...' :
             `Executing: ${agentState.currentFunction}`}
          </div>
        )}
    </form>
  );

  if (state === 'replace') {
    return (
      <div className={`${styles.chatReplace} ${styles[theme]}`}>
        {messagesContent}
        {inputForm}
      </div>
    );
  }

  // Minimal state - centered input box with navigation buttons
  if (state === 'minimal') {
    return (
      <div className={`${styles.chatMinimal} ${styles[theme]}`}>
        <form onSubmit={handleSubmit} className={styles.minimalForm}>
          <div className={styles.minimalNavigation}>
            <button
              type="button"
              className={styles.navButton}
              onClick={onRunCode}
              disabled={isExecuting}
              title={isExecuting ? 'Running...' : 'Run code'}
            >
              <Play size={16} />
            </button>
            <button
              type="button"
              className={styles.navButton}
              onClick={onExportSTEP}
              disabled={!canExport}
              title="Export STEP"
            >
              <Download size={16} />
            </button>
            <button
              type="button"
              className={styles.navButton}
              onClick={onOpenSettings}
              title="Settings"
            >
              <Settings size={16} />
            </button>
            <button
              type="button"
              className={styles.navButton}
              onClick={onNewChat}
              title="New Chat"
            >
              <Plus size={16} />
            </button>
            <button
              type="button"
              className={styles.navButton}
              onClick={onChatHistory}
              title="Chat History"
            >
              <History size={16} />
            </button>
            <button
              type="button"
              className={styles.navButton}
              onClick={onToggleChat}
              title="Toggle Chat View"
            >
              <MessageCircle size={16} />
            </button>
          </div>
          <div className={styles.minimalInputContainer}>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask C3D to create or modify your CAD design..."
              className={styles.minimalInput}
              rows={5}
              disabled={agentState.isProcessing}
              onKeyDown={handleKeyDown}
            />
            <button 
              type={agentState.isProcessing ? "button" : "submit"}
              className={`${styles.minimalSubmit} ${agentState.isProcessing ? styles.processingButton : ''}`}
              disabled={!message.trim()}
              onClick={agentState.isProcessing ? handleCancelConversation : undefined}
              title={agentState.isProcessing ? "Cancel conversation" : "Send message"}
            >
              {agentState.isProcessing ? <X size={16} /> : <Send size={16} />}
            </button>
          </div>
          {agentState.currentFunction && (
            <div className={styles.minimalFunctionStatus}>
              <Loader size={12} className={styles.spinning} />
              {agentState.currentFunction === 'write_code' ? 'C3D is writing code...' :
               agentState.currentFunction === 'edit_code' ? 'C3D is editing code...' :
               agentState.currentFunction === 'notify_user' ? 'C3D is responding...' :
               agentState.currentFunction === 'idle' ? 'C3D is finishing up...' :
               `Executing: ${agentState.currentFunction}`}
            </div>
          )}
        </form>
      </div>
    );
  }

  // Panel state
  return (
    <div className={`${styles.chatPanel} ${styles[theme]}`}>
      {messagesContent}
      {inputForm}
    </div>
  );
} 