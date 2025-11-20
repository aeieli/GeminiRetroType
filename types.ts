export interface CharData {
  id: string;
  char: string;
  isDeleted: boolean;
}

export interface Sticker {
  id: string;
  content: CharData[]; // Changed from text: string to support rich text (strikethrough)
  rotation: number;
  x: number;
  y: number;
  timestamp: number;
  clipPath: string; // The jagged edge shape
}

export enum KeyType {
  CHAR = 'CHAR',
  SPACE = 'SPACE',
  ENTER = 'ENTER',
  BACKSPACE = 'BACKSPACE',
  ACTION = 'ACTION' // For special features like "Inspire Me"
}

export interface KeyConfig {
  label: string;
  code: string; // KeyboardEvent.code
  type: KeyType;
  width?: string; // Tailwind width class
}