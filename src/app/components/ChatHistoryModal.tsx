import React, { useState, useEffect } from 'react';
import { 
  X, 
  MessageCircle, 
  Trash2, 
  Edit3, 
  Copy, 
  Download, 
  Calendar,
  Search,
  Plus,
  Square,
  CheckSquare
} from 'lucide-react';
import { toast } from 'sonner';
import { conversationStore } from '../lib/conversationStore';
import { Conversation } from '../types/ai';
import styles from './ChatHistoryModal.module.css';

interface ChatHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNewChat: () => void;
  onLoadConversation: (conversation: Conversation) => void;
  onConversationRenamed?: (conversationId: string, newTitle: string) => void;
  currentCode: string;
}

export default function ChatHistoryModal({ 
  isOpen, 
  onClose, 
  onNewChat,
  onLoadConversation,
  onConversationRenamed,
  currentCode 
}: ChatHistoryModalProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);
  const [confirmingDeleteAll, setConfirmingDeleteAll] = useState(false);
  const [confirmingDeleteSelected, setConfirmingDeleteSelected] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadConversations();
    }
  }, [isOpen]);

  useEffect(() => {
    // Filter conversations based on search term
    const filtered = conversations.filter(conv =>
      conv.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.messages.some(msg => 
        msg.content.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    setFilteredConversations(filtered);
  }, [conversations, searchTerm]);

  const loadConversations = async () => {
    setIsLoading(true);
    try {
      const allConversations = await conversationStore.getAllConversations();
      // Sort by most recent first
      const sorted = allConversations.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
      setConversations(sorted);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      toast.error('Failed to load conversation history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRename = async (id: string, newTitle: string) => {
    if (!newTitle.trim()) {
      toast.error('Title cannot be empty');
      return;
    }

    try {
      const conversation = await conversationStore.getConversation(id);
      if (!conversation) {
        toast.error('Conversation not found');
        return;
      }

      const updatedConversation = {
        ...conversation,
        title: newTitle.trim(),
        updatedAt: new Date()
      };

      await conversationStore.saveConversation(updatedConversation);
      await loadConversations();
      setEditingId(null);
      setEditingTitle('');
      toast.success('Conversation renamed successfully');
      if (onConversationRenamed) {
        onConversationRenamed(id, newTitle);
      }
    } catch (error) {
      console.error('Failed to rename conversation:', error);
      toast.error('Failed to rename conversation');
    }
  };

  const handleDelete = async (id: string) => {
    setConfirmingDeleteId(id);
  };

  const confirmDelete = async () => {
    if (!confirmingDeleteId) return;

    const conversationToDelete = conversations.find(c => c.id === confirmingDeleteId);
    if (!conversationToDelete) return;

    try {
      await conversationStore.deleteConversation(confirmingDeleteId);
      setConversations(prev => prev.filter(c => c.id !== confirmingDeleteId));
      setSelectedIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(confirmingDeleteId);
        return newSet;
      });
      toast.success('Conversation deleted successfully');
      
      // If the currently loaded chat was deleted, start a new one
      onNewChat();

    } catch (error) {
      console.error('Failed to delete conversation:', error);
      toast.error('Failed to delete conversation');
    } finally {
      setConfirmingDeleteId(null);
    }
  };

  const cancelDelete = () => {
    setConfirmingDeleteId(null);
  };

  const handleDuplicate = async (conversation: Conversation) => {
    try {
      const duplicatedConversation: Conversation = {
        ...conversation,
        id: crypto.randomUUID(),
        title: `${conversation.title} (Copy)`,
        createdAt: new Date(),
        updatedAt: new Date(),
        // Reset message IDs
        messages: conversation.messages.map(msg => ({
          ...msg,
          id: crypto.randomUUID()
        }))
      };

      await conversationStore.saveConversation(duplicatedConversation);
      await loadConversations();
      toast.success('Conversation duplicated successfully');
    } catch (error) {
      console.error('Failed to duplicate conversation:', error);
      toast.error('Failed to duplicate conversation');
    }
  };

  const handleDownloadModel = async (conversation: Conversation) => {
    try {
      // Find the last code update in the conversation
      let lastCode = currentCode; // fallback to current code
      
      // Look for write_code or edit_code function calls in reverse order
      for (let i = conversation.messages.length - 1; i >= 0; i--) {
        const message = conversation.messages[i];
        if (message.metadata?.functionCall) {
          const funcCall = message.metadata.functionCall;
          if ((funcCall.name === 'write_code' || funcCall.name === 'edit_code') && funcCall.arguments.code) {
            lastCode = funcCall.arguments.code as string;
            break;
          }
        }
      }

      // Create and download the TypeScript file
      const blob = new Blob([lastCode], { type: 'text/typescript' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${conversation.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ts`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Model code downloaded successfully');
    } catch (error) {
      console.error('Failed to download model:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast.error('Failed to download model code', {
        description: errorMessage.slice(0, 80) + (errorMessage.length > 80 ? '...' : ''),
      });
    }
  };

  const startEditing = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditingTitle(conversation.title);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingTitle('');
  };

  const handleLoadConversation = (conversation: Conversation) => {
    onLoadConversation(conversation);
    onClose();
    toast.success(`Loaded conversation: ${conversation.title}`);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getMessagePreview = (conversation: Conversation) => {
    const userMessages = conversation.messages.filter(msg => msg.role === 'user');
    if (userMessages.length > 0) {
      const lastUserMessage = userMessages[userMessages.length - 1];
      return lastUserMessage.content.slice(0, 100) + (lastUserMessage.content.length > 100 ? '...' : '');
    }
    return 'No messages';
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return;
    setConfirmingDeleteSelected(true);
  };

  const confirmDeleteSelected = async () => {
    try {
      const deletePromises = Array.from(selectedIds).map(id => 
        conversationStore.deleteConversation(id)
      );
      await Promise.all(deletePromises);
      
      setConversations(prev => prev.filter(c => !selectedIds.has(c.id)));
      setSelectedIds(new Set());
      setSelectionMode(false);
      toast.success(`${selectedIds.size} conversations deleted successfully`);
      
      // If we deleted all conversations, start a new one
      if (selectedIds.size === conversations.length) {
        onNewChat();
      }
    } catch (error) {
      console.error('Failed to delete selected conversations:', error);
      toast.error('Failed to delete selected conversations');
    } finally {
      setConfirmingDeleteSelected(false);
    }
  };

  const handleDeleteAll = async () => {
    setConfirmingDeleteAll(true);
  };

  const confirmDeleteAll = async () => {
    try {
      await conversationStore.deleteAllChats();
      setConversations([]);
      setSelectedIds(new Set());
      setSelectionMode(false);
      toast.success('All conversations deleted successfully');
      onNewChat();
    } catch (error) {
      console.error('Failed to delete all conversations:', error);
      toast.error('Failed to delete all conversations');
    } finally {
      setConfirmingDeleteAll(false);
    }
  };

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    setSelectedIds(new Set(filteredConversations.map(c => c.id)));
  };

  const selectNone = () => {
    setSelectedIds(new Set());
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    if (!selectionMode) {
      setSelectedIds(new Set());
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <MessageCircle size={20} />
            <h2>Chat History</h2>
          </div>
          <div className={styles.headerActions}>
            {conversations.length > 0 && (
              <>
                <button
                  onClick={toggleSelectionMode}
                  className={`${styles.selectionButton} ${selectionMode ? styles.active : ''}`}
                  title={selectionMode ? "Cancel selection" : "Select conversations"}
                >
                  {selectionMode ? <X size={16} /> : <CheckSquare size={16} />}
                  {selectionMode ? "Cancel" : "Select"}
                </button>
                {selectionMode && (
                  <>
                    <button
                      onClick={selectAll}
                      className={styles.selectAllButton}
                      title="Select all"
                    >
                      <CheckSquare size={16} />
                      All
                    </button>
                    <button
                      onClick={selectNone}
                      className={styles.selectNoneButton}
                      title="Select none"
                    >
                      <Square size={16} />
                      None
                    </button>
                    <button
                      onClick={handleDeleteSelected}
                      className={styles.deleteSelectedButton}
                      disabled={selectedIds.size === 0}
                      title={`Delete ${selectedIds.size} selected`}
                    >
                      <Trash2 size={16} />
                      Delete ({selectedIds.size})
                    </button>
                  </>
                )}
                <button
                  onClick={handleDeleteAll}
                  className={styles.deleteAllButton}
                  title="Delete all conversations"
                >
                  <Trash2 size={16} />
                  Delete All
                </button>
              </>
            )}
            <button
              onClick={onNewChat}
              className={styles.newChatButton}
              title="Start new chat"
            >
              <Plus size={16} />
              New Chat
            </button>
            <button onClick={onClose} className={styles.closeButton}>
              <X size={16} />
            </button>
          </div>
        </div>

        <div className={styles.searchContainer}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.content}>
          {isLoading ? (
            <div className={styles.loading}>Loading conversations...</div>
          ) : filteredConversations.length === 0 ? (
            <div className={styles.empty}>
              {conversations.length === 0 ? (
                <>
                  <MessageCircle size={48} className={styles.emptyIcon} />
                  <h3>No conversations yet</h3>
                  <p>Start a new conversation to see it here</p>
                  <button onClick={onNewChat} className={styles.newChatButton}>
                    <Plus size={16} />
                    Start First Chat
                  </button>
                </>
              ) : (
                <>
                  <Search size={48} className={styles.emptyIcon} />
                  <h3>No matches found</h3>
                  <p>Try a different search term</p>
                </>
              )}
            </div>
          ) : (
            <div className={styles.conversationList}>
              {filteredConversations.map((conversation) => (
                <div key={conversation.id} className={`${styles.conversationItem} ${selectedIds.has(conversation.id) ? styles.selected : ''}`}>
                  {selectionMode && (
                    <div className={styles.selectionCheckbox}>
                      <button
                        onClick={() => toggleSelection(conversation.id)}
                        className={styles.checkboxButton}
                      >
                        {selectedIds.has(conversation.id) ? 
                          <CheckSquare size={18} className={styles.checked} /> : 
                          <Square size={18} />
                        }
                      </button>
                    </div>
                  )}
                  
                  <div 
                    className={styles.conversationMain}
                    onClick={() => selectionMode ? toggleSelection(conversation.id) : handleLoadConversation(conversation)}
                  >
                    <div className={styles.conversationInfo}>
                      {editingId === conversation.id ? (
                        <input
                          type="text"
                          value={editingTitle}
                          onChange={(e) => setEditingTitle(e.target.value)}
                          onBlur={() => handleRename(conversation.id, editingTitle)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleRename(conversation.id, editingTitle);
                            } else if (e.key === 'Escape') {
                              cancelEditing();
                            }
                          }}
                          className={styles.editInput}
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <>
                          <h3 className={styles.conversationTitle}>
                            {conversation.title}
                          </h3>
                          <p className={styles.conversationPreview}>
                            {getMessagePreview(conversation)}
                          </p>
                          <div className={styles.conversationMeta}>
                            <Calendar size={12} />
                            <span>{formatDate(new Date(conversation.updatedAt))}</span>
                            <span className={styles.messageCount}>
                              {conversation.messages.length} messages
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {!selectionMode && (
                    <div className={styles.conversationActions}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadModel(conversation);
                        }}
                        className={styles.actionButton}
                        title="Download model code"
                      >
                        <Download size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(conversation);
                        }}
                        className={styles.actionButton}
                        title="Rename conversation"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDuplicate(conversation);
                        }}
                        className={styles.actionButton}
                        title="Duplicate conversation"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(conversation.id);
                        }}
                        className={styles.actionButton}
                        title="Delete conversation"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                  
                  {confirmingDeleteId === conversation.id && (
                    <div className={styles.confirmDeleteActions}>
                      <span>Delete?</span>
                      <button onClick={confirmDelete} className={styles.confirmButton}>Yes</button>
                      <button onClick={cancelDelete} className={styles.cancelConfirmButton}>No</button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Confirmation modals */}
        {confirmingDeleteAll && (
          <div className={styles.confirmModal}>
            <div className={styles.confirmContent}>
              <h3>Delete All Conversations?</h3>
              <p>This will permanently delete all {conversations.length} conversations and cannot be undone.</p>
              <div className={styles.confirmActions}>
                <button onClick={() => setConfirmingDeleteAll(false)} className={styles.cancelButton}>
                  Cancel
                </button>
                <button onClick={confirmDeleteAll} className={styles.deleteButton}>
                  Delete All
                </button>
              </div>
            </div>
          </div>
        )}

        {confirmingDeleteSelected && (
          <div className={styles.confirmModal}>
            <div className={styles.confirmContent}>
              <h3>Delete Selected Conversations?</h3>
              <p>This will permanently delete {selectedIds.size} selected conversations and cannot be undone.</p>
              <div className={styles.confirmActions}>
                <button onClick={() => setConfirmingDeleteSelected(false)} className={styles.cancelButton}>
                  Cancel
                </button>
                <button onClick={confirmDeleteSelected} className={styles.deleteButton}>
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
} 