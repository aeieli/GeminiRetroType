import React, { useState, useEffect, useRef } from 'react';
import { Sticker } from '../types';

interface StickerWallProps {
  stickers: Sticker[];
  onRemoveSticker: (id: string) => void;
  onUpdateStickerPosition?: (id: string, x: number, y: number) => void;
}

export const StickerWall: React.FC<StickerWallProps> = ({ stickers, onRemoveSticker, onUpdateStickerPosition }) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const dragOffsetRef = useRef<{x: number, y: number}>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent, id: string, x: number, y: number) => {
    e.stopPropagation(); // Prevent removing or other clicks
    if (!onUpdateStickerPosition) return;

    setDraggedId(id);
    dragOffsetRef.current = {
        x: e.clientX - x,
        y: e.clientY - y
    };
  };

  useEffect(() => {
      if (!draggedId || !onUpdateStickerPosition) return;

      const handleMouseMove = (e: MouseEvent) => {
          const newX = e.clientX - dragOffsetRef.current.x;
          const newY = e.clientY - dragOffsetRef.current.y;
          onUpdateStickerPosition(draggedId, newX, newY);
      };

      const handleMouseUp = () => {
          setDraggedId(null);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      
      return () => {
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
      };
  }, [draggedId, onUpdateStickerPosition]);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none h-full w-full">
      {stickers.map((sticker) => (
        <div
          key={sticker.id}
          className={`
            absolute p-6 pt-8 pb-8 shadow-[0_10px_30px_rgba(0,0,0,0.2)] 
            transition-transform duration-75
            cursor-grab active:cursor-grabbing pointer-events-auto group bg-[#fdfbf7]
            ${draggedId === sticker.id ? 'z-50 scale-105 shadow-2xl' : 'hover:scale-105 hover:z-40'}
          `}
          style={{
            top: `${sticker.y}px`,
            left: `${sticker.x}px`,
            transform: `rotate(${sticker.rotation}deg) ${draggedId === sticker.id ? 'scale(1.05)' : 'scale(1)'}`,
            width: '280px',
            clipPath: sticker.clipPath, 
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")',
          }}
          onMouseDown={(e) => handleMouseDown(e, sticker.id, sticker.x, sticker.y)}
        >
          {/* Tape visual */}
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-12 h-6 bg-yellow-200/40 backdrop-blur-sm shadow-sm rotate-2"></div>

          {/* Delete Button (visible on hover) */}
          <button 
            className="absolute top-2 right-2 w-6 h-6 bg-red-500/20 rounded-full text-red-800 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/40 z-20"
            onClick={(e) => { e.stopPropagation(); onRemoveSticker(sticker.id); }}
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