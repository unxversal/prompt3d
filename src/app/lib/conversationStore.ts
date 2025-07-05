import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Conversation, Message } from '../types/ai';

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
    };
  };
}

class ConversationStore {
  private db: IDBPDatabase<ConversationDB> | null = null;

  async init(): Promise<void> {
    if (this.db) return;

    this.db = await openDB<ConversationDB>('c3d-conversations', 2, {
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
  }> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const settings = await this.db.get('settings', 'provider-settings');
    return {
      baseUrl: settings?.baseUrl || 'https://openrouter.ai/api/v1',
      useToolCalling: settings?.useToolCalling ?? true,
    };
  }

  async setProviderSettings(settings: {
    baseUrl?: string;
    useToolCalling?: boolean;
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
  }> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const settings = await this.db.get('providerSettings', providerName);
    return {
      apiKey: settings?.apiKey,
      model: settings?.model,
      baseUrl: settings?.baseUrl,
      useToolCalling: settings?.useToolCalling,
    };
  }

  async setProviderConfig(providerName: string, config: {
    apiKey?: string;
    model?: string;
    baseUrl?: string;
    useToolCalling?: boolean;
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
  }>> {
    await this.init();
    if (!this.db) throw new Error('Database not initialized');
    
    const allConfigs = await this.db.getAll('providerSettings');
    const result: Record<string, {
      apiKey?: string;
      model?: string;
      baseUrl?: string;
      useToolCalling?: boolean;
    }> = {};
    
    for (const config of allConfigs) {
      result[config.provider] = {
        apiKey: config.apiKey,
        model: config.model,
        baseUrl: config.baseUrl,
        useToolCalling: config.useToolCalling,
      };
    }
    
    return result;
  }
}

export const conversationStore = new ConversationStore(); 