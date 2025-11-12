import React from 'react';
import { ThemeColors, FontFamily } from '../types';

interface ContentProps {
  text: string;
  setText: (text: string) => void;
  processedText: string;
  settings: {
    fontFamily: FontFamily;
    fontSize: number;
    letterSpacing: number;
    wordSpacing: number;
    lineHeight: number;
  };
  themeColors: ThemeColors;
  showRuler: boolean;
  rulerPosition: number;
  handleMouseMove: (e: React.MouseEvent<HTMLDivElement>) => void;
  handleMouseLeave: () => void;
}

const FONT_MAP: Record<FontFamily, string> = {
    [FontFamily.Default]: "'Inter', sans-serif",
    [FontFamily.OpenDyslexic]: "'OpenDyslexic', sans-serif",
    [FontFamily.Lexend]: "'Lexend', sans-serif",
    [FontFamily.Arial]: "Arial, sans-serif",
    [FontFamily.Verdana]: "Verdana, sans-serif",
};

const Content: React.FC<ContentProps> = ({
  text,
  setText,
  processedText,
  settings,
  themeColors,
  showRuler,
  rulerPosition,
  handleMouseMove,
  handleMouseLeave,
}) => {
  const { fontSize, letterSpacing, wordSpacing, lineHeight, fontFamily } = settings;

  const formattedStyle = {
    fontFamily: FONT_MAP[fontFamily],
    fontSize: `${fontSize}px`,
    letterSpacing: `${letterSpacing}px`,
    wordSpacing: `${wordSpacing}px`,
    lineHeight: lineHeight,
    color: themeColors.text,
  };

  return (
    <div className="flex-1 grid grid-rows-2 md:grid-rows-1 md:grid-cols-2 gap-4 p-4 h-full" style={{ backgroundColor: themeColors.secondary }}>
      <div className="flex flex-col h-full">
        <label htmlFor="text-input" className="font-semibold mb-2" style={{color: themeColors.text}}>Paste your text here:</label>
        <textarea
          id="text-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Start typing or paste text..."
          className="w-full flex-1 p-4 rounded-lg border-2 resize-none focus:outline-none focus:ring-2"
          style={{
            backgroundColor: themeColors.card,
            color: themeColors.text,
            borderColor: themeColors.secondary,
            ringColor: themeColors.accent,
          }}
        />
      </div>
      <div 
        className="relative overflow-y-auto h-full p-4 rounded-lg" 
        style={{ backgroundColor: themeColors.card }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          className="whitespace-pre-wrap select-text" 
          style={formattedStyle}
          dangerouslySetInnerHTML={{ __html: processedText || "Your formatted text will appear here." }}
        />
        {showRuler && (
          <div
            className="absolute left-0 w-full opacity-20 pointer-events-none rounded"
            style={{ 
              top: `${rulerPosition}px`,
              backgroundColor: themeColors.accent,
              height: `${lineHeight * fontSize * 0.8}px`, // Make ruler slightly smaller than line height
              transform: `translateY(-${(lineHeight * fontSize * 0.8) / 2}px)`,
              transition: 'top 0.1s ease-out',
            }}
          />
        )}
      </div>
    </div>
  );
};

export default Content;
