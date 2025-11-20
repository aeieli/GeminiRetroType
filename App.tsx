import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Keyboard } from './components/Keyboard';
import { Paper } from './components/Paper';
import { StickerWall } from './components/StickerWall';
import { TypewriterMachine } from './components/TypewriterMachine';
import { KeyConfig, KeyType, Sticker, CharData } from './types';
import { generateJaggedEdge, getRandomPosition, getRandomRotation } from './utils/paperUtils';
import { generateInspiration } from './services/geminiService';

const App: React.FC = () => {
  // State uses CharData[] instead of plain string to support "soft delete" strikethrough
  const [chars, setChars] = useState<CharData[]>([]);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [isGhostWriting, setIsGhostWriting] = useState(false);
  const [lastPressedKey, setLastPressedKey] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  
  // Cursor tracking for physical carriage movement
  const [cursorIndex, setCursorIndex] = useState(0);
  
  // IME Composition State
  const isComposingRef = useRef(false);
  const [compositionText, setCompositionText] = useState('');
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // MACHINE SCALE FACTOR
  const MACHINE_SCALE = 0.5;

  // Derived string for the textarea value so IME works correctly.
  // This string ONLY contains non-deleted characters.
  const activeString = chars.filter(c => !c.isDeleted).map(c => c.char).join('');

  // Focus textarea to capture input
  const handleMachineClick = () => {
    textareaRef.current?.focus();
  };

  // Helper: Calculate visual length of a string (Chinese chars = 2 units)
  const getVisualLength = (str: string) => {
    let len = 0;
    for (let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i);
      // Simple heuristic: CJK characters are usually > 255. 
      // This maps to the fact that they take ~2x width in typical monospace fonts 
      // or are displayed as wide glyphs.
      len += code > 255 ? 2 : 1;
    }
    return len;
  };

  // Calculate visual cursor position (Line & Col)
  const getCursorVisuals = () => {
    // Includes composition text in visual calculation to expand carriage for preview
    const textBeforeCursor = activeString.substring(0, cursorIndex) + compositionText;
    const lines = textBeforeCursor.split('\n');
    const currentLineIndex = lines.length - 1;
    const lastLineText = lines[lines.length - 1];
    const currentColIndex = getVisualLength(lastLineText);
    return { line: currentLineIndex, col: currentColIndex };
  };

  const { line, col } = getCursorVisuals();

  // Helper: Map an index in "activeString" to the index in "chars" array
  const getRealIndex = (activeIdx: number, currentChars: CharData[]): number => {
    let activeCount = 0;
    for (let i = 0; i < currentChars.length; i++) {
      if (!currentChars[i].isDeleted) {
        if (activeCount === activeIdx) return i;
        activeCount++;
      }
    }
    return currentChars.length; // Append
  };

  // --- Input Handling Logic ---

  const handleCompositionStart = () => {
    isComposingRef.current = true;
  };

  const handleCompositionUpdate = (e: React.CompositionEvent<HTMLTextAreaElement>) => {
    setCompositionText(e.data);
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLTextAreaElement>) => {
    isComposingRef.current = false;
    setCompositionText('');
    
    // Force a sync of the committed text. 
    // We manually trigger the input handler with the final value to ensure consistency
    // especially if the browser blocked the standard 'input' event during composition.
    const nativeEventMock = { isComposing: false };
    handleInputChange({
        target: e.currentTarget,
        nativeEvent: nativeEventMock
    } as any);
  };

  // Handle text insertion (typing) and deletion
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isGhostWriting) return;
    
    // If the browser indicates we are strictly in the middle of composing, 
    // we usually skip committing to the main 'chars' array to avoid partial inputs.
    // However, we rely on handleCompositionEnd to fire the final sync.
    if ((e.nativeEvent as any).isComposing || isComposingRef.current) {
        return;
    }

    const newVal = e.target.value;
    const newCursorPos = e.target.selectionStart;
    
    // Compare newVal vs activeString to detect changes
    const oldVal = activeString;
    
    // 1. Deletions
    if (newVal.length < oldVal.length) {
        const diff = oldVal.length - newVal.length;
        // Standard backspace usually occurs at the new cursor position
        const deleteStartIndex = newCursorPos; 
        
        setChars(prev => {
            const next = [...prev];
            // Mark characters as deleted
            for (let i = 0; i < diff; i++) {
                const activeIdxToDelete = deleteStartIndex + i;
                const realIdx = getRealIndex(activeIdxToDelete, prev);
                if (realIdx < next.length) {
                    next[realIdx] = { ...next[realIdx], isDeleted: true };
                }
            }
            return next;
        });
        triggerTypingEffect('Backspace');
    } 
    // 2. Insertions (including Multi-char pastes or Chinese Commit)
    else if (newVal.length > oldVal.length) {
        const diff = newVal.length - oldVal.length;
        const insertStartIndex = newCursorPos - diff;
        const insertedText = newVal.substring(insertStartIndex, newCursorPos);
        
        const realInsertIdx = getRealIndex(insertStartIndex, chars);
        
        const newCharObjects: CharData[] = insertedText.split('').map(c => ({
           id: Math.random().toString(36).substring(2,9) + Date.now(),
           char: c,
           isDeleted: false
        }));

        setChars(prev => {
            const next = [...prev];
            next.splice(realInsertIdx, 0, ...newCharObjects);
            return next;
        });
        triggerTypingEffect(null);
    }

    setCursorIndex(newCursorPos);
  };

  const triggerTypingEffect = (keyCode: string | null) => {
      if(keyCode) setLastPressedKey(keyCode);
      setIsTyping(true);
      setTimeout(() => {
          setLastPressedKey(null);
          setIsTyping(false);
      }, 100);
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
      setCursorIndex(e.currentTarget.selectionStart);
  };

  // Handle virtual key clicks (Keyboard UI)
  const handleVirtualKeyPress = useCallback((key: KeyConfig) => {
    if (isGhostWriting || !textareaRef.current) return;

    const textarea = textareaRef.current;
    textarea.focus();
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;

    if (key.type === KeyType.BACKSPACE) {
        // Logic mirrors physical keyboard backspace
        if (start === end && start > 0) {
             setChars(prev => {
                 const next = [...prev];
                 const realIdx = getRealIndex(start - 1, prev);
                 if (next[realIdx]) next[realIdx] = { ...next[realIdx], isDeleted: true };
                 return next;
             });
             setCursorIndex(start - 1);
        } else if (start !== end) {
             const diff = end - start;
             setChars(prev => {
                const next = [...prev];
                for(let i=0; i<diff; i++) {
                    const realIdx = getRealIndex(start + i, prev);
                    if(next[realIdx]) next[realIdx] = { ...next[realIdx], isDeleted: true };
                }
                return next;
             });
             setCursorIndex(start);
        }
        triggerTypingEffect('Backspace');

    } else {
        let charToInsert = '';
        if (key.type === KeyType.ENTER) charToInsert = '\n';
        else if (key.type === KeyType.SPACE) charToInsert = ' ';
        else if (key.type === KeyType.CHAR) charToInsert = key.label.toLowerCase();
        
        if (charToInsert) {
            const activeIdx = start;
            const newChar: CharData = { id: Date.now().toString(), char: charToInsert, isDeleted: false };
            
            setChars(prev => {
                const next = [...prev];
                const realIdx = getRealIndex(activeIdx, prev);
                next.splice(realIdx, 0, newChar);
                return next;
            });
            setCursorIndex(start + 1);
        }
        triggerTypingEffect(key.code);
    }
  }, [isGhostWriting, chars]);

  const handleTear = useCallback(() => {
    if (chars.length === 0) return;

    const newSticker: Sticker = {
      id: Date.now().toString(),
      content: chars,
      rotation: getRandomRotation(),
      // Generate higher up since the machine is small now
      ...getRandomPosition(window.innerWidth, window.innerHeight * 0.6), 
      timestamp: Date.now(),
      clipPath: generateJaggedEdge(Date.now(), 'both')
    };

    setStickers(prev => [...prev, newSticker]);
    setChars([]);
    setCursorIndex(0);
    setCompositionText('');
    if (textareaRef.current) textareaRef.current.value = "";
  }, [chars]);

  const handleRemoveSticker = (id: string) => {
    setStickers(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateStickerPosition = (id: string, x: number, y: number) => {
      setStickers(prev => prev.map(s => s.id === id ? { ...s, x, y } : s));
  };

  // AI Ghost Writer
  const handleInspire = async () => {
    if (isGhostWriting) return;
    setIsGhostWriting(true);
    textareaRef.current?.focus();
    
    try {
      const inspiration = await generateInspiration();
      setChars([]); 
      setCursorIndex(0);

      let currentIndex = 0;
      const inspirationChars = inspiration.split('').map((c, i) => ({
          id: `ghost-${i}`,
          char: c,
          isDeleted: false
      }));

      const typeInterval = setInterval(() => {
        if (currentIndex < inspirationChars.length) {
          setChars(prev => [...prev, inspirationChars[currentIndex]]);
          setCursorIndex(prev => prev + 1);
          triggerTypingEffect(null);
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setIsGhostWriting(false);
        }
      }, 80); 
    } catch (e) {
      setIsGhostWriting(false);
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#222] overflow-hidden font-sans select-none" onClick={handleMachineClick}>
      {/* Hidden Textarea for IME Support */}
      <textarea
        ref={textareaRef}
        value={activeString}
        className="absolute opacity-0 top-0 left-0 h-full w-full cursor-default z-50" 
        style={{ pointerEvents: 'none' }}
        onChange={handleInputChange}
        onSelect={handleSelect}
        onCompositionStart={handleCompositionStart}
        onCompositionUpdate={handleCompositionUpdate}
        onCompositionEnd={handleCompositionEnd}
        autoFocus
      />

      {/* Dark Wood Desk Background */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{ 
            background: 'radial-gradient(circle at center, #4a4036 0%, #1c1917 100%)',
        }}
      >
           <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/wood-pattern.png')]"></div>
      </div>

      {/* Floating Stickers on Wall - Full Screen */}
      <StickerWall 
        stickers={stickers} 
        onRemoveSticker={handleRemoveSticker} 
        onUpdateStickerPosition={handleUpdateStickerPosition}
      />

      {/* Main Machine UI - Scaled Down */}
      <div 
        className="relative z-10 h-full flex flex-col justify-end pb-10 items-center pointer-events-none"
        style={{
            transform: `scale(${MACHINE_SCALE})`,
            transformOrigin: 'bottom center'
        }}
      >
        <TypewriterMachine 
            isTyping={isTyping}
            paper={
                <Paper 
                    chars={chars} 
                    compositionText={compositionText}
                    onTear={handleTear} 
                    isTyping={isTyping} 
                    lineIndex={line}
                    colIndex={col}
                    scale={MACHINE_SCALE} 
                    cursorIndex={cursorIndex} 
                />
            }
            keyboard={
                <Keyboard 
                    onKeyPress={handleVirtualKeyPress} 
                    onInspire={handleInspire} 
                    isGhostWriting={isGhostWriting}
                    externalPressedKey={lastPressedKey}
                />
            }
        />
      </div>

      <div className="absolute bottom-2 right-4 text-white/20 text-[10px] font-mono tracking-widest uppercase pointer-events-none z-50">
        RetroType V2.5 • Mini Edition
      </div>
    </div>
  );
};

export default App;