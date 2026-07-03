"use client";
import React from 'react';

export default function Verse({ verseId, vNum, text, highlights, onHighlight, onRemoveHighlight }) {
  
  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer.nodeType === 3 
      ? range.commonAncestorContainer.parentElement.closest('.verse-body') 
      : range.commonAncestorContainer.closest('.verse-body');

    if (!container) return;

    const preRange = range.cloneRange();
    preRange.selectNodeContents(container);
    preRange.setEnd(range.startContainer, range.startOffset);
    
    const start = preRange.toString().length;
    const end = start + selection.toString().length;

    if (onHighlight) {
      onHighlight(verseId, start, end);
    }
    selection.removeAllRanges();
  };

  const renderContent = () => {
    if (!highlights || highlights.length === 0) return text;

    // Build a map of character positions to highlight objects
    const charMap = new Array(text.length).fill(null);
    highlights.forEach(h => {
      const s = h.start ?? h.offset ?? 0;
      const e = h.end ?? (s + (h.text?.length || 0));
      for (let i = s; i < e; i++) {
        if (i < charMap.length) charMap[i] = h; 
      }
    });

    const segments = [];
    let currentChunkText = "";
    let activeHighlightForChunk = charMap[0];

    for (let i = 0; i <= text.length; i++) {
      const charHighlight = i < text.length ? charMap[i] : "END_OF_TEXT";

      if (charHighlight === activeHighlightForChunk) {
        currentChunkText += text[i];
      } else {
        if (currentChunkText) {
          // LOCK IN the highlight object for this specific segment
          const segmentHighlight = activeHighlightForChunk;
          
          segments.push(
            segmentHighlight ? (
              <mark 
                key={`mark-${i}`} 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (onRemoveHighlight && segmentHighlight) {
                    onRemoveHighlight(verseId, segmentHighlight);
                  }
                }}
                className="bg-yellow-100/70 border-b-2 border-yellow-300 text-inherit px-0.5 rounded-sm cursor-pointer hover:bg-red-50 hover:border-red-200 transition-colors"
                title="Click to remove highlight"
              >
                {currentChunkText}
              </mark>
            ) : (
              <span key={`span-${i}`}>{currentChunkText}</span>
            )
          );
        }
        
        if (i < text.length) {
          currentChunkText = text[i];
          activeHighlightForChunk = charMap[i];
        }
      }
    }
    return segments;
  };

  return (
    <div className="mb-6 flex items-start group font-serif text-xl leading-relaxed text-stone-800">
      <span className="text-xs text-stone-300 font-sans mr-4 font-bold select-none mt-2 w-6 text-right shrink-0">
        {vNum}
      </span>
      <div className="verse-body flex-1 cursor-text" onMouseUp={handleMouseUp}>
        {renderContent()}
      </div>
    </div>
  );
}