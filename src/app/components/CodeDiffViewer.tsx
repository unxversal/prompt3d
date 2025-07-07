'use client';

import React from 'react';
import styles from './CodeDiffViewer.module.css';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineNumber?: number;
}

interface CodeDiffViewerProps {
  oldCode: string;
  newCode: string;
  oldLabel?: string;
  newLabel?: string;
}

export default function CodeDiffViewer({
  oldCode,
  newCode,
  oldLabel = 'Previous Version',
  newLabel = 'Current Version'
}: CodeDiffViewerProps) {
  
  // Simple diff algorithm - split by lines and compare
  const generateDiff = (oldText: string, newText: string): DiffLine[] => {
    const oldLines = oldText.split('\n');
    const newLines = newText.split('\n');
    const diff: DiffLine[] = [];
    
    // Use a simple line-by-line comparison
    // This is a simplified diff - a more sophisticated algorithm would use
    // longest common subsequence (LCS) for better results
    let oldIndex = 0;
    let newIndex = 0;
    
    while (oldIndex < oldLines.length || newIndex < newLines.length) {
      const oldLine = oldIndex < oldLines.length ? oldLines[oldIndex] : null;
      const newLine = newIndex < newLines.length ? newLines[newIndex] : null;
      
      if (oldLine === null) {
        // Only new lines left
        diff.push({
          type: 'added',
          content: newLine || '',
          lineNumber: newIndex + 1
        });
        newIndex++;
      } else if (newLine === null) {
        // Only old lines left
        diff.push({
          type: 'removed',
          content: oldLine,
          lineNumber: oldIndex + 1
        });
        oldIndex++;
      } else if (oldLine === newLine) {
        // Lines are the same
        diff.push({
          type: 'unchanged',
          content: oldLine,
          lineNumber: newIndex + 1
        });
        oldIndex++;
        newIndex++;
      } else {
        // Lines are different - try to find if the old line appears later in new
        const foundInNew = newLines.slice(newIndex + 1).indexOf(oldLine);
        const foundInOld = oldLines.slice(oldIndex + 1).indexOf(newLine);
        
        if (foundInNew !== -1 && (foundInOld === -1 || foundInNew < foundInOld)) {
          // Old line found later in new, treat current new line as added
          diff.push({
            type: 'added',
            content: newLine,
            lineNumber: newIndex + 1
          });
          newIndex++;
        } else if (foundInOld !== -1) {
          // New line found later in old, treat current old line as removed
          diff.push({
            type: 'removed',
            content: oldLine,
            lineNumber: oldIndex + 1
          });
          oldIndex++;
        } else {
          // Lines are just different, treat as removed + added
          diff.push({
            type: 'removed',
            content: oldLine,
            lineNumber: oldIndex + 1
          });
          diff.push({
            type: 'added',
            content: newLine,
            lineNumber: newIndex + 1
          });
          oldIndex++;
          newIndex++;
        }
      }
    }
    
    return diff;
  };

  const diffLines = generateDiff(oldCode, newCode);

  const formatLineNumber = (lineNumber: number | undefined) => {
    return lineNumber ? lineNumber.toString().padStart(3, ' ') : '   ';
  };

  const getChangeStats = () => {
    const added = diffLines.filter(line => line.type === 'added').length;
    const removed = diffLines.filter(line => line.type === 'removed').length;
    return { added, removed };
  };

  const stats = getChangeStats();

  return (
    <div className={styles.diffViewer}>
      <div className={styles.diffHeader}>
        <div className={styles.diffLabels}>
          <span className={styles.oldLabel}>{oldLabel}</span>
          <span className={styles.newLabel}>{newLabel}</span>
        </div>
        <div className={styles.diffStats}>
          {stats.added > 0 && (
            <span className={styles.addedStat}>+{stats.added}</span>
          )}
          {stats.removed > 0 && (
            <span className={styles.removedStat}>-{stats.removed}</span>
          )}
        </div>
      </div>
      
      <div className={styles.diffContent}>
        {diffLines.length === 0 ? (
          <div className={styles.noDiff}>
            <p>No differences found</p>
          </div>
        ) : (
          <div className={styles.diffLines}>
            {diffLines.map((line, index) => (
              <div
                key={index}
                className={`${styles.diffLine} ${styles[line.type]}`}
              >
                <span className={styles.lineNumber}>
                  {formatLineNumber(line.lineNumber)}
                </span>
                <span className={styles.diffMarker}>
                  {line.type === 'added' ? '+' : line.type === 'removed' ? '-' : ' '}
                </span>
                <span className={styles.lineContent}>
                  {line.content || ' '}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 