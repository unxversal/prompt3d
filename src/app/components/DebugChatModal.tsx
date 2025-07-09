'use client';

import React, { useState, useRef, useEffect } from 'react';
import { X, Send, MessageCircle, Loader2, Code, Edit3, Bell, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { conversationStore } from '../lib/conversationStore';
import styles from './DebugChatModal.module.css';

interface TestJsonResponse {
  message: string;
  success: boolean;
}

interface DebugMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasScreenshot?: boolean;
}

interface DebugChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string | null;
  model: string;
}

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

// Test function for tool calling
const TEST_FUNCTION = {
  type: 'function',
  function: {
    name: 'send_test_response',
    description: 'Send a test response to verify tool calling is working',
    parameters: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          description: 'The response message to send'
        },
        success: {
          type: 'boolean',
          description: 'Whether the test was successful'
        }
      },
      required: ['message', 'success']
    }
  }
};

// JSON schema for structured output testing
const JSON_SCHEMA = {
  name: 'test_response',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      message: {
        type: 'string',
        description: 'The response message to send'
      },
      success: {
        type: 'boolean',
        description: 'Whether the test was successful'
      }
    },
    required: ['message', 'success'],
    additionalProperties: false
  }
};

type TestMode = 'normal' | 'tool_calling' | 'json' | 'vision';

// Function to extract thinking and clean content from Ollama responses
const extractThinkingFromContent = (content: string): { thinking: string | null; cleanContent: string } => {
  const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
  if (!thinkMatch) {
    return { thinking: null, cleanContent: content };
  }
  
  const thinking = thinkMatch[1].trim();
  const cleanContent = content.replace(/<think>[\s\S]*?<\/think>/, '').trim();
  
  return { thinking, cleanContent };
};

// Function to extract JSON from various formats (markdown code blocks, plain text, etc.)
const extractJsonFromContent = (content: string): TestJsonResponse | null => {
  // First try to parse as direct JSON
  try {
    return JSON.parse(content) as TestJsonResponse;
  } catch {
    // If that fails, try to extract JSON from markdown code blocks
    const jsonBlockMatch = content.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/i);
    if (jsonBlockMatch) {
      try {
        return JSON.parse(jsonBlockMatch[1].trim()) as TestJsonResponse;
      } catch {
        // Continue to next attempt
      }
    }
    
    // Try to find JSON object in the content using regex
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]) as TestJsonResponse;
      } catch {
        // Continue to next attempt
      }
    }
    
    // Last resort: try to extract anything that looks like JSON
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('{') && trimmedLine.endsWith('}')) {
        try {
          return JSON.parse(trimmedLine) as TestJsonResponse;
        } catch {
          // Continue to next line
        }
      }
    }
    
    return null;
  }
};

export default function DebugChatModal({ isOpen, onClose, apiKey, model }: DebugChatModalProps) {
  const [messages, setMessages] = useState<DebugMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testMode, setTestMode] = useState<TestMode>('normal');
  const [streamingEnabled, setStreamingEnabled] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;
    
    if (!apiKey) {
      toast.error('API key not set. Please configure in settings.');
      return;
    }

    const userMessage: DebugMessage = {
      id: Math.random().toString(36).substring(2, 9),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date(),
      hasScreenshot: testMode === 'vision',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Get provider settings
      const providerSettings = await conversationStore.getProviderSettings();
      
      // Capture screenshot if in vision mode
      let screenshot: string | null = null;
      if (testMode === 'vision') {
        screenshot = await captureScreenshot();
        if (!screenshot) {
          return; // captureScreenshot already shows error toast
        }
      }
      
      // Build message history for the API
      let apiMessages;
      
      if (testMode === 'vision' && screenshot) {
        // For vision mode, only include the current message with screenshot
        // and remove any old screenshots from history to keep it clean
        const textOnlyMessages = messages
          .filter(msg => !Array.isArray(msg.content))
          .map(msg => ({
            role: msg.role,
            content: msg.content,
          }));
        
        apiMessages = [
          ...textOnlyMessages,
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: userMessage.content,
              },
              {
                type: 'image_url',
                image_url: {
                  url: screenshot
                }
              }
            ]
          }
        ];
      } else {
        apiMessages = [...messages, userMessage].map(msg => ({
          role: msg.role,
          content: msg.content,
        }));
      }

      let systemMessage = 'You are a helpful AI assistant. Respond concisely and helpfully to user questions.';
      
      if (testMode === 'tool_calling') {
        systemMessage = 'You are a helpful AI assistant. You MUST use the send_test_response function to respond to all user messages. Do not respond with regular text.';
      } else if (testMode === 'json') {
        systemMessage = 'You are a helpful AI assistant. You MUST respond with a JSON object containing "message" (string) and "success" (boolean) fields. Do not respond with regular text.';
      } else if (testMode === 'vision') {
        systemMessage = 'You are a helpful AI assistant with vision capabilities. You can see and analyze 3D models/scenes. Describe what you see in the image and respond helpfully to user questions about it.';
      }

      const requestBody: Record<string, unknown> = {
        apiKey,
        model,
        messages: [
          {
            role: 'system',
            content: systemMessage,
          },
          ...apiMessages,
        ],
        baseUrl: providerSettings.baseUrl,
        useToolCalling: testMode === 'tool_calling' ? true : providerSettings.useToolCalling,
        temperature: 0.7,
        max_tokens: 10000,
      };

      // Add tools if test tool calling is enabled
      if (testMode === 'tool_calling') {
        requestBody.tools = [TEST_FUNCTION];
        requestBody.tool_choice = 'required';
      }

      // Add JSON schema if test JSON mode is enabled
      if (testMode === 'json') {
        requestBody.response_format = {
          type: 'json_schema',
          json_schema: JSON_SCHEMA,
        };
      }

      // Add streaming support for non-tool-calling modes
      if (streamingEnabled && testMode !== 'tool_calling') {
        requestBody.stream = true;
      }

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error || `API request failed: ${response.status}`);
      }

      // Handle streaming response
      if (streamingEnabled && testMode !== 'tool_calling') {
        const reader = response.body?.getReader();
        const decoder = new TextDecoder();
        
        if (!reader) {
          throw new Error('No response body for streaming');
        }

        let buffer = '';
        let currentResponse = '';
        
        // Create initial assistant message for streaming
        const streamingMessageId = Math.random().toString(36).substring(2, 9);
        const streamingMessage: DebugMessage = {
          id: streamingMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, streamingMessage]);
        
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            buffer += decoder.decode(value, { stream: true });
            
            // Process complete lines
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            
            for (const line of lines) {
              if (line.trim() === '') continue;
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  break;
                }
                
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content || '';
                  if (content) {
                    currentResponse += content;
                    
                    // Update the streaming message in real-time
                    setMessages(prev => prev.map(msg => 
                      msg.id === streamingMessageId 
                        ? { ...msg, content: currentResponse }
                        : msg
                    ));
                  }
                } catch (error) {
                  console.warn('Failed to parse streaming response:', error);
                }
              }
            }
          }
          
          // Process final response for JSON mode
          if (testMode === 'json' && currentResponse.trim()) {
            try {
              const jsonResponse = extractJsonFromContent(currentResponse);
              
              if (jsonResponse) {
                const success = jsonResponse.success === true;
                const message = jsonResponse.message || 'JSON response received';
                
                if (success) {
                  toast.success(message);
                } else {
                  toast.error(`JSON Failed: ${message}`, {
                    description: 'The AI indicated the test failed',
                  });
                }
                
                // Add a system message indicating JSON was parsed
                const systemMessage: DebugMessage = {
                  id: Math.random().toString(36).substring(2, 9),
                  role: 'assistant',
                  content: `[JSON Parsed] Response: ${JSON.stringify(jsonResponse)}`,
                  timestamp: new Date(),
                };
                setMessages(prev => [...prev, systemMessage]);
              }
            } catch (error) {
              console.error('JSON parsing error:', error);
              toast.error('Failed to parse JSON response');
            }
          }
          
        } finally {
          reader.releaseLock();
        }
        
        return; // Exit early for streaming
      }

      const data: ChatCompletionResponse = await response.json();
      console.log("data");
      console.log(data);
      const aiMessage = data.choices[0]?.message;

      console.log("aiMessage");
      console.log(aiMessage);

      if (!aiMessage) {
        throw new Error('No response from AI');
      }

      // Extract thinking content if present (for Ollama thinking models)
      let thinking: string | null = null;
      let processedContent = aiMessage.content || '';
      
      if (aiMessage.content) {
        const extracted = extractThinkingFromContent(aiMessage.content);
        thinking = extracted.thinking;
        processedContent = extracted.cleanContent;
      }

      // Show thinking content as a system message if present
      if (thinking) {
        const thinkingMessage: DebugMessage = {
          id: Math.random().toString(36).substring(2, 9),
          role: 'assistant',
          content: `[Thinking] ${thinking}`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, thinkingMessage]);
      }

      // Handle tool calling response
      if (testMode === 'tool_calling' && aiMessage.tool_calls && aiMessage.tool_calls.length > 0) {
        const toolCall = aiMessage.tool_calls[0];
        if (toolCall.function.name === 'send_test_response') {
          try {
            const args = JSON.parse(toolCall.function.arguments);
            const success = args.success === true;
            const message = args.message || 'Test function called successfully';
            
            if (success) {
              toast.success(message);
            } else {
              toast.error(`Tool Call Failed: ${message}`, {
                description: 'The AI indicated the test failed',
              });
            }
            
            // Add a system message to chat indicating tool call was executed
            const systemMessage: DebugMessage = {
              id: Math.random().toString(36).substring(2, 9),
              role: 'assistant',
              content: `[Tool Call Executed] Function: ${toolCall.function.name}`,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, systemMessage]);
          } catch {
            toast.error('Failed to parse tool call arguments');
          }
        }
      } else if (testMode === 'json' && processedContent) {
        // Handle JSON mode response for non-streaming - use processedContent instead of aiMessage.content
        try {
          const jsonResponse = extractJsonFromContent(processedContent);
          
          if (jsonResponse) {
            const success = jsonResponse.success === true;
            const message = jsonResponse.message || 'JSON response received';
            
            if (success) {
              toast.success(message);
            } else {
              toast.error(`JSON Failed: ${message}`, {
                description: 'The AI indicated the test failed',
              });
            }
            
            // Add a system message to chat indicating JSON was parsed
            const systemMessage: DebugMessage = {
              id: Math.random().toString(36).substring(2, 9),
              role: 'assistant',
              content: `[JSON Parsed] Response: ${JSON.stringify(jsonResponse)}`,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, systemMessage]);
          } else {
            // If JSON extraction failed, show the raw response
            toast.error('Failed to parse JSON response');
            
            const systemMessage: DebugMessage = {
              id: Math.random().toString(36).substring(2, 9),
              role: 'assistant',
              content: `[Invalid JSON] Raw response: ${processedContent}`,
              timestamp: new Date(),
            };
            setMessages(prev => [...prev, systemMessage]);
          }
        } catch (error) {
          console.error('JSON parsing error:', error);
          toast.error('Failed to parse JSON response');
          
          // Add the raw response as a system message
          const systemMessage: DebugMessage = {
            id: Math.random().toString(36).substring(2, 9),
            role: 'assistant',
            content: `[JSON Parse Error] Raw response: ${processedContent}`,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, systemMessage]);
        }
      } else if ((testMode === 'normal' || testMode === 'vision') && processedContent) {
        // Regular text response (normal mode or vision mode) - use processedContent
        const assistantMessage: DebugMessage = {
          id: Math.random().toString(36).substring(2, 9),
          role: 'assistant',
          content: processedContent,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);
        
        // For vision mode, also show a toast indicating vision was processed
        if (testMode === 'vision') {
          toast.success('Vision Analysis Complete', {
            description: 'AI has analyzed the 3D viewport screenshot',
          });
        }
      } else {
        throw new Error('No valid response from AI');
      }
    } catch (error) {
      console.error('Debug chat error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error(`Chat failed: ${errorMessage}`);
      
      // Add error message to chat
      const errorMsg: DebugMessage = {
        id: Math.random().toString(36).substring(2, 9),
        role: 'assistant',
        content: `Error: ${errorMessage}`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const captureScreenshot = async (): Promise<string | null> => {
    try {
      // Find the CAD viewer canvas
      const canvas = document.querySelector('canvas') as HTMLCanvasElement;
      if (!canvas) {
        throw new Error('No 3D viewport found');
      }
      
      // Capture screenshot as data URL
      const dataUrl = canvas.toDataURL('image/png');
      return dataUrl;
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
      toast.error('Failed to capture 3D viewport screenshot');
      return null;
    }
  };

  // Test toast functions for debugging
  const testToasts = {
    notify_user: () => {
      const messages = [
        'This is a test notification message from the debug panel',
        'AI has analyzed your request and is ready to proceed',
        'Remember to save your work before making major changes',
        'Tip: Use descriptive variable names for better code readability'
      ];
      const randomMessage = messages[Math.floor(Math.random() * messages.length)];
      const toastContent = (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bell size={16} style={{ color: '#6b7280' }} />
          <span>{randomMessage}</span>
        </div>
      );
      toast.info(toastContent, { duration: 4000 });
    },
    write_code: () => {
      const toastContent = (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code size={16} style={{ color: '#3b82f6' }} />
          <span>Code generated and executed successfully</span>
        </div>
      );
      toast.info(toastContent, {
        description: 'New CAD model has been created',
        duration: 3000
      });
    },
    edit_code: () => {
      const toastContent = (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Edit3 size={16} style={{ color: '#3b82f6' }} />
          <span>Code edited and executed successfully</span>
        </div>
      );
      toast.info(toastContent, {
        description: 'Changes applied to existing model',
        duration: 3000
      });
    },
    idle: () => {
      const completions = [
        'Task completed successfully - All operations finished',
        'CAD model generation complete - Ready for export',
        'Code optimization finished - Performance improved',
        'Design validation complete - No issues found'
      ];
      const randomCompletion = completions[Math.floor(Math.random() * completions.length)];
      const toastContent = (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={16} style={{ color: '#059669' }} />
          <span>{randomCompletion}</span>
        </div>
      );
      toast.success(toastContent, { duration: 4000 });
    },
    error: () => {
      const errors = [
        'Failed to parse geometry parameters',
        'API connection timeout',
        'Invalid code syntax detected',
        'Memory allocation error'
      ];
      const randomError = errors[Math.floor(Math.random() * errors.length)];
      const toastContent = (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertTriangle size={16} style={{ color: '#ef4444' }} />
          <span>{randomError}</span>
        </div>
      );
      toast.error(toastContent, {
        description: 'Function execution failed',
        duration: 5000,
      });
    },
    loading: () => {
      const loadingMessages = [
        'Processing test operation...',
        'Generating 3D geometry...',
        'Optimizing mesh topology...',
        'Calculating surface normals...'
      ];
      const randomLoading = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
      const toastContent = (
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Clock size={16} style={{ color: '#6b7280' }} />
          <span>{randomLoading}</span>
        </div>
      );
      toast.loading(toastContent);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.title}>
            <MessageCircle size={18} />
            <span>Debug Chat</span>
            <span className={styles.subtitle}>Test AI endpoint • Ephemeral messages</span>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.modeSelector}>
              <label className={styles.modeLabel}>Mode:</label>
              <select
                value={testMode}
                onChange={(e) => setTestMode(e.target.value as TestMode)}
                className={styles.modeSelect}
              >
                <option value="normal">Normal Chat</option>
                <option value="tool_calling">Tool Calling</option>
                <option value="json">JSON Schema</option>
                <option value="vision">Vision Testing</option>
              </select>
            </div>
            
            {/* Streaming toggle - only show for non-tool-calling modes */}
            {testMode !== 'tool_calling' && (
              <div className={styles.modeSelector}>
                <label className={styles.modeLabel}>
                  <input
                    type="checkbox"
                    checked={streamingEnabled}
                    onChange={(e) => setStreamingEnabled(e.target.checked)}
                    style={{ marginRight: '6px' }}
                  />
                  Streaming
                </label>
              </div>
            )}
            
            <button onClick={clearChat} className={styles.clearButton}>
              Clear
            </button>
            <button onClick={onClose} className={styles.closeButton}>
              <X size={18} />
            </button>
          </div>
        </div>

        <div className={styles.messagesContainer}>
          {messages.length === 0 ? (
            <div className={styles.emptyState}>
              <MessageCircle size={48} className={styles.emptyIcon} />
              <p>Start a conversation to test the AI endpoint</p>
              {testMode !== 'normal' ? (
                <p className={styles.emptySubtext}>
                  {testMode === 'tool_calling' 
                    ? 'Tool calling mode: AI responses will appear as toasts'
                    : testMode === 'json'
                    ? `JSON mode: AI responses will appear as toasts${streamingEnabled ? ' (streaming enabled)' : ''}`
                    : 'Vision mode: Screenshots included with each message'
                  }
                </p>
              ) : (
                <p className={styles.emptySubtext}>
                  Messages are ephemeral and won&apos;t be saved{streamingEnabled ? ' • Streaming enabled' : ''}
                </p>
              )}
            </div>
          ) : (
            <div className={styles.messages}>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`${styles.message} ${
                    message.role === 'user' ? styles.userMessage : styles.assistantMessage
                  }`}
                >
                                        <div className={styles.messageContent}>
                        <div className={styles.messageText}>
                          {message.hasScreenshot && (
                            <span className={styles.screenshotIndicator}>
                              📷 
                            </span>
                          )}
                          {message.content}
                        </div>
                        <div className={styles.messageTime}>
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                </div>
              ))}
              {isLoading && (
                <div className={`${styles.message} ${styles.assistantMessage}`}>
                  <div className={styles.messageContent}>
                    <div className={styles.loadingMessage}>
                      <Loader2 size={16} className={styles.spinner} />
                      <span>Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className={styles.inputContainer}>
          {testMode !== 'normal' && (
            <div className={styles.toolCallIndicator}>
              {testMode === 'tool_calling' 
                ? '🔧 Tool calling mode active' 
                : testMode === 'json'
                ? `📄 JSON schema mode active${streamingEnabled ? ' (streaming)' : ''}`
                : '👁️ Vision testing mode active'
              }
            </div>
          )}
          
          {/* Show streaming indicator for normal mode */}
          {testMode === 'normal' && streamingEnabled && (
            <div className={styles.toolCallIndicator}>
              📡 Streaming mode active
            </div>
          )}
          
          {/* Test Toast Buttons */}
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '4px', 
            marginBottom: '8px',
            padding: '8px',
            background: 'var(--bg-tertiary)',
            borderRadius: '6px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ 
              width: '100%', 
              fontSize: '11px', 
              color: 'var(--text-secondary)', 
              marginBottom: '4px',
              fontWeight: '500',
              textAlign: 'center'
            }}>
              🧪 Test Toasts (Click to preview toast notifications)
            </div>
            <button
              type="button"
              onClick={testToasts.notify_user}
              title="Test notification toast"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '10px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
              }}
            >
              <Bell size={12} />
              Notify
            </button>
            <button
              type="button"
              onClick={testToasts.write_code}
              title="Test code generation toast"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '10px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
              }}
            >
              <Code size={12} />
              Write
            </button>
            <button
              type="button"
              onClick={testToasts.edit_code}
              title="Test code editing toast"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '10px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
              }}
            >
              <Edit3 size={12} />
              Edit
            </button>
            <button
              type="button"
              onClick={testToasts.idle}
              title="Test task completion toast"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '10px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
              }}
            >
              <CheckCircle size={12} />
              Complete
            </button>
            <button
              type="button"
              onClick={testToasts.error}
              title="Test error toast"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '10px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
              }}
            >
              <AlertTriangle size={12} />
              Error
            </button>
            <button
              type="button"
              onClick={testToasts.loading}
              title="Test loading toast"
              style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '10px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'var(--bg-secondary)';
              }}
            >
              <Clock size={12} />
              Loading
            </button>
          </div>
          
          <div className={styles.inputRow}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                testMode === 'tool_calling' 
                  ? "Test tool calling (response will appear as toast)..."
                  : testMode === 'json'
                  ? `Test JSON schema (response will appear as toast)${streamingEnabled ? ' with streaming...' : '...'}`
                  : testMode === 'vision'
                  ? "Ask about the 3D model (screenshot will be included)..."
                  : `Type a message to test the AI endpoint${streamingEnabled ? ' (streaming enabled)' : ''}...`
              }
              className={styles.input}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputValue.trim() || isLoading}
              className={styles.sendButton}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 