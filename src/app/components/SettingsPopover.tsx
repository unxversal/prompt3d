import React, { useState, useEffect, useCallback } from 'react';
import { Settings, Eye, EyeOff, X, Key, Brain, Globe, Wrench, MessageSquare, Camera, Plus, Check, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useTheme } from '../hooks/useTheme';
import { conversationStore, type ModelConfiguration } from '../lib/conversationStore';
import styles from './SettingsPopover.module.css';

interface SettingsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onApiKeyChange: (apiKey: string) => void;
  onModelChange: (model: string) => void;
  onProviderSettingsChange?: (settings: {
    baseUrl: string;
    useToolCalling: boolean;
    sendScreenshots: boolean;
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
  {
    name: 'Ollama',
    baseUrl: 'http://localhost:11434/v1',
    supportsToolCalling: true,
    supportsJsonOutput: true,
    website: 'https://ollama.com/',
    placeholder: 'ollama',
    defaultApiKey: 'ollama',
  },
];

type ViewMode = 'list' | 'add' | 'edit';

export default function SettingsPopover({ isOpen, onClose, onApiKeyChange, onModelChange, onProviderSettingsChange }: SettingsPopoverProps) {
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingModel, setEditingModel] = useState<ModelConfiguration | null>(null);
  
  // Model list state
  const [modelConfigurations, setModelConfigurations] = useState<ModelConfiguration[]>([]);
  const [activeModelId, setActiveModelId] = useState<string | null>(null);
  
  // Form state
  const [modelName, setModelName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [model, setModel] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [baseUrl, setBaseUrl] = useState('https://openrouter.ai/api/v1');
  const [useToolCalling, setUseToolCalling] = useState(true);
  const [sendScreenshots, setSendScreenshots] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState('OpenRouter');
  const [customProvider, setCustomProvider] = useState(false);
  const { theme } = useTheme();

  const currentProvider = PRESET_PROVIDERS.find(p => p.name === selectedProvider);

  const loadSettings = useCallback(async () => {
    try {
      // Load all model configurations
      const configs = await conversationStore.getAllModelConfigurations();
      setModelConfigurations(configs);
      
      // Get active model
      const activeConfig = await conversationStore.getActiveModelConfiguration();
      setActiveModelId(activeConfig?.id || null);
      
      // If no models exist, migrate from legacy settings
      if (configs.length === 0) {
        await migrateLegacySettings();
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  const migrateLegacySettings = async () => {
    try {
      const savedApiKey = await conversationStore.getApiKey();
      const savedModel = await conversationStore.getModel();
      const providerSettings = await conversationStore.getProviderSettings();
      
      if (savedApiKey && savedModel) {
        // Detect provider from base URL
        const provider = PRESET_PROVIDERS.find(p => 
          providerSettings.baseUrl.includes(new URL(p.baseUrl).hostname)
        );
        
        const config = await conversationStore.createModelConfiguration({
          name: `${provider?.name || 'Custom'} - ${savedModel}`,
          provider: provider?.name || 'Custom',
          model: savedModel,
          apiKey: savedApiKey,
          baseUrl: providerSettings.baseUrl,
          useToolCalling: providerSettings.useToolCalling,
          sendScreenshots: providerSettings.sendScreenshots,
        });
        
        await conversationStore.setActiveModelConfiguration(config.id);
        
        // Reload configurations
        const configs = await conversationStore.getAllModelConfigurations();
        setModelConfigurations(configs);
        setActiveModelId(config.id);
        
        toast.success('Settings migrated to new model system');
      }
    } catch (error) {
      console.error('Failed to migrate legacy settings:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSettings();
    }
  }, [isOpen, loadSettings]);

    const handleProviderChange = (providerName: string) => {
    setSelectedProvider(providerName);
    
    if (providerName === 'Custom') {
      setCustomProvider(true);
      setBaseUrl('');
    } else {
      setCustomProvider(false);
      const provider = PRESET_PROVIDERS.find(p => p.name === providerName);
      if (provider) {
        setBaseUrl(provider.baseUrl);
        setModel(provider.defaultModel || '');
        setUseToolCalling(provider.supportsToolCalling);
        // Set default API key for providers that have one
        if (provider.defaultApiKey) {
          setApiKey(provider.defaultApiKey);
        }
      }
    }
  };

  const handleSave = async () => {
    if (!modelName.trim()) {
      toast.error('Please enter a model name');
      return;
    }

    // Skip API key validation for Ollama
    if (selectedProvider !== 'Ollama' && !apiKey.trim()) {
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
      const finalApiKey = selectedProvider === 'Ollama' ? 'ollama' : apiKey.trim();
      
      if (editingModel) {
        // Update existing model configuration
        const updatedConfig = {
          ...editingModel,
          name: modelName.trim(),
          provider: providerName,
          model: model.trim(),
          apiKey: finalApiKey,
          baseUrl: baseUrl.trim(),
          useToolCalling,
          sendScreenshots,
        };
        
        await conversationStore.saveModelConfiguration(updatedConfig);
        toast.success('Model configuration updated');
      } else {
        // Create new model configuration
        const newConfig = await conversationStore.createModelConfiguration({
          name: modelName.trim(),
          provider: providerName,
          model: model.trim(),
          apiKey: finalApiKey,
          baseUrl: baseUrl.trim(),
          useToolCalling,
          sendScreenshots,
        });
        
        // Automatically set as active if it's the first model
        if (modelConfigurations.length === 0) {
          await conversationStore.setActiveModelConfiguration(newConfig.id);
        }
        
        toast.success('Model configuration added');
      }
      
      // Reload configurations and return to list
      await loadSettings();
      setViewMode('list');
      resetForm();
      
      // Update parent components with active model
      const activeConfig = await conversationStore.getActiveModelConfiguration();
      if (activeConfig) {
        onApiKeyChange(activeConfig.apiKey);
        onModelChange(activeConfig.model);
        if (onProviderSettingsChange) {
          onProviderSettingsChange({
            baseUrl: activeConfig.baseUrl,
            useToolCalling: activeConfig.useToolCalling,
            sendScreenshots: activeConfig.sendScreenshots,
          });
        }
      }
    } catch {
      toast.error('Failed to save model configuration');
    } finally {
      setIsLoading(false);
    }
  };



  // Reset form when switching views
  const resetForm = () => {
    setModelName('');
    setApiKey('');
    setModel('');
    setShowApiKey(false);
    setBaseUrl('https://openrouter.ai/api/v1');
    setUseToolCalling(true);
    setSendScreenshots(true);
    setSelectedProvider('OpenRouter');
    setCustomProvider(false);
    setEditingModel(null);
  };

  const handleAddModel = () => {
    resetForm();
    setViewMode('add');
  };

  const handleEditModel = (config: ModelConfiguration) => {
    setEditingModel(config);
    setModelName(config.name);
    setApiKey(config.apiKey);
    setModel(config.model);
    setBaseUrl(config.baseUrl);
    setUseToolCalling(config.useToolCalling);
    setSendScreenshots(config.sendScreenshots);
    
    // Set provider
    const provider = PRESET_PROVIDERS.find(p => p.name === config.provider);
    if (provider) {
      setSelectedProvider(provider.name);
      setCustomProvider(false);
    } else {
      setCustomProvider(true);
      setSelectedProvider('Custom');
    }
    
    setViewMode('edit');
  };

  const handleSelectModel = async (configId: string) => {
    try {
      await conversationStore.setActiveModelConfiguration(configId);
      setActiveModelId(configId);
      
      // Update parent components with new active model
      const config = await conversationStore.getModelConfiguration(configId);
      if (config) {
        onApiKeyChange(config.apiKey);
        onModelChange(config.model);
        if (onProviderSettingsChange) {
          onProviderSettingsChange({
            baseUrl: config.baseUrl,
            useToolCalling: config.useToolCalling,
            sendScreenshots: config.sendScreenshots,
          });
        }
      }
      
      toast.success(`Switched to ${config?.name}`);
    } catch {
      toast.error('Failed to switch model');
    }
  };

  const handleDeleteModel = async (configId: string) => {
    try {
      await conversationStore.deleteModelConfiguration(configId);
      await loadSettings();
      
      // If we deleted the active model, clear the active selection
      if (configId === activeModelId) {
        setActiveModelId(null);
      }
      
      toast.success('Model configuration deleted');
    } catch {
      toast.error('Failed to delete model configuration');
    }
  };

  const handleBackToList = () => {
    setViewMode('list');
    resetForm();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={`${styles.popover} ${styles[theme]}`}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            {viewMode === 'list' ? (
              <>
                <Settings size={16} />
                <h3>Model Settings</h3>
              </>
            ) : (
              <>
                <button onClick={handleBackToList} className={styles.backButton}>
                  <ArrowLeft size={16} />
                </button>
                <h3>{viewMode === 'add' ? 'Add Model' : 'Edit Model'}</h3>
              </>
            )}
          </div>
          <button onClick={onClose} className={styles.closeButton}>
            <X size={16} />
          </button>
        </div>

        <div className={styles.content}>
          {viewMode === 'list' ? (
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <div className={styles.sectionTitle}>
                  <Brain size={16} />
                  <label className={styles.label}>Your Models</label>
                </div>
                <button
                  onClick={handleAddModel}
                  className={styles.addButton}
                  disabled={isLoading}
                >
                  <Plus size={16} />
                  Add Model
                </button>
              </div>
              
              {modelConfigurations.length === 0 ? (
                <div className={styles.emptyState}>
                  <Brain size={48} className={styles.emptyIcon} />
                  <p>No models configured</p>
                  <p className={styles.emptySubtext}>Add your first AI model to get started</p>
                </div>
              ) : (
                <div className={styles.modelList}>
                  {modelConfigurations
                    .sort((a, b) => {
                      // Put active model first
                      if (a.id === activeModelId) return -1;
                      if (b.id === activeModelId) return 1;
                      // Keep original order for other models
                      return 0;
                    })
                    .map((config) => (
                    <div
                      key={config.id}
                      className={`${styles.modelCard} ${
                        config.id === activeModelId ? styles.activeModel : ''
                      }`}
                    >
                      <div className={styles.modelInfo}>
                        <div className={styles.modelHeader}>
                          <h4 className={styles.modelName}>{config.name}</h4>
                          {config.id === activeModelId && (
                            <span className={styles.activeIndicator}>
                              <Check size={14} />
                              Active
                            </span>
                          )}
                        </div>
                        <p className={styles.modelDetails}>
                          {config.provider} • {config.model}
                        </p>
                      </div>
                      <div className={styles.modelActions}>
                        {config.id !== activeModelId && (
                          <button
                            onClick={() => handleSelectModel(config.id)}
                            className={styles.selectButton}
                            disabled={isLoading}
                          >
                            Select
                          </button>
                        )}
                        <button
                          onClick={() => handleEditModel(config)}
                          className={styles.editButton}
                          disabled={isLoading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteModel(config.id)}
                          className={styles.deleteButton}
                          disabled={isLoading || config.id === activeModelId}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              <div className={styles.section}>
                <div className={styles.sectionHeader}>
                  <Brain size={16} />
                  <label className={styles.label}>Model Name</label>
                </div>
                
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    value={modelName}
                    onChange={(e) => setModelName(e.target.value)}
                    placeholder="e.g., GPT-4 Turbo, Claude 3.5 Sonnet"
                    className={styles.input}
                    disabled={isLoading}
                  />
                </div>

                <div className={styles.help}>
                  <p className={styles.note}>
                    Give your model configuration a descriptive name
                  </p>
                </div>
              </div>

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

          {/* API Key - Hidden for Ollama */}
          {selectedProvider !== 'Ollama' && (
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
          )}

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

          {/* Screenshot Settings */}
          <div className={styles.section}>
            <div className={styles.sectionHeader}>
              <Camera size={16} />
              <label className={styles.label}>Visual Context</label>
            </div>
            
            <div className={styles.inputGroup}>
              <div className={styles.toggleGroup}>
                <button
                  onClick={() => setSendScreenshots(true)}
                  className={`${styles.toggleButton} ${sendScreenshots ? styles.active : ''}`}
                  disabled={isLoading}
                >
                  Send Screenshots
                </button>
                <button
                  onClick={() => setSendScreenshots(false)}
                  className={`${styles.toggleButton} ${!sendScreenshots ? styles.active : ''}`}
                  disabled={isLoading}
                >
                  Text Only
                </button>
              </div>
            </div>

            <div className={styles.help}>
              <p className={styles.note}>
                {sendScreenshots 
                  ? 'Sends 3D viewport screenshots to the AI for better visual understanding' 
                  : 'Disables screenshot capture for faster processing and debugging'
                }
              </p>
            </div>
          </div>
            </>
          )}
        </div>

        <div className={styles.footer}>
          {viewMode === 'list' ? (
            <button
              onClick={onClose}
              className={styles.cancelButton}
              disabled={isLoading}
            >
              Close
            </button>
          ) : (
            <>
              <button
                onClick={handleBackToList}
                className={styles.cancelButton}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className={styles.saveButton}
                disabled={
                  !model.trim() || 
                  !modelName.trim() || 
                  (selectedProvider !== 'Ollama' && !apiKey.trim()) || 
                  isLoading
                }
              >
                {isLoading ? 'Saving...' : editingModel ? 'Update' : 'Add Model'}
              </button>
            </>
          )}
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