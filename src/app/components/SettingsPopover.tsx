import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Eye, EyeOff, X, Key, Brain, Globe, Wrench, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../hooks/useTheme';
import { conversationStore } from '../lib/conversationStore';
import styles from './SettingsPopover.module.css';

interface SettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeyChange: (apiKey: string) => void;
  onModelChange: (model: string) => void;
  onProviderSettingsChange?: (settings: {
    baseUrl: string;
    useToolCalling: boolean;
  }) => void;
}

const PRESET_PROVIDERS = [
  {
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    supportsToolCalling: true,
    supportsJsonOutput: true,
    website: 'https://openrouter.ai/keys',
    placeholder: 'sk-or-v1-...',
  },
  {
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    supportsToolCalling: true,
    supportsJsonOutput: false,
    website: 'https://console.anthropic.com/settings/keys',
    placeholder: 'sk-ant-...',
    defaultModel: 'claude-sonnet-4-20250514',
  },
  {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    supportsToolCalling: true,
    supportsJsonOutput: true,
    website: 'https://platform.openai.com/api-keys',
    placeholder: 'sk-...',
    defaultModel: 'o3-2025-04-16',
  },
];

export default function SettingsPopover({ isOpen, onClose, onApiKeyChange, onModelChange, onProviderSettingsChange }: SettingsPopoverProps) {
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [baseUrl, setBaseUrl] = useState('https://openrouter.ai/api/v1');
  const [useToolCalling, setUseToolCalling] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState('OpenRouter');
  const [customProvider, setCustomProvider] = useState(false);
  const [configuredProviders, setConfiguredProviders] = useState<Set<string>>(new Set());
  const { theme } = useTheme();

  const currentProvider = PRESET_PROVIDERS.find(p => p.name === selectedProvider);

  const loadSettings = useCallback(async () => {
    try {
      // Load the currently active provider from legacy settings
      const providerSettings = await conversationStore.getProviderSettings();
      
      // Detect current provider type
      const provider = PRESET_PROVIDERS.find(p => providerSettings.baseUrl.includes(new URL(p.baseUrl).hostname));
      let currentProvider = 'Custom';
      if (provider) {
        currentProvider = provider.name;
        setSelectedProvider(provider.name);
        setCustomProvider(false);
      } else {
        setCustomProvider(true);
      }
      
      // Load provider-specific settings
      const providerConfig = await conversationStore.getProviderConfig(currentProvider);
      
      // If no provider-specific settings exist, use legacy settings
      if (!providerConfig.apiKey && !providerConfig.model) {
        const savedApiKey = await conversationStore.getApiKey();
        const savedModel = await conversationStore.getModel();
        
        if (savedApiKey) {
          setApiKey(savedApiKey);
        }
        setModel(savedModel);
        setBaseUrl(providerSettings.baseUrl);
        setUseToolCalling(providerSettings.useToolCalling);
        
        // Migrate legacy settings to provider-specific settings
        if (savedApiKey || savedModel) {
          await conversationStore.setProviderConfig(currentProvider, {
            apiKey: savedApiKey || '',
            model: savedModel,
            baseUrl: providerSettings.baseUrl,
            useToolCalling: providerSettings.useToolCalling,
          });
        }
      } else {
        // Use provider-specific settings
        setApiKey(providerConfig.apiKey || '');
        setModel(providerConfig.model || '');
        setBaseUrl(providerConfig.baseUrl || providerSettings.baseUrl);
        setUseToolCalling(providerConfig.useToolCalling ?? providerSettings.useToolCalling);
      }

      // Load all configured providers to show indicators
      const allProviderConfigs = await conversationStore.getAllProviderConfigs();
      const configured = new Set<string>();
      
      for (const [providerName, config] of Object.entries(allProviderConfigs)) {
        if (config.apiKey && config.apiKey.trim()) {
          configured.add(providerName);
        }
      }
      
      setConfiguredProviders(configured);
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen, loadSettings]);

  const handleProviderChange = async (providerName: string) => {
    setSelectedProvider(providerName);
    
    // Load provider-specific settings
    try {
      const providerConfig = await conversationStore.getProviderConfig(providerName);
      
      if (providerName === 'Custom') {
        setCustomProvider(true);
        setBaseUrl(providerConfig.baseUrl || '');
        setApiKey(providerConfig.apiKey || '');
        setModel(providerConfig.model || '');
        setUseToolCalling(providerConfig.useToolCalling ?? true);
      } else {
        setCustomProvider(false);
        const provider = PRESET_PROVIDERS.find(p => p.name === providerName);
        if (provider) {
          // Load saved settings for this provider, or use defaults
          setBaseUrl(providerConfig.baseUrl || provider.baseUrl);
          setApiKey(providerConfig.apiKey || '');
          setModel(providerConfig.model || provider.defaultModel || '');
          setUseToolCalling(providerConfig.useToolCalling ?? provider.supportsToolCalling);
        }
      }
    } catch (error) {
      console.error('Failed to load provider settings:', error);
      
      // Fallback to provider defaults
      if (providerName === 'Custom') {
        setCustomProvider(true);
        setBaseUrl('');
        setApiKey('');
        setModel('');
        setUseToolCalling(true);
      } else {
        setCustomProvider(false);
        const provider = PRESET_PROVIDERS.find(p => p.name === providerName);
        if (provider) {
          setBaseUrl(provider.baseUrl);
          setApiKey('');
          setModel(provider.defaultModel || '');
          setUseToolCalling(provider.supportsToolCalling);
        }
      }
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

    if (!baseUrl.trim()) {
      toast.error('Please enter a base URL');
      return;
    }

    // Validate tool calling selection
    if (currentProvider && !customProvider) {
      if (useToolCalling && !currentProvider.supportsToolCalling) {
        toast.error(`${currentProvider.name} does not support tool calling. Please disable tool calling or choose a different provider.`);
        return;
      }
      if (!useToolCalling && !currentProvider.supportsJsonOutput) {
        toast.error(`${currentProvider.name} does not support JSON output. Please enable tool calling or choose a different provider.`);
        return;
      }
    }

    setIsLoading(true);
    try {
      const providerName = customProvider ? 'Custom' : selectedProvider;
      
      // Save provider-specific settings
      await conversationStore.setProviderConfig(providerName, {
        apiKey: apiKey.trim(),
        model: model.trim(),
        baseUrl: baseUrl.trim(),
        useToolCalling,
      });
      
      // Also update global settings for backwards compatibility and current session
      await conversationStore.setApiKey(apiKey.trim());
      await conversationStore.setModel(model.trim());
      await conversationStore.setProviderSettings({
        baseUrl: baseUrl.trim(),
        useToolCalling,
      });
      
      onApiKeyChange(apiKey.trim());
      onModelChange(model.trim());
      
      if (onProviderSettingsChange) {
        onProviderSettingsChange({
          baseUrl: baseUrl.trim(),
          useToolCalling,
        });
      }
      
      // Update configured providers list
      const newConfigured = new Set(configuredProviders);
      newConfigured.add(providerName);
      setConfiguredProviders(newConfigured);
      
      toast.success(`Settings saved for ${providerName}`);
      onClose();
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = async () => {
    try {
      const providerName = customProvider ? 'Custom' : selectedProvider;
      
      // Clear provider-specific settings
      await conversationStore.setProviderConfig(providerName, {
        apiKey: '',
        model: model, // Keep the model
        baseUrl: baseUrl, // Keep the base URL
        useToolCalling: useToolCalling, // Keep tool calling preference
      });
      
      // Also clear global settings for current session
      await conversationStore.setApiKey('');
      setApiKey('');
      onApiKeyChange('');
      
      // Update configured providers list
      const newConfigured = new Set(configuredProviders);
      newConfigured.delete(providerName);
      setConfiguredProviders(newConfigured);
      
      toast.success(`API key cleared for ${providerName}`);
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
            <h3>Provider Settings</h3>
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={16} />
          </button>
        </div>

        <div className={styles.content}>
          {/* Provider Selection */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Globe size={16} />
              <label className={styles.label}>Provider</label>
            </div>
            
            <div className={styles.inputGroup}>
              <div className={styles.providerGrid}>
                {PRESET_PROVIDERS.map((provider) => (
                  <button
                    key={provider.name}
                    onClick={() => handleProviderChange(provider.name)}
                    className={`${styles.providerButton} ${
                      selectedProvider === provider.name && !customProvider ? styles.active : ''
                    }`}
                    disabled={isLoading}
                  >
                    {provider.name}
                    {configuredProviders.has(provider.name) && (
                      <span className={styles.configuredIndicator} title="Configured">
                        ●
                      </span>
                    )}
                  </button>
                ))}
                <button
                  onClick={() => handleProviderChange('Custom')}
                  className={`${styles.providerButton} ${
                    customProvider ? styles.active : ''
                  }`}
                  disabled={isLoading}
                >
                  Custom
                  {configuredProviders.has('Custom') && (
                    <span className={styles.configuredIndicator} title="Configured">
                      ●
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Custom Provider URL */}
          {customProvider && (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <Wrench size={16} />
                <label className={styles.label}>Custom Base URL</label>
              </div>
              
              <div className={styles.inputGroup}>
                <input
                  type="text"
                  value={baseUrl}
                  onChange={(e) => setBaseUrl(e.target.value)}
                  placeholder="https://api.example.com/v1"
                  className={styles.input}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {/* API Key */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Key size={16} />
              <label className={styles.label}>API Key</label>
            </div>
            
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={apiKey}
                  onChange={(e) => {
                    setApiKey(e.target.value);
                  }}
                  placeholder={currentProvider?.placeholder || 'Enter your API key...'}
                  className={styles.input}
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
              </div>
              
              <div className={styles.buttonGroup}>
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
                {currentProvider ? (
                  <>
                    Get your API key from{' '}
                    <a 
                      href={currentProvider.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.link}
                    >
                      {currentProvider.name}
                    </a>
                  </>
                ) : (
                  'Enter your custom provider API key'
                )}
              </p>
              <p className={styles.note}>
                Your API key is stored locally and never shared.
              </p>
            </div>
          </div>

          {/* Model */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Brain size={16} />
              <label className={styles.label}>Model</label>
            </div>
            
            <div className={styles.inputGroup}>
              <input
                type="text"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Enter model name (e.g., google/gemini-2.0-flash-exp:free)"
                className={styles.input}
                disabled={isLoading}
              />
            </div>

            <div className={styles.help}>
                             <p className={styles.note}>
                 Enter the exact model string for your provider. Check your provider&apos;s documentation for available models.
               </p>
            </div>
          </div>

          {/* Output Mode */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <MessageSquare size={16} />
              <label className={styles.label}>Output Mode</label>
            </div>
            
            <div className={styles.inputGroup}>
              <div className={styles.toggleGroup}>
                <button
                  onClick={() => setUseToolCalling(true)}
                  className={`${styles.toggleButton} ${useToolCalling ? styles.active : ''}`}
                  disabled={isLoading || (currentProvider && !currentProvider.supportsToolCalling)}
                >
                  Tool Calling
                </button>
                <button
                  onClick={() => setUseToolCalling(false)}
                  className={`${styles.toggleButton} ${!useToolCalling ? styles.active : ''}`}
                  disabled={isLoading || (currentProvider && !currentProvider.supportsJsonOutput)}
                >
                  JSON Output
                </button>
              </div>
            </div>

            <div className={styles.help}>
              <p className={styles.note}>
                {useToolCalling 
                  ? 'Uses function calling for structured interactions (recommended)' 
                  : 'Uses JSON schema for structured output (fallback for providers without tool support)'
                }
              </p>
              {currentProvider && (
                <p className={styles.note}>
                  {currentProvider.name} supports: {' '}
                  {currentProvider.supportsToolCalling && 'Tool Calling'}
                  {currentProvider.supportsToolCalling && currentProvider.supportsJsonOutput && ', '}
                  {currentProvider.supportsJsonOutput && 'JSON Output'}
                </p>
              )}
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
            disabled={!apiKey.trim() || !model.trim() || isLoading}
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