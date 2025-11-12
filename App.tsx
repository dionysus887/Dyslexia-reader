import React, { useState, useEffect, useCallback, useRef } from 'react';
import { generateSpeech, stopSpeech, processTextWithSyllables } from './services/geminiService';
import { Theme, FontFamily, ThemeColors, Settings } from './types';
import Controls from './components/Controls';
import Content from './components/Content';

const THEME_CONFIG: Record<Theme, ThemeColors> = {
  [Theme.Light]: { background: '#f3f4f6', text: '#1f2937', primary: '#3b82f6', primaryText: '#ffffff', secondary: '#e5e7eb', accent: '#3b82f6', card: '#ffffff' },
  [Theme.Dark]: { background: '#1f2937', text: '#d1d5db', primary: '#60a5fa', primaryText: '#1f2937', secondary: '#4b5563', accent: '#60a5fa', card: '#374151' },
  [Theme.Sepia]: { background: '#fbf0d9', text: '#584c39', primary: '#a16207', primaryText: '#fbf0d9', secondary: '#eaddc7', accent: '#a16207', card: '#faf3e6' },
};

const DEFAULT_SETTINGS: Settings = {
  fontSize: 20,
  letterSpacing: 2,
  wordSpacing: 8,
  lineHeight: 1.8,
  theme: Theme.Sepia,
  fontFamily: FontFamily.Lexend,
  bionicReading: true,
  syllableSeparation: false,
};

const DEFAULT_TEXT = "This is an example text to demonstrate the powerful features of this reading aid. You can adjust settings on the left to see how they affect the text in real-time. Try toggling Bionic Emphasis or Syllable Separation. You can also paste your own text into the input box.";

// Debounce helper function
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

const App: React.FC = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [text, setText] = useState<string>(DEFAULT_TEXT);
  const [processedText, setProcessedText] = useState<string>('');
  const [isReading, setIsReading] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showRuler, setShowRuler] = useState<boolean>(false);
  const [rulerPosition, setRulerPosition] = useState<number>(0);
  
  const themeColors = THEME_CONFIG[settings.theme];
  const debouncedText = useDebounce(text, 500);

  const applyBionicReading = useCallback((inputText: string): string => {
      return inputText
        .split(/(\s+)/)
        .map(word => {
          if (/\s+/.test(word) || word.length === 0) return word;
          const mid = Math.ceil(word.length / 2);
          const boldPart = word.substring(0, mid).replace(/·/g, '<b>·</b>');
          return `<b>${boldPart}</b>${word.substring(mid)}`;
        })
        .join('');
  }, []);

  useEffect(() => {
    const processText = async () => {
      if (!debouncedText) {
        setProcessedText('');
        return;
      }
      
      let tempText = debouncedText;

      if (settings.syllableSeparation) {
        setIsProcessing(true);
        tempText = await processTextWithSyllables(debouncedText);
        setIsProcessing(false);
      }

      if (settings.bionicReading) {
        tempText = applyBionicReading(tempText);
      }
      
      setProcessedText(tempText);
    };

    processText();
  }, [debouncedText, settings.syllableSeparation, settings.bionicReading, applyBionicReading]);


  const handleReadAloud = useCallback(() => {
    if (isReading) {
      stopSpeech();
      setIsReading(false);
    } else {
      setIsReading(true);
      generateSpeech(processedText, () => setIsReading(false));
    }
  }, [isReading, processedText]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setRulerPosition(e.clientY - rect.top);
  };

  const handleMouseLeave = () => {
    // Optionally hide or reset ruler position when mouse leaves the area
  };

  return (
    <main className="flex flex-col md:flex-row h-screen w-screen" style={{ backgroundColor: themeColors.background }}>
      <div className="w-full md:w-96 md:h-screen md:overflow-y-auto shadow-lg">
        <Controls 
          settings={settings}
          setSettings={setSettings}
          showRuler={showRuler}
          setShowRuler={setShowRuler}
          handleReadAloud={handleReadAloud}
          isReading={isReading}
          isProcessing={isProcessing}
          themeColors={themeColors}
        />
      </div>
      <div className="flex-1 h-full">
        <Content
          text={text}
          setText={setText}
          processedText={processedText}
          settings={settings}
          themeColors={themeColors}
          showRuler={showRuler}
          rulerPosition={rulerPosition}
          handleMouseMove={handleMouseMove}
          handleMouseLeave={handleMouseLeave}
        />
      </div>
    </main>
  );
};

export default App;
