import React, { useEffect, useState } from 'react';
import { Key } from './Key';
import { KeyConfig, KeyType } from '../types';

interface KeyboardProps {
  onKeyPress: (key: KeyConfig) => void;
  onInspire: () => void;
  isGhostWriting: boolean;
  externalPressedKey?: string | null;
}

const KEYS_ROW_1: KeyConfig[] = [
  { label: 'Q', code: 'KeyQ', type: KeyType.CHAR },
  { label: 'W', code: 'KeyW', type: KeyType.CHAR },
  { label: 'E', code: 'KeyE', type: KeyType.CHAR },
  { label: 'R', code: 'KeyR', type: KeyType.CHAR },
  { label: 'T', code: 'KeyT', type: KeyType.CHAR },
  { label: 'Y', code: 'KeyY', type: KeyType.CHAR },
  { label: 'U', code: 'KeyU', type: KeyType.CHAR },
  { label: 'I', code: 'KeyI', type: KeyType.CHAR },
  { label: 'O', code: 'KeyO', type: KeyType.CHAR },
  { label: 'P', code: 'KeyP', type: KeyType.CHAR },
];

const KEYS_ROW_2: KeyConfig[] = [
  { label: 'A', code: 'KeyA', type: KeyType.CHAR },
  { label: 'S', code: 'KeyS', type: KeyType.CHAR },
  { label: 'D', code: 'KeyD', type: KeyType.CHAR },
  { label: 'F', code: 'KeyF', type: KeyType.CHAR },
  { label: 'G', code: 'KeyG', type: KeyType.CHAR },
  { label: 'H', code: 'KeyH', type: KeyType.CHAR },
  { label: 'J', code: 'KeyJ', type: KeyType.CHAR },
  { label: 'K', code: 'KeyK', type: KeyType.CHAR },
  { label: 'L', code: 'KeyL', type: KeyType.CHAR },
];

const KEYS_ROW_3: KeyConfig[] = [
  { label: 'Z', code: 'KeyZ', type: KeyType.CHAR },
  { label: 'X', code: 'KeyX', type: KeyType.CHAR },
  { label: 'C', code: 'KeyC', type: KeyType.CHAR },
  { label: 'V', code: 'KeyV', type: KeyType.CHAR },
  { label: 'B', code: 'KeyB', type: KeyType.CHAR },
  { label: 'N', code: 'KeyN', type: KeyType.CHAR },
  { label: 'M', code: 'KeyM', type: KeyType.CHAR },
  { label: '⌫', code: 'Backspace', type: KeyType.BACKSPACE },
];

export const Keyboard: React.FC<KeyboardProps> = ({ onKeyPress, onInspire, isGhostWriting, externalPressedKey }) => {
  const [pressedKey, setPressedKey] = useState<string | null>(null);

  // Sync with parent key events (from real keyboard IME or direct typing)
  useEffect(() => {
    if (externalPressedKey) {
        setPressedKey(externalPressedKey);
        const timer = setTimeout(() => setPressedKey(null), 150);
        return () => clearTimeout(timer);
    }
  }, [externalPressedKey]);

  return (
    <div className="flex flex-col items-center gap-3 p-6 bg-stone-900/80 rounded-2xl shadow-2xl border-t-4 border-stone-700 backdrop-blur-sm max-w-4xl mx-auto transform translate-y-4">
      {/* Row 1 */}
      <div className="flex gap-2 md:gap-3">
        {KEYS_ROW_1.map(k => (
          <Key 
            key={k.code} 
            config={k} 
            isPressed={pressedKey === k.code} 
            onPress={onKeyPress} 
          />
        ))}
      </div>

      {/* Row 2 */}
      <div className="flex gap-2 md:gap-3 ml-6">
        {KEYS_ROW_2.map(k => (
          <Key 
            key={k.code} 
            config={k} 
            isPressed={pressedKey === k.code} 
            onPress={onKeyPress} 
          />
        ))}
      </div>

      {/* Row 3 */}
      <div className="flex gap-2 md:gap-3">
        {KEYS_ROW_3.map(k => (
          <Key 
            key={k.code} 
            config={k} 
            isPressed={pressedKey === k.code} 
            onPress={onKeyPress} 
          />
        ))}
      </div>

      {/* Space Bar & Actions */}
      <div className="flex gap-4 mt-2 w-full justify-center items-center">
         {/* Inspire / Ghost Writer Button */}
         <button
          onClick={(e) => { e.stopPropagation(); onInspire(); }}
          disabled={isGhostWriting}
          className={`
            h-10 px-4 rounded-full font-mono text-xs font-bold uppercase tracking-widest 
            transition-all duration-300 flex items-center gap-2
            ${isGhostWriting 
              ? 'bg-amber-500 text-amber-900 animate-pulse' 
              : 'bg-stone-700 text-stone-400 hover:bg-stone-600 hover:text-stone-200'}
          `}
        >
          {isGhostWriting ? 'Typing...' : '✨ AI Muse'}
        </button>

        <div 
          className={`
            h-12 md:h-14 w-64 rounded-lg bg-stone-800 border-2 border-stone-600 shadow-lg
            cursor-pointer flex items-center justify-center
            active:translate-y-1 active:shadow-inner transition-all
            ${pressedKey === 'Space' ? 'translate-y-1 shadow-inner bg-stone-900' : ''}
          `}
          onMouseDown={(e) => { e.preventDefault(); onKeyPress({ label: 'SPACE', code: 'Space', type: KeyType.SPACE }); }}
        >
          <div className="w-24 h-1 bg-stone-700 rounded-full opacity-50"></div>
        </div>

        <div 
           className={`
            h-12 md:h-14 px-6 rounded-lg bg-red-900/40 border-2 border-red-900/60 shadow-lg
            cursor-pointer flex items-center justify-center
            active:translate-y-1 active:shadow-inner transition-all
            ${pressedKey === 'Enter' ? 'translate-y-1 shadow-inner bg-red-950' : ''}
           `}
           onMouseDown={(e) => { e.preventDefault(); onKeyPress({ label: 'RETURN', code: 'Enter', type: KeyType.ENTER }); }}
        >
          <span className="text-red-200 font-mono text-sm font-bold">RETURN</span>
        </div>
      </div>
    </div>
  );
};