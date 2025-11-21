import React, { useState, useEffect, useRef } from 'react';
import { Sticker } from '../types';

interface StickerWallProps {
  stickers: Sticker[];
  onRemoveSticker: (id: string) => void;
  onUpdateSticker: (id: string, updates: Partial<Sticker>) => void;
}

export const StickerWall: React.FC<StickerWallProps> = ({ stickers, onRemoveSticker, onUpdateSticker }) => {
  const [activeSticker, setActiveSticker] = useState<{ id: string, mode: 'MOVE' | 'ROTATE' } | null>(null);
  
  // Ref to track initial click position and initial values
  const dragStartRef = useRef<{x: number, y: number, initialRotation: number, initialX: number, initialY: number}>({ 
      x: 0, y: 0, initialRotation: 0, initialX: 0, initialY: 0 
  });

  const handleMouseDown = (e: React.MouseEvent, sticker: Sticker) => {
    e.stopPropagation(); 
    if (!onUpdateSticker) return;

    // Detect Button: 0 = Left (Move), 2 = Right (Rotate)
    const mode = e.button === 2 ? 'ROTATE' : 'MOVE';
    
    setActiveSticker({ id: sticker.id, mode });
    
    dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        initialX: sticker.x,
        initialY: sticker.y,
        initialRotation: sticker.rotation
    };
  };

  // Prevent default context menu for right click
  const handleContextMenu = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
  };

  useEffect(() => {
      if (!activeSticker || !onUpdateSticker) return;

      const handleMouseMove = (e: MouseEvent) => {
          const dx = e.clientX - dragStartRef.current.x;
          const dy = e.clientY - dragStartRef.current.y;

          if (activeSticker.mode === 'MOVE') {
              const newX = dragStartRef.current.initialX + dx;
              const newY = dragStartRef.current.initialY + dy;
              onUpdateSticker(activeSticker.id, { x: newX, y: newY });
          } else if (activeSticker.mode === 'ROTATE') {
              // Simple mapping: horizontal drag controls rotation
              // Sensitivity: 1 pixel = 0.5 degrees
              const rotationDelta = dx * 0.5;
              const newRotation = dragStartRef.current.initialRotation + rotationDelta;
              onUpdateSticker(activeSticker.id, { rotation: newRotation });
          }
      };

      const handleMouseUp = () => {
          setActiveSticker(null);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
      };
  }, [activeSticker, onUpdateSticker]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none h-full w-full">
      {stickers.map((sticker) => (
        <div
          key={sticker.id}
          className={`
            absolute p-6 pt-8 pb-8 shadow-[0_10px_30px_rgba(0,0,0,0.2)] 
            transition-transform duration-75
            cursor-grab active:cursor-grabbing pointer-events-auto group bg-[#fdfbf7]
            ${activeSticker?.id === sticker.id ? 'z-50 scale-105 shadow-2xl' : 'hover:scale-105 hover:z-40'}
          `}
          style={{
            top: `${sticker.y}px`,
            left: `${sticker.x}px`,
            // Apply local transform for rotation
            transform: `rotate(${sticker.rotation}deg) ${activeSticker?.id === sticker.id ? 'scale(1.05)' : 'scale(1)'}`,
            width: '280px',
            clipPath: sticker.clipPath, 
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
          }}
          onMouseDown={(e) => handleMouseDown(e, sticker)}
          onContextMenu={handleContextMenu}
        >
          {/* Tape visual */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-yellow-200/40 backdrop-blur-sm shadow-sm rotate-2"></div>

          {/* Delete Button (visible on hover) */}
          <button 
            className="absolute top-2 right-2 w-6 h-6 bg-red-500/20 rounded-full text-red-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/40 z-20"
            onClick={(e) => { e.stopPropagation(); onRemoveSticker(sticker.id); }}
            onMouseDown={(e) => e.stopPropagation()} // Prevent starting drag on delete
            title="Remove"
          >
            ×
          </button>

          {/* IMPORTANT: pointer-events-none ensures mouse events pass through text to the container for dragging */}
          <div className="font-sticker text-stone-900 text-lg leading-snug whitespace-pre-wrap break-words opacity-90 pointer-events-none">
            {sticker.content.map((c) => (
              <span 
                key={c.id} 
                className={c.isDeleted ? "line-through decoration-red-600 decoration-[3px]" : ""}
              >
                {c.char}
              </span>
            ))}
          </div>
          
          {/* Timestamp footer */}
          <div className="mt-4 text-[10px] font-mono text-stone-400 text-right uppercase tracking-widest pointer-events-none">
            {new Date(sticker.timestamp).toLocaleDateString()}
          </div>
        </div>
      ))}
      
      {stickers.length === 0 && (
        <div className="absolute top-10 left-0 w-full text-center pointer-events-none opacity-20">
          <h1 className="font-['Special_Elite'] text-6xl text-[#d6cba9] tracking-tighter drop-shadow-xl">RETRO TYPE</h1>
          <p className="font-mono text-[#d6cba9] mt-2 tracking-[0.5em]">MINI STUDIO</p>
        </div>
      )}
    </div>
  );
};