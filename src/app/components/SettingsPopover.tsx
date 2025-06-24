import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Eye, EyeOff, Check, X, Key, DollarSign, Brain } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../hooks/useTheme';
import { conversationStore } from '../lib/conversationStore';
import { AIAgent } from '../lib/aiAgent';
import styles from './SettingsPopover.module.css';

interface SettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeyChange: (apiKey: string) => void;
  onModelChange: (model: string) => void;
}

export default function SettingsPopover({ isOpen, onClose, onApiKeyChange, onModelChange }: SettingsPopoverProps) {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('google/gemini-2.0-flash-exp:free');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const { theme } = useTheme();

  const loadApiKey = useCallback(async () => {
    try {
      const savedApiKey = await conversationStore.getApiKey();
      const savedModel = await conversationStore.getModel();
      
      if (savedApiKey) {
        setApiKey(savedApiKey);
        // Test the saved API key
        await validateApiKey(savedApiKey);
      }
      
      setModel(savedModel);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadApiKey();
    }
  }, [isOpen, loadApiKey]);

  const validateApiKey = async (key: string) => {
    if (!key.trim()) {
      setIsValid(null);
      return;
    }

    setIsLoading(true);
    try {
      const agent = new AIAgent(key);
      const valid = await agent.testApiKey();
      setIsValid(valid);
      
      if (valid) {
        toast.success('API key validated successfully');
      } else {
        toast.error('Invalid API key');
      }
         } catch {
       setIsValid(false);
       toast.error('Failed to validate API key');
     } finally {
      setIsLoading(false);
    }
  };

    const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    if (!model.trim()) {
      toast.error('Please enter a model');
      return;
    }

    setIsLoading(true);
    try {
      await conversationStore.setApiKey(apiKey.trim());
      await conversationStore.setModel(model.trim());
      onApiKeyChange(apiKey.trim());
      onModelChange(model.trim());
      toast.success('Settings saved successfully');
      onClose();
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    try {
      await conversationStore.setApiKey('');
      setApiKey('');
      setIsValid(null);
      onApiKeyChange('');
      toast.success('API key cleared');
         } catch {
       toast.error('Failed to clear API key');
     }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={`${styles.popover} ${styles[theme]}`}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <Settings size={16} />
            <h3>Settings</h3>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={16} />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Key size={16} />
              <label className={styles.label}>OpenRouter API Key</label>
            </div>
            
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                    setIsValid(null);
                  }}
                  placeholder="sk-or-v1-..."
                  className={`${styles.input} ${
                    isValid === true ? styles.valid : isValid === false ? styles.invalid : ''
                  }`}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowApiKey(!showApiKey)}
                  className={styles.toggleButton}
                  disabled={isLoading}
                >
                  {showApiKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
                {isValid !== null && (
                  <div className={styles.validationIcon}>
                    {isValid ? (
                      <Check size={16} className={styles.validIcon} />
                    ) : (
                      <X size={16} className={styles.invalidIcon} />
                    )}
                  </div>
                )}
              </div>
              
              <div className={styles.buttonGroup}>
                <button
                  onClick={() => validateApiKey(apiKey)}
                  disabled={!apiKey.trim() || isLoading}
                  className={styles.validateButton}
                >
                  {isLoading ? 'Testing...' : 'Test'}
                </button>
                <button
                  onClick={handleClear}
                  disabled={!apiKey || isLoading}
                  className={styles.clearButton}
                >
                  Clear
                </button>
              </div>
            </div>

            <div className={styles.help}>
              <p>
                Get your API key from{' '}
                <a 
                  href="https://openrouter.ai/keys" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  OpenRouter
                </a>
              </p>
              <p className={styles.note}>
                Your API key is stored locally and never shared.
              </p>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Brain size={16} />
              <label className={styles.label}>AI Model</label>
            </div>
            
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <select
                  value={model}
                  onChange={(e) => {
                    const selectedModel = e.target.value;
                    setModel(selectedModel);
                    
                    // Check if model is free
                    const freeModels = [
                      'google/gemini-2.0-flash-exp:free',
                      'google/gemma-3-27b-it:free',
                      'qwen/qwen2.5-vl-72b-instruct:free',
                      'mistralai/mistral-small-3.2-24b-instruct:free'
                    ];
                    
                    if (!freeModels.includes(selectedModel)) {
                      toast.warning('This model is not free and will consume credits');
                    }
                  }}
                  className={styles.select}
                  disabled={isLoading}
                >
                  <optgroup label="Free Models">
                    <option value="google/gemini-2.0-flash-exp:free">Gemini 2.0 Flash (Free)</option>
                    <option value="google/gemma-3-27b-it:free">Gemma 3 27B (Free)</option>
                    <option value="qwen/qwen2.5-vl-72b-instruct:free">Qwen 2.5 VL 72B (Free)</option>
                    <option value="mistralai/mistral-small-3.2-24b-instruct:free">Mistral Small 3.2 (Free)</option>
                  </optgroup>
                  <optgroup label="Paid Models">
                    <option value="google/gemini-2.5-flash-lite-preview-06-17">Gemini 2.5 Flash Lite (Paid)</option>
                    <option value="google/gemini-2.5-flash">Gemini 2.5 Flash (Paid)</option>
                    <option value="google/gemini-2.5-pro">Gemini 2.5 Pro (Paid)</option>
                  </optgroup>
                </select>
              </div>
            </div>

            <div className={styles.help}>
              <p className={styles.paidIndicator}>
                <DollarSign size={14} />
                Paid models consume credits
              </p>
              <p className={styles.note}>
                Free models are rate-limited. Paid models offer higher limits and better performance.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            onClick={onClose}
            className={styles.cancelButton}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className={styles.saveButton}
            disabled={!apiKey.trim() || isLoading}
          >
            {isLoading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </>
  );
}

export function SettingsButton({ onClick }: { onClick: () => void }) {
  const { theme } = useTheme();
  
  return (
    <button
      onClick={onClick}
      className={`${styles.settingsButton} ${styles[theme]}`}
      title="Settings"
    >
      <Settings size={16} />
    </button>
  );
} 