import React, { useCallback } from 'react';
import { KeyConfig, KeyType } from '../types';

interface KeyProps {
  config: KeyConfig;
  isPressed: boolean;
  onPress: (key: KeyConfig) => void;
}

export const Key: React.FC<KeyProps> = ({ config, isPressed, onPress }) => {
  const handleMouseDown = useCallback(() => {
    onPress(config);
  }, [config, onPress]);

  // Geometry
  const sizeClasses = config.width || "w-12 h-12 md:w-14 md:h-14";
  
  // Animation state
  const activeTransform = isPressed ? "translate-y-1 scale-95" : "translate-y-0 hover:-translate-y-0.5";
  const activeShadow = isPressed ? "shadow-sm" : "shadow-[0_6px_8px_rgba(0,0,0,0.6)]";

  return (
    <div 
      className={`relative flex items-center justify-center rounded-full transition-all duration-75 select-none cursor-pointer z-10 ${sizeClasses} ${activeTransform} ${activeShadow}`}
      onMouseDown={handleMouseDown}
      role="button"
      aria-label={config.label}
    >
      {/* 1. Metal Ring (Chrome/Silver) */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-zinc-200 via-zinc-400 to-zinc-600 shadow-md border border-zinc-500"></div>
      
      {/* 2. Inner Shadow/Depth between ring and keytop */}
      <div className="absolute inset-[2px] rounded-full bg-black/80 blur-[1px]"></div>

      {/* 3. Key Cap (Black Bakelite/Plastic) */}
      <div 
        className="absolute inset-[4px] rounded-full flex items-center justify-center border border-white/10"
        style={{
          background: 'radial-gradient(circle at 30% 30%, #44403c 0%, #1c1917 60%, #0c0a09 100%)',
          boxShadow: 'inset 0 2px 4px rgba(255,255,255,0.1), inset 0 -2px 4px rgba(0,0,0,0.8)'
        }}
      >
        {/* Legend */}
        <span className="font-mono font-bold text-stone-200 text-lg md:text-xl drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
            {config.label}
        </span>
        
        {/* Glossy Reflection on Keytop */}
        <div className="absolute top-2 right-3 w-3 h-2 bg-white/10 rounded-full blur-[2px] -rotate-45"></div>
      </div>
    </div>
  );
};