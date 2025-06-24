import React, { useState, useEffect, useRef } from 'react';
import { Send, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
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
}

export default function ChatInterface({ 
  state, 
  currentCode, 
  onCodeChange, 
  apiKey,
  model,
  onApiKeyRequired 
}: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [agentState, setAgentState] = useState<AIAgentState>({
    isProcessing: false,
    isCollapsed: state !== 'replace'
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
          title: 'New Conversation',
          messages: [{
            id: generateId(),
            role: 'assistant',
            content: "Hi! I'm C3D, your AI CAD assistant. I can help you create and modify 3D models using ReplicaD. Describe what you'd like to build and I'll generate the code for you.",
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
      toast.error('Please set your OpenRouter API key to continue');
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
          screenshots: [], // TODO: Implement screenshot capture
          conversationHistory: currentConversation?.messages.slice(-10) || [] // Last 10 messages for context
        },
        handleFunctionCall
      );
    } catch (error) {
      console.error('AI processing error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`AI Error: ${errorMessage}`);
      
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

    if (agentState.isCollapsed && isCollapsedMessage) {
      // Show toast for collapsed mode
      switch (type) {
        case 'success':
          toast.success(msg);
          break;
        case 'warning':
          toast.warning(msg);
          break;
        case 'error':
          toast.error(msg);
          break;
        default:
          toast.info(msg);
      }
    } else {
      // Add to conversation
      await addMessageToConversation({
        id: generateId(),
        role: 'assistant',
        content: msg,
        timestamp: new Date(),
        metadata: { status: 'completed' }
      });
    }

    return 'Notification sent';
  };

  const handleWriteCode = async (call: FunctionCall): Promise<string> => {
    const { code, explanation } = call.arguments as {
      code: string;
      explanation?: string;
    };

    onCodeChange(code);
    
    const message = explanation 
      ? `I've updated the code. ${explanation}`
      : 'I\'ve updated the code with your requested changes.';
      
    await addMessageToConversation({
      id: generateId(),
      role: 'assistant',
      content: message,
      timestamp: new Date(),
      metadata: { 
        functionCall: call,
        status: 'completed'
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
      
      const message = explanation 
        ? `I've applied a code update. ${explanation}`
        : 'I\'ve applied the requested code changes.';
        
      await addMessageToConversation({
        id: generateId(),
        role: 'assistant',
        content: message,
        timestamp: new Date(),
        metadata: { 
          functionCall: call,
          status: 'completed'
        }
      });

      return 'Code diff applied successfully';
    } catch (error) {
      throw new Error(`Failed to apply code diff: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSendPlan = async (call: FunctionCall): Promise<string> => {
    const { plan, steps } = call.arguments as {
      plan: string;
      steps?: string[];
    };

    setAgentState(prev => ({ ...prev, plan }));

    let planMessage = `**Plan:** ${plan}`;
    if (steps && steps.length > 0) {
      planMessage += '\n\n**Steps:**\n' + steps.map((step, i) => `${i + 1}. ${step}`).join('\n');
    }

    await addMessageToConversation({
      id: generateId(),
      role: 'assistant',
      content: planMessage,
      timestamp: new Date(),
      metadata: { 
        plan,
        status: 'completed'
      }
    });

    return 'Plan sent to user';
  };

  const handleUpdatePlan = async (call: FunctionCall): Promise<string> => {
    const { updatedPlan, reason } = call.arguments as {
      updatedPlan: string;
      reason: string;
    };

    setAgentState(prev => ({ ...prev, plan: updatedPlan }));

    await addMessageToConversation({
      id: generateId(),
      role: 'assistant',
      content: `**Plan Update:** ${updatedPlan}\n\n**Reason:** ${reason}`,
      timestamp: new Date(),
      metadata: { 
        plan: updatedPlan,
        status: 'completed'
      }
    });

    return 'Plan updated';
  };

  const handleCompleteTask = async (call: FunctionCall): Promise<string> => {
    const { summary, finalMessage } = call.arguments as {
      summary: string;
      finalMessage: string;
    };

    await addMessageToConversation({
      id: generateId(),
      role: 'assistant',
      content: finalMessage,
      timestamp: new Date(),
      metadata: { 
        summary,
        status: 'completed'
      }
    });

    setAgentState(prev => ({ ...prev, plan: undefined }));
    return 'Task completed';
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
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br/>');
  };

  const renderMessage = (msg: Message) => (
    <div key={msg.id} className={`${styles.message} ${styles[msg.role]}`}>
      <div 
        className={styles.messageContent}
        dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
        title={msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      />
      {msg.metadata?.status && (
        <div className={`${styles.messageStatus} ${styles[msg.metadata.status]}`}>
          {msg.metadata.status === 'pending' && <Clock size={12} />}
          {msg.metadata.status === 'completed' && <CheckCircle size={12} />}
          {msg.metadata.status === 'error' && <AlertCircle size={12} />}
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
        rows={3}
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