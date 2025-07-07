'use client';

import React, { useState, useEffect } from 'react';
import { X, Clock, Play, GitCommit, ToggleLeft, ToggleRight, GitCompare } from 'lucide-react';
import { conversationStore, type CodeVersion } from '../lib/conversationStore';
import CodeDiffViewer from './CodeDiffViewer';
import styles from './VersionHistoryModal.module.css';

interface VersionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversationId: string | null;
  onLoadVersion: (code: string) => void;
  onToggleVersioning: (enabled: boolean) => void;
  currentCode: string;
}

export default function VersionHistoryModal({
  isOpen,
  onClose,
  conversationId,
  onLoadVersion,
  onToggleVersioning,
  currentCode
}: VersionHistoryModalProps) {
  const [versions, setVersions] = useState<CodeVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState<CodeVersion | null>(null);
  const [isVersioningEnabled, setIsVersioningEnabled] = useState(false);
  const [showToggleConfirm, setShowToggleConfirm] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'diff'>('list');
  const [compareVersion, setCompareVersion] = useState<CodeVersion | null>(null);

  // Load versions when modal opens
  useEffect(() => {
    if (isOpen && conversationId) {
      loadVersions();
      loadVersioningStatus();
    }
  }, [isOpen, conversationId]);

  const loadVersions = async () => {
    if (!conversationId) return;
    
    setLoading(true);
    try {
      const versionList = await conversationStore.getCodeVersionsForConversation(conversationId);
      // Sort by timestamp, newest first
      const sortedVersions = versionList.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
      setVersions(sortedVersions);
    } catch (error) {
      console.error('Failed to load versions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadVersioningStatus = async () => {
    if (!conversationId) return;
    
    try {
      const enabled = await conversationStore.isVersioningEnabledForConversation(conversationId);
      setIsVersioningEnabled(enabled);
    } catch (error) {
      console.error('Failed to load versioning status:', error);
    }
  };

  const handleToggleVersioning = async () => {
    if (!conversationId) return;
    
    try {
      const newStatus = !isVersioningEnabled;
      await conversationStore.setVersioningForConversation(conversationId, newStatus);
      setIsVersioningEnabled(newStatus);
      setShowToggleConfirm(false);
      
      // If enabling versioning, save the current code as the first version
      if (newStatus && currentCode.trim()) {
        await conversationStore.createCodeVersion({
          conversationId: conversationId,
          code: currentCode,
          description: 'Initial version when versioning was enabled',
          isAutoSaved: false,
        });
        loadVersions(); // Reload to show the new version
      }
      
      onToggleVersioning(newStatus);
    } catch (error) {
      console.error('Failed to toggle versioning:', error);
    }
  };

  const handleLoadVersion = (version: CodeVersion) => {
    onLoadVersion(version.code);
    setSelectedVersion(version);
  };

  const handleCompareVersion = (version: CodeVersion) => {
    setCompareVersion(version);
    setViewMode('diff');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setCompareVersion(null);
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Date(timestamp).toLocaleString();
  };

  const getVersionSummary = (code: string) => {
    const lines = code.split('\n');
    const firstLine = lines.find(line => line.trim() && !line.trim().startsWith('//'));
    return firstLine ? firstLine.trim().slice(0, 50) + '...' : 'Empty code';
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Version History</h2>
          <button
            onClick={onClose}
            className={styles.closeButton}
            aria-label="Close version history"
          >
            <X size={20} />
          </button>
        </div>

        {/* Versioning Toggle */}
        <div className={styles.versioningToggle}>
          <div className={styles.toggleSection}>
            <div className={styles.toggleInfo}>
              <h3>Version History</h3>
              <p>Save code versions automatically when you hit Run</p>
            </div>
            <button
              onClick={() => setShowToggleConfirm(true)}
              className={`${styles.toggleButton} ${isVersioningEnabled ? styles.enabled : ''}`}
              aria-label={`${isVersioningEnabled ? 'Disable' : 'Enable'} versioning`}
            >
              {isVersioningEnabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
            </button>
          </div>
        </div>

        {/* Toggle Confirmation */}
        {showToggleConfirm && (
          <div className={styles.confirmDialog}>
            <div className={styles.confirmContent}>
              <h3>
                {isVersioningEnabled ? 'Disable' : 'Enable'} Version History?
              </h3>
              <p>
                {isVersioningEnabled 
                  ? 'This will stop saving new code versions. Existing versions will be preserved.' 
                  : 'This will start saving a new version each time you run code.'}
              </p>
              <div className={styles.confirmActions}>
                <button
                  onClick={() => setShowToggleConfirm(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  onClick={handleToggleVersioning}
                  className={styles.confirmButton}
                >
                  {isVersioningEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Version List or Diff View */}
        <div className={styles.versionList}>
          {viewMode === 'diff' && compareVersion ? (
            <div className={styles.diffView}>
              <div className={styles.diffViewHeader}>
                <button
                  onClick={handleBackToList}
                  className={styles.backButton}
                  aria-label="Back to version list"
                >
                  ← Back to List
                </button>
                <h3>Comparing with Current Code</h3>
              </div>
              <CodeDiffViewer
                oldCode={compareVersion.code}
                newCode={currentCode}
                oldLabel={`Version ${formatTimestamp(compareVersion.timestamp)}`}
                newLabel="Current Code"
              />
            </div>
          ) : loading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner} />
              <p>Loading versions...</p>
            </div>
          ) : versions.length === 0 ? (
            <div className={styles.emptyState}>
              <GitCommit size={48} />
              <h3>No Versions Yet</h3>
              <p>
                {isVersioningEnabled 
                  ? 'Code versions will appear here when you run code.'
                  : 'Enable version history to start tracking code changes.'}
              </p>
            </div>
          ) : (
            versions.map((version) => (
              <div
                key={version.id}
                className={`${styles.versionItem} ${selectedVersion?.id === version.id ? styles.selected : ''}`}
                onClick={() => handleLoadVersion(version)}
              >
                <div className={styles.versionInfo}>
                  <div className={styles.versionHeader}>
                    <Clock size={16} />
                    <span className={styles.timestamp}>
                      {formatTimestamp(version.timestamp)}
                    </span>
                    {version.isAutoSaved && (
                      <span className={styles.autoSavedBadge}>Auto</span>
                    )}
                  </div>
                  {version.description && (
                    <p className={styles.description}>{version.description}</p>
                  )}
                  <p className={styles.codeSummary}>
                    {getVersionSummary(version.code)}
                  </p>
                </div>
                <div className={styles.versionActions}>
                  <button
                    className={styles.compareButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCompareVersion(version);
                    }}
                    aria-label="Compare with current"
                  >
                    <GitCompare size={16} />
                  </button>
                  <button
                    className={styles.loadButton}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLoadVersion(version);
                    }}
                    aria-label="Load this version"
                  >
                    <Play size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className={styles.modalFooter}>
          <p className={styles.footerText}>
            {versions.length > 0 && `${versions.length} version${versions.length === 1 ? '' : 's'} saved`}
          </p>
        </div>
      </div>
    </div>
  );
} 