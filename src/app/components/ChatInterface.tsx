import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  Code,
  Target,
  Edit3,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../hooks/useTheme';
import { conversationStore } from '../lib/conversationStore';
import { AIAgent, applyCodeDiff } from '../lib/aiAgent';
import { Message, Conversation, FunctionCall, AIAgentState } from '../types/ai';
import styles from './ChatInterface.module.css';

interface ChatInterfaceProps {
  state: 'panel' | 'overlay' | 'replace';
  currentCode: string;
  onCodeChange: (code: string) => void;
  apiKey: string | null;
  model: string;
  onApiKeyRequired: () => void;
  onCodeExecute?: () => void; // Added for code execution integration
}

export default function ChatInterface({ 
  state, 
  currentCode, 
  onCodeChange, 
  apiKey,
  model,
  onApiKeyRequired,
  onCodeExecute
}: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [agentState, setAgentState] = useState<AIAgentState>({
    isProcessing: false,
    isCollapsed: state !== 'replace',
    plan: undefined
  });
  const [agent, setAgent] = useState<AIAgent | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  // Initialize AI agent when API key or model changes
  useEffect(() => {
    if (apiKey) {
      setAgent(new AIAgent(apiKey, model));
    } else {
      setAgent(null);
    }
  }, [apiKey, model]);

  // Load or create conversation
  useEffect(() => {
    loadOrCreateConversation();
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);

  // Update collapsed state when chat state changes
  useEffect(() => {
    setAgentState(prev => ({ ...prev, isCollapsed: state !== 'replace' }));
  }, [state]);

  const loadOrCreateConversation = async () => {
    try {
      const conversations = await conversationStore.getAllConversations();
      const latest = conversations[conversations.length - 1];
      
      if (latest) {
        setCurrentConversation(latest);
      } else {
        const newConversation: Conversation = {
          id: generateId(),
          title: 'New CAD Session',
          messages: [{
            id: generateId(),
            role: 'assistant',
            content: "Hi! I'm C3D, your intelligent CAD assistant. I can help you create and modify 3D models using ReplicaD. Describe what you'd like to build and I'll analyze your request, create a plan, and generate the code for you.",
            timestamp: new Date(),
          }],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        await conversationStore.saveConversation(newConversation);
        setCurrentConversation(newConversation);
      }
    } catch (error) {
      console.error('Failed to load conversation:', error);
      toast.error('Failed to load conversation history');
    }
  };

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

    try {
      // Process the user message with the AI agent
      await agent.processUserMessage(
        {
          userPrompt: userMessage.content,
          currentCode,
          screenshots: [], // Screenshots are captured internally now
          conversationHistory: currentConversation?.messages.slice(-10) || [] // Last 10 messages for context
        },
        handleFunctionCall
      );
    } catch (error) {
      console.error('AI processing error:', error);
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
          
        case 'update_code':
          return await handleUpdateCode(call);
          
        case 'send_plan':
          return await handleSendPlan(call);
          
        case 'update_plan':
          return await handleUpdatePlan(call);
          
        case 'complete_task':
          return await handleCompleteTask(call);
          
        default:
          throw new Error(`Unknown function: ${call.name}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Function execution failed';
      throw new Error(errorMessage);
    }
  };

  const handleNotifyUser = async (call: FunctionCall): Promise<string> => {
    const { message: msg, type = 'info', isCollapsedMessage = false } = call.arguments as {
      message: string;
      type?: 'info' | 'warning' | 'error' | 'success';
      isCollapsedMessage?: boolean;
    };

    if (agentState.isCollapsed || isCollapsedMessage) {
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

    return 'Message sent to user';
  };

  const handleWriteCode = async (call: FunctionCall): Promise<string> => {
    const { code, explanation } = call.arguments as {
      code: string;
      explanation?: string;
    };

    // Update the code in the editor
    onCodeChange(code);
    
    // Execute the code automatically if handler is provided
    if (onCodeExecute) {
      setTimeout(() => {
        onCodeExecute();
      }, 100);
    }

    // Notification for collapsed mode
    if (agentState.isCollapsed) {
      toast.success('Code updated', {
        description: explanation || 'New code generated and applied',
        icon: <Code size={16} />
      });
    }

    // Add to conversation
    await addMessageToConversation({
      id: generateId(),
      role: 'assistant',
      content: `✅ **Code Updated**\n\n${explanation || 'I\'ve generated new code for your model.'}\n\n\`\`\`typescript\n${code.slice(0, 200)}${code.length > 200 ? '...' : ''}\n\`\`\``,
      timestamp: new Date(),
      metadata: { 
        status: 'completed' as const,
        functionCall: call
      }
    });

    return 'Code updated successfully';
  };

  const handleUpdateCode = async (call: FunctionCall): Promise<string> => {
    const { oldCode, newCode, explanation } = call.arguments as {
      oldCode: string;
      newCode: string;
      explanation?: string;
    };

    try {
      const updatedCode = applyCodeDiff(currentCode, oldCode, newCode);
      onCodeChange(updatedCode);
      
      // Execute the code automatically if handler is provided
      if (onCodeExecute) {
        setTimeout(() => {
          onCodeExecute();
        }, 100);
      }

      // Notification for collapsed mode
      if (agentState.isCollapsed) {
        toast.success('Code updated', {
          description: explanation || 'Code modifications applied',
          icon: <Edit3 size={16} />
        });
      }

      // Add to conversation
      await addMessageToConversation({
        id: generateId(),
        role: 'assistant',
        content: `🔧 **Code Modified**\n\n${explanation || 'I\'ve updated your code with targeted changes.'}\n\n**Changes:**\n\`\`\`diff\n- ${oldCode.slice(0, 100)}${oldCode.length > 100 ? '...' : ''}\n+ ${newCode.slice(0, 100)}${newCode.length > 100 ? '...' : ''}\n\`\`\``,
        timestamp: new Date(),
        metadata: { 
          status: 'completed' as const,
          functionCall: call
        }
      });

      return 'Code diff applied successfully';
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to apply code diff';
      
      if (agentState.isCollapsed) {
        toast.error('Code update failed', {
          description: errorMessage
        });
      }
      
      throw new Error(errorMessage);
    }
  };

  const handleSendPlan = async (call: FunctionCall): Promise<string> => {
    const { plan, steps } = call.arguments as {
      plan: string;
      steps?: string[];
    };

    // Update agent state with plan
    setAgentState(prev => ({ ...prev, plan }));

    // Notification for collapsed mode
    if (agentState.isCollapsed) {
      toast.info('Plan created', {
        description: 'AI has created a plan for your request',
        icon: <Target size={16} />
      });
    }

    // Format plan with steps
    let formattedPlan = `📋 **Implementation Plan**\n\n${plan}`;
    
    if (steps && steps.length > 0) {
      formattedPlan += '\n\n**Steps:**\n' + steps.map((step, index) => 
        `${index + 1}. ${step}`
      ).join('\n');
    }

    // Add to conversation
    await addMessageToConversation({
      id: generateId(),
      role: 'assistant',
      content: formattedPlan,
      timestamp: new Date(),
      metadata: { 
        status: 'completed' as const,
        plan,
        functionCall: call
      }
    });

    return 'Plan sent to user';
  };

  const handleUpdatePlan = async (call: FunctionCall): Promise<string> => {
    const { updatedPlan, reason } = call.arguments as {
      updatedPlan: string;
      reason: string;
    };

    // Update agent state with new plan
    setAgentState(prev => ({ ...prev, plan: updatedPlan }));

    // Notification for collapsed mode
    if (agentState.isCollapsed) {
      toast.info('Plan updated', {
        description: reason,
        icon: <RefreshCw size={16} />
      });
    }

    // Add to conversation
    await addMessageToConversation({
      id: generateId(),
      role: 'assistant',
      content: `🔄 **Plan Updated**\n\n**Reason:** ${reason}\n\n**Updated Plan:**\n${updatedPlan}`,
      timestamp: new Date(),
      metadata: { 
        status: 'completed' as const,
        plan: updatedPlan,
        functionCall: call
      }
    });

    return 'Plan updated successfully';
  };

  const handleCompleteTask = async (call: FunctionCall): Promise<string> => {
    const { summary, finalMessage } = call.arguments as {
      summary: string;
      finalMessage: string;
    };

    // Clear current plan and function
    setAgentState(prev => ({ ...prev, plan: undefined, currentFunction: undefined }));

    // Notification for collapsed mode
    if (agentState.isCollapsed) {
      toast.success('Task completed', {
        description: 'AI has finished working on your request',
        icon: <CheckCircle size={16} />
      });
    }

    // Add completion message to conversation
    await addMessageToConversation({
      id: generateId(),
      role: 'assistant',
      content: `✅ **Task Completed**\n\n**Summary:** ${summary}\n\n${finalMessage}`,
      timestamp: new Date(),
      metadata: { 
        status: 'completed' as const,
        summary,
        functionCall: call
      }
    });

    return 'Task completed successfully';
  };

  const addMessageToConversation = async (message: Message): Promise<void> => {
    if (!currentConversation) return;

    const updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, message],
      updatedAt: new Date(),
    };
    
    setCurrentConversation(updatedConversation);
    await conversationStore.saveConversation(updatedConversation);
  };

  const generateId = (): string => {
    return Math.random().toString(36).substr(2, 9);
  };

  const formatMessage = (content: string): string => {
    // Convert markdown-like formatting for better display
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>');
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
      case 'send_plan':
      case 'update_plan':
        return <Target size={14} className={styles.functionIcon} />;
      case 'write_code':
        return <Code size={14} className={styles.functionIcon} />;
      case 'update_code':
        return <Edit3 size={14} className={styles.functionIcon} />;
      case 'complete_task':
        return <CheckCircle size={14} className={styles.functionIcon} />;
      default:
        return null;
    }
  };

  const renderMessage = (msg: Message) => (
    <div key={msg.id} className={`${styles.message} ${styles[msg.role]}`}>
      
      {msg.metadata?.plan && (
        <div className={styles.planDisplay}>
          <div className={styles.planHeader}>
            <Target size={16} />
            <span>Current Plan</span>
          </div>
          <div className={styles.planContent}>
            {msg.metadata.plan}
          </div>
        </div>
      )}
      
      <div className={styles.messageContent}>
        <div dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }} />
        <div className={styles.messageInfo}>
            <span className={styles.messageTimestamp}>
              {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            {msg.metadata?.functionCall && getFunctionIcon(msg.metadata.functionCall.name)}
            {getStatusIcon(msg.metadata?.status)}
        </div>
      </div>
      
      {agentState.isProcessing && msg.id === currentConversation?.messages[currentConversation.messages.length - 1]?.id && (
        <div className={styles.processingIndicator}>
          <Loader2 className="animate-spin" size={14} />
          <span>
            {agentState.currentFunction ? `Executing ${agentState.currentFunction}...` : 'Processing...'}
          </span>
        </div>
      )}
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
            rows={8}
            disabled={agentState.isProcessing}
          />
          <button 
            type="submit" 
            className={styles.chatSubmit}
            disabled={!message.trim() || agentState.isProcessing}
          >
            {agentState.isProcessing ? <Loader2 size={16} className={styles.spinning} /> : <Send size={16} />}
          </button>
        </form>
        {agentState.currentFunction && (
          <div className={styles.functionStatus}>
            <Loader2 size={12} className={styles.spinning} />
            Executing: {agentState.currentFunction}
          </div>
        )}
      </div>
    );
  }

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
        rows={8}
        disabled={agentState.isProcessing}
      />
      <button 
        type="submit" 
        className={styles.chatSubmitButton}
        disabled={!message.trim() || agentState.isProcessing}
      >
        {agentState.isProcessing ? <Loader2 size={16} className={styles.spinning} /> : <Send size={16} />}
      </button>
      {agentState.currentFunction && (
        <div className={styles.functionStatusInline}>
          <Loader2 size={12} className={styles.spinning} />
          Executing: {agentState.currentFunction}
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

  // Panel state
  return (
    <div className={`${styles.chatPanel} ${styles[theme]}`}>
      {messagesContent}
      {inputForm}
    </div>
  );
} 