import React from 'react';
import { Theme, ThemeColors, FontFamily, Settings } from '../types';

interface ControlsProps {
  settings: Settings;
  setSettings: React.Dispatch<React.SetStateAction<Settings>>;
  showRuler: boolean;
  setShowRuler: (show: boolean) => void;
  handleReadAloud: () => void;
  isReading: boolean;
  isProcessing: boolean;
  themeColors: ThemeColors;
}

const Slider: React.FC<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  themeColors: ThemeColors;
}> = ({ label, value, min, max, step, onChange, themeColors }) => (
  <div className="flex flex-col space-y-2">
    <label htmlFor={label} className="text-sm font-medium" style={{color: themeColors.text}}>
      {label}: {value}
    </label>
    <input
      id={label}
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={onChange}
      className="w-full h-2 rounded-lg appearance-none cursor-pointer"
      style={{
          backgroundColor: themeColors.secondary,
          color: themeColors.accent,
      }}
    />
  </div>
);

const Toggle: React.FC<{
  label: string;
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  themeColors: ThemeColors;
  disabled?: boolean;
}> = ({ label, checked, onChange, themeColors, disabled }) => (
    <div className="flex items-center justify-between">
        <label htmlFor={label} className="text-sm font-medium" style={{color: themeColors.text}}>
            {label}
        </label>
        <button
          onClick={() => onChange({ target: { checked: !checked } } as any)}
          disabled={disabled}
          className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors disabled:opacity-50`}
          style={{backgroundColor: checked ? themeColors.accent : themeColors.secondary }}
          id={label}
        >
          <span
            className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`}
          />
        </button>
      </div>
);


const Controls: React.FC<ControlsProps> = ({
  settings, setSettings,
  showRuler, setShowRuler,
  handleReadAloud, isReading, isProcessing,
  themeColors
}) => {
  const themeOptions: { name: Theme; label: string; colors: string }[] = [
    { name: Theme.Light, label: 'Light', colors: 'bg-white border-gray-300' },
    { name: Theme.Dark, label: 'Dark', colors: 'bg-gray-800 border-gray-600' },
    { name: Theme.Sepia, label: 'Sepia', colors: 'bg-[#fbf0d9] border-[#eaddc7]' },
  ];

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 space-y-6 overflow-y-auto" style={{ backgroundColor: themeColors.card, color: themeColors.text }}>
      <h2 className="text-2xl font-bold border-b pb-2" style={{borderColor: themeColors.secondary}}>Display Settings</h2>
      
       <div>
        <label htmlFor="font-family" className="text-sm font-medium mb-2 block">Font Family</label>
        <select
          id="font-family"
          value={settings.fontFamily}
          onChange={(e) => updateSetting('fontFamily', e.target.value as FontFamily)}
          className="w-full p-2 rounded-lg border-2 focus:outline-none focus:ring-2"
          style={{ backgroundColor: themeColors.background, color: themeColors.text, borderColor: themeColors.secondary, ringColor: themeColors.accent }}
        >
          {Object.values(FontFamily).map(font => (
            <option key={font} value={font}>{font}</option>
          ))}
        </select>
      </div>
      
      <Slider 
        label="Font Size" 
        value={settings.fontSize} 
        onChange={(e) => updateSetting('fontSize', Number(e.target.value))} 
        min={12} max={48} step={1} 
        themeColors={themeColors}
      />
      <Slider 
        label="Letter Spacing" 
        value={settings.letterSpacing} 
        onChange={(e) => updateSetting('letterSpacing', Number(e.target.value))} 
        min={0} max={10} step={0.5} 
        themeColors={themeColors}
      />
      <Slider 
        label="Word Spacing" 
        value={settings.wordSpacing} 
        onChange={(e) => updateSetting('wordSpacing', Number(e.target.value))} 
        min={0} max={20} step={1} 
        themeColors={themeColors}
      />
      <Slider 
        label="Line Height" 
        value={settings.lineHeight} 
        onChange={(e) => updateSetting('lineHeight', Number(e.target.value))} 
        min={1} max={3} step={0.1}
        themeColors={themeColors}
      />

      <div>
        <h3 className="text-sm font-medium mb-2">Color Theme</h3>
        <div className="flex space-x-2">
          {themeOptions.map(opt => (
            <button
              key={opt.name}
              onClick={() => updateSetting('theme', opt.name)}
              className={`w-10 h-10 rounded-full border-2 transition-transform transform ${opt.colors} ${settings.theme === opt.name ? 'ring-2 scale-110' : ''}`}
              style={{
                borderColor: settings.theme === opt.name ? themeColors.accent : 'transparent',
                ringColor: themeColors.accent
              }}
              aria-label={`Set ${opt.label} theme`}
            />
          ))}
        </div>
      </div>

      <div className="space-y-4 pt-4 border-t" style={{borderColor: themeColors.secondary}}>
        <h3 className="text-lg font-semibold">Reading Aids</h3>
        <Toggle label="Reading Ruler" checked={showRuler} onChange={(e) => setShowRuler(e.target.checked)} themeColors={themeColors} />
        <Toggle label="Bionic Emphasis" checked={settings.bionicReading} onChange={(e) => updateSetting('bionicReading', e.target.checked)} themeColors={themeColors} />
        <Toggle label="Syllable Separation" checked={settings.syllableSeparation} onChange={(e) => updateSetting('syllableSeparation', e.target.checked)} themeColors={themeColors} disabled={isProcessing}/>
        {isProcessing && <p className="text-xs text-center" style={{color: themeColors.accent}}>AI processing syllables...</p>}
      </div>

      <button
        onClick={handleReadAloud}
        disabled={isReading || isProcessing}
        className="w-full text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        style={{ backgroundColor: themeColors.primary, color: themeColors.primaryText }}
      >
        {(isReading) && (
          <svg className="animate-spin h-5 w-5" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        <span>{isReading ? 'Reading...' : 'Read Aloud'}</span>
      </button>
       <p className="text-xs text-center italic" style={{color: themeColors.secondary}}>
          *This tool is designed based on dyslexia research but is not a medical device.
       </p>
    </div>
  );
};

export default Controls;
