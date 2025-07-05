'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import styles from './ResizableSplitter.module.css';

interface ResizableSplitterProps {
  onResize: (width: number) => void;
  initialWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  orientation?: 'vertical' | 'horizontal';
}

export default function ResizableSplitter({
  onResize,
  initialWidth = 480,
  minWidth = 320,
  maxWidth = 800,
  orientation = 'vertical'
}: ResizableSplitterProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0, width: 0 });
  const [currentWidth, setCurrentWidth] = useState(initialWidth);
  const splitterRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY, width: currentWidth });
  }, [currentWidth]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const newWidth = Math.max(minWidth, Math.min(maxWidth, dragStart.width + deltaX));
    
    if (newWidth !== currentWidth) {
      setCurrentWidth(newWidth);
      onResize(newWidth);
    }
  }, [isDragging, dragStart.x, dragStart.width, currentWidth, minWidth, maxWidth, onResize]);

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      setIsDragging(false);
      setDragStart({ x: 0, y: 0, width: 0 });
    }
  }, [isDragging]);

  // Update currentWidth when initialWidth changes
  useEffect(() => {
    setCurrentWidth(initialWidth);
  }, [initialWidth]);

  // Mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = orientation === 'vertical' ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isDragging, handleMouseMove, handleMouseUp, orientation]);

  return (
    <div
      ref={splitterRef}
      className={`${styles.splitter} ${orientation === 'vertical' ? styles.vertical : styles.horizontal} ${isDragging ? styles.dragging : ''}`}
      onMouseDown={handleMouseDown}
    >
      <div className={styles.splitterHandle} />
      {isDragging && (
        <div className={styles.dragIndicator}>
          {Math.round(currentWidth)}px
        </div>
      )}
    </div>
  );
} 