import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Conversation, Message } from '../types/ai';

interface ModelConfiguration {
  id: string;
  name: string;
  provider: string;
  model: string;
  apiKey: string;
  baseUrl: string;
  useToolCalling: boolean;
  sendScreenshots: boolean;
  docsLevel: number; // Documentation level (1-8)
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface CodeVersion {
  id: string;
  conversationId: string;
  code: string;
  timestamp: Date;
  description?: string;
  isAutoSaved: boolean;
}

interface ConversationDB extends DBSchema {
  conversations: {
    key: string;
    value: Conversation;
    indexes: { 'by-date': Date };
  };
  settings: {
    key: string;
    value: {
      key: string;
      apiKey?: string;
      model?: string;
      theme?: string;
      collapsed?: boolean;
      baseUrl?: string;
      useToolCalling?: boolean;
      sendScreenshots?: boolean;
      activeModelId?: string;
    };
  };
  providerSettings: {
    key: string;
    value: {
      provider: string;
      apiKey?: string;
      model?: string;
      baseUrl?: string;
      useToolCalling?: boolean;
      sendScreenshots?: boolean;
    };
  };
  modelConfigurations: {
    key: string;
    value: ModelConfiguration;
    indexes: { 'by-date': Date };
  };
  codeVersions: {
    key: string;
    value: CodeVersion;
    indexes: { 'by-conversation': string; 'by-date': Date };
  };
}

class ConversationStore {
  private db: IDBPDatabase<ConversationDB> | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<ConversationDB>('c3d-conversations', 4, {
      upgrade(db, oldVersion) {
        // Create conversations store
        if (oldVersion < 1) {
          const conversationStore = db.createObjectStore('conversations', {
            keyPath: 'id',
          });
          conversationStore.createIndex('by-date', 'updatedAt');

          // Create settings store
          db.createObjectStore('settings', {
            keyPath: 'key',
          });
        }
        
        // Create provider settings store
        if (oldVersion < 2) {
          db.createObjectStore('providerSettings', {
            keyPath: 'provider',
          });
        }
        
        // Create model configurations store
        if (oldVersion < 3) {
          const modelConfigStore = db.createObjectStore('modelConfigurations', {
            keyPath: 'id',
          });
          modelConfigStore.createIndex('by-date', 'updatedAt');
        }
        
        // Create code versions store
        if (oldVersion < 4) {
          const codeVersionsStore = db.createObjectStore('codeVersions', {
            keyPath: 'id',
          });
          codeVersionsStore.createIndex('by-conversation', 'conversationId');
          codeVersionsStore.createIndex('by-date', 'timestamp');
        }
      },
    });
  }

  async saveConversation(conversation: Conversation): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.put('conversations', conversation);
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    return await this.db.get('conversations', id);
  }

  async getAllConversations(): Promise<Conversation[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    return await this.db.getAllFromIndex('conversations', 'by-date');
  }

  async deleteConversation(id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.delete('conversations', id);
  }

  async deleteAllChats(): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.clear('conversations');
  }

  async addMessageToConversation(conversationId: string, message: Message): Promise<void> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    conversation.messages.push(message);
    conversation.updatedAt = new Date();
    
    await this.saveConversation(conversation);
  }

  async updateMessage(conversationId: string, messageId: string, updates: Partial<Message>): Promise<void> {
    const conversation = await this.getConversation(conversationId);
    if (!conversation) throw new Error('Conversation not found');

    const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) throw new Error('Message not found');

    conversation.messages[messageIndex] = {
      ...conversation.messages[messageIndex],
      ...updates,
    };
    conversation.updatedAt = new Date();
    
    await this.saveConversation(conversation);
  }

  // Settings management
  async getApiKey(): Promise<string | undefined> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const settings = await this.db.get('settings', 'api-key');
    return settings?.apiKey;
  }

  async setApiKey(apiKey: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.put('settings', { key: 'api-key', apiKey });
  }

  async getModel(): Promise<string> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const settings = await this.db.get('settings', 'model-settings');
    return settings?.model || 'google/gemini-2.0-flash-exp:free'; // Default model
  }

  async setModel(model: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.put('settings', { key: 'model-settings', model });
  }

  async getSettings(): Promise<{ collapsed?: boolean; theme?: string }> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const settings = await this.db.get('settings', 'ui-settings');
    return {
      collapsed: settings?.collapsed,
      theme: settings?.theme,
    };
  }

  async updateSettings(settings: { collapsed?: boolean; theme?: string }): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const existing = await this.db.get('settings', 'ui-settings');
    await this.db.put('settings', {
      key: 'ui-settings',
      ...existing,
      ...settings,
    });
  }

  // Provider settings management
  async getProviderSettings(): Promise<{
    baseUrl: string;
    useToolCalling: boolean;
    sendScreenshots: boolean;
  }> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const settings = await this.db.get('settings', 'provider-settings');
    return {
      baseUrl: settings?.baseUrl || 'https://openrouter.ai/api/v1',
      useToolCalling: settings?.useToolCalling ?? true,
      sendScreenshots: settings?.sendScreenshots ?? true,
    };
  }

  async setProviderSettings(settings: {
    baseUrl?: string;
    useToolCalling?: boolean;
    sendScreenshots?: boolean;
  }): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const existing = await this.db.get('settings', 'provider-settings');
    await this.db.put('settings', {
      key: 'provider-settings',
      ...existing,
      ...settings,
    });
  }

  // Provider-specific settings management
  async getProviderConfig(providerName: string): Promise<{
    apiKey?: string;
    model?: string;
    baseUrl?: string;
    useToolCalling?: boolean;
    sendScreenshots?: boolean;
  }> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const settings = await this.db.get('providerSettings', providerName);
    return {
      apiKey: settings?.apiKey,
      model: settings?.model,
      baseUrl: settings?.baseUrl,
      useToolCalling: settings?.useToolCalling,
      sendScreenshots: settings?.sendScreenshots,
    };
  }

  async setProviderConfig(providerName: string, config: {
    apiKey?: string;
    model?: string;
    baseUrl?: string;
    useToolCalling?: boolean;
    sendScreenshots?: boolean;
  }): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const existing = await this.db.get('providerSettings', providerName);
    await this.db.put('providerSettings', {
      provider: providerName,
      ...existing,
      ...config,
    });
  }

  async getAllProviderConfigs(): Promise<Record<string, {
    apiKey?: string;
    model?: string;
    baseUrl?: string;
    useToolCalling?: boolean;
    sendScreenshots?: boolean;
  }>> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const allConfigs = await this.db.getAll('providerSettings');
    const result: Record<string, {
      apiKey?: string;
      model?: string;
      baseUrl?: string;
      useToolCalling?: boolean;
      sendScreenshots?: boolean;
    }> = {};
    
    for (const config of allConfigs) {
      result[config.provider] = {
        apiKey: config.apiKey,
        model: config.model,
        baseUrl: config.baseUrl,
        useToolCalling: config.useToolCalling,
        sendScreenshots: config.sendScreenshots,
      };
    }
    
    return result;
  }

  // Model configurations management
  async getAllModelConfigurations(): Promise<ModelConfiguration[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    return await this.db.getAllFromIndex('modelConfigurations', 'by-date');
  }

  async getModelConfiguration(id: string): Promise<ModelConfiguration | undefined> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    return await this.db.get('modelConfigurations', id);
  }

  async saveModelConfiguration(config: ModelConfiguration): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    config.updatedAt = new Date();
    await this.db.put('modelConfigurations', config);
  }

  async deleteModelConfiguration(id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.delete('modelConfigurations', id);
  }

  async getActiveModelConfiguration(): Promise<ModelConfiguration | null> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    // First try to get from active model ID setting
    const settings = await this.db.get('settings', 'active-model');
    if (settings?.activeModelId) {
      const config = await this.getModelConfiguration(settings.activeModelId);
      if (config) return config;
    }
    
    // Fallback: find any active model
    const allConfigs = await this.getAllModelConfigurations();
    return allConfigs.find(config => config.isActive) || null;
  }

  async setActiveModelConfiguration(id: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    // Set all models to inactive
    const allConfigs = await this.getAllModelConfigurations();
    for (const config of allConfigs) {
      if (config.isActive) {
        config.isActive = false;
        await this.saveModelConfiguration(config);
      }
    }
    
    // Set the specified model as active
    const config = await this.getModelConfiguration(id);
    if (config) {
      config.isActive = true;
      await this.saveModelConfiguration(config);
      
      // Also update the active model ID setting
      await this.db.put('settings', { 
        key: 'active-model', 
        activeModelId: id 
      });
      
      // Update legacy settings for backward compatibility
      await this.setApiKey(config.apiKey);
      await this.setModel(config.model);
      await this.setProviderSettings({
        baseUrl: config.baseUrl,
        useToolCalling: config.useToolCalling,
        sendScreenshots: config.sendScreenshots,
      });
    }
  }

  async createModelConfiguration(data: {
    name: string;
    provider: string;
    model: string;
    apiKey: string;
    baseUrl: string;
    useToolCalling: boolean;
    sendScreenshots: boolean;
    docsLevel?: number; // Optional, defaults to 1
  }): Promise<ModelConfiguration> {
    const config: ModelConfiguration = {
      id: Math.random().toString(36).substring(2, 9),
      ...data,
      docsLevel: data.docsLevel || 1, // Default to level 1 docs
      isActive: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await this.saveModelConfiguration(config);
    return config;
  }

  // Code version management
  async saveCodeVersion(version: CodeVersion): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.put('codeVersions', version);
  }

  async getCodeVersion(id: string): Promise<CodeVersion | undefined> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    return await this.db.get('codeVersions', id);
  }

  async getCodeVersionsForConversation(conversationId: string): Promise<CodeVersion[]> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    return await this.db.getAllFromIndex('codeVersions', 'by-conversation', conversationId);
  }

  async deleteCodeVersionsForConversation(conversationId: string): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const versions = await this.getCodeVersionsForConversation(conversationId);
    for (const version of versions) {
      await this.db.delete('codeVersions', version.id);
    }
  }

  async createCodeVersion(data: {
    conversationId: string;
    code: string;
    description?: string;
    isAutoSaved?: boolean;
  }): Promise<CodeVersion> {
    const version: CodeVersion = {
      id: Math.random().toString(36).substring(2, 9),
      conversationId: data.conversationId,
      code: data.code,
      timestamp: new Date(),
      description: data.description,
      isAutoSaved: data.isAutoSaved || false,
    };
    
    await this.saveCodeVersion(version);
    return version;
  }

  async isVersioningEnabledForConversation(conversationId: string): Promise<boolean> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const settings = await this.db.get('settings', `versioning-${conversationId}`);
    return settings?.collapsed ?? false; // Default to false (off)
  }

  async setVersioningForConversation(conversationId: string, enabled: boolean): Promise<void> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.put('settings', { 
      key: `versioning-${conversationId}`, 
      collapsed: enabled 
    });
  }
}

export const conversationStore = new ConversationStore();
export type { ModelConfiguration, CodeVersion }; 