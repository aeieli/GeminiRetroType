import React, { useState, useEffect } from 'react';
import { CharData } from '../types';

interface PaperProps {
  chars: CharData[];
  compositionText?: string;
  onTear: () => void;
  isTyping: boolean;
  lineIndex: number;
  colIndex: number;
  scale?: number;
  cursorIndex: number;
}

export const Paper: React.FC<PaperProps> = ({ 
    chars, 
    compositionText = '', 
    onTear, 
    isTyping, 
    lineIndex, 
    colIndex, 
    scale = 1,
    cursorIndex
}) => {
  const [offsetY, setOffsetY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(0);
  const [isTearing, setIsTearing] = useState(false);

  // --- MEASUREMENTS ---
  const FONT_SIZE = 22;
  const LINE_HEIGHT = 32; 
  const CHAR_WIDTH = 13.22; 
  
  const PAPER_PADDING_LEFT = 50; 
  const PAPER_WIDTH = 440;
  const HALF_PAPER = PAPER_WIDTH / 2;
  const BASE_OFFSET_X = HALF_PAPER - PAPER_PADDING_LEFT;
  
  // Adjusted to 40 to lift paper higher so text clears the ruler
  const BASE_OFFSET_Y = 40; 
  
  const carriageTranslateX = BASE_OFFSET_X - (colIndex * CHAR_WIDTH);

  const TEAR_THRESHOLD = 200;

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (chars.length === 0) return;
    setIsDragging(true);
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragStartY(clientY);
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || isTearing) return;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    // Adjust delta by scale so mouse movement maps 1:1 to object movement visually
    const deltaY = (clientY - dragStartY) / scale;
    
    if (deltaY < 0) {
      setOffsetY(deltaY);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging || isTearing) return;
    if (Math.abs(offsetY) > TEAR_THRESHOLD) {
      setIsTearing(true);
      setTimeout(() => {
        onTear();
        setIsTearing(false);
        setOffsetY(0);
      }, 400);
    } else {
      setOffsetY(0);
    }
    setIsDragging(false);
    setDragStartY(0);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleMouseMove);
      window.addEventListener('touchend', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, offsetY, isTearing, scale]);

  const verticalScroll = -(lineIndex * LINE_HEIGHT);
  const totalTranslationY = verticalScroll + offsetY;

  // Helper to map logical insertion point for composition
  const renderContent = () => {
      const elements: React.ReactNode[] = [];
      let activeCount = 0;
      let compositionInserted = false;

      const insertComposition = () => {
          if (!compositionInserted && compositionText) {
              elements.push(
                  <span key="comp" className="bg-blue-100/50 text-blue-800 border-b-2 border-blue-400 min-w-[10px] inline-block align-baseline">
                      {compositionText}
                  </span>
              );
              compositionInserted = true;
          }
      };

      chars.forEach((c) => {
          if (!c.isDeleted) {
              if (activeCount === cursorIndex) {
                  insertComposition();
              }
              activeCount++;
          }
          
          if (c.isDeleted) {
              // Deleted Char Rendering
              elements.push(
                  <span 
                    key={c.id} 
                    className="inline-block w-0 overflow-visible pointer-events-none align-top"
                  >
                      <span className="relative text-red-700/70 font-medium">
                        {/* Render newline as symbol if deleted to prevent layout break */}
                        {c.char === '\n' ? '↵' : c.char}
                        {/* Custom Strikethrough Line */}
                        <span className="absolute top-1/2 left-[-2px] right-[-2px] h-[2px] bg-red-600/80 rotate-[-10deg]"></span>
                      </span>
                  </span>
              );
          } else {
              elements.push(<span key={c.id}>{c.char}</span>);
          }
      });
      
      // If cursor is at the very end
      if (!compositionInserted && activeCount === cursorIndex) {
          insertComposition();
      }
      
      return elements;
  };

  return (
    <div 
      className="relative flex flex-col items-center z-0"
      style={{
          transform: `translateX(${carriageTranslateX}px)`,
          transition: isDragging ? 'none' : 'transform 0.1s cubic-bezier(0.1, 0.7, 0.1, 1)', 
      }}
    >
      
      {/* The Paper Sheet */}
      <div 
        onMouseDown={handleMouseDown}
        onTouchStart={handleMouseDown}
        className={`
          relative bg-[#fdfbf7] shadow-xl origin-bottom
          cursor-grab active:cursor-grabbing pointer-events-auto
          px-[50px] pb-48 box-border
        `}
        style={{
            width: `${PAPER_WIDTH}px`,
            minHeight: '500px',
            transform: isTearing 
                ? `translateY(-1000px) rotate(${Math.random() * 10 - 5}deg)` 
                : `translateY(${BASE_OFFSET_Y + totalTranslationY}px)`,
            transition: isTearing ? 'transform 0.4s ease-in' : 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)', 
            backgroundImage: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.02) 100%), url("https://www.transparenttextures.com/patterns/cream-paper.png")',
        }}
      >
         {/* Top Margin */}
         <div className="h-16 w-full"></div>

         {/* Text Content */}
         <div 
            className="font-typewriter text-stone-900 opacity-90"
            style={{
                fontSize: `${FONT_SIZE}px`,
                lineHeight: `${LINE_HEIGHT}px`,
                letterSpacing: '0px',
                textShadow: isTyping ? '0 0 1px rgba(0,0,0,0.4)' : 'none',
                whiteSpace: 'pre', // CRITICAL: Ensures line breaks match logical \n count
                wordBreak: 'keep-all', // Prevent auto-wrapping
                overflow: 'visible'
            }}
         >
           {renderContent()}
         </div>
      </div>
    </div>
  );
};