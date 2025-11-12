export enum Theme {
  Light = 'light',
  Dark = 'dark',
  Sepia = 'sepia',
}

export enum FontFamily {
  Default = 'Default',
  OpenDyslexic = 'OpenDyslexic',
  Lexend = 'Lexend',
  Arial = 'Arial',
  Verdana = 'Verdana',
}

export interface ThemeColors {
  background: string;
  text: string;
  primary: string;
  primaryText: string;
  secondary: string;
  accent: string;
  card: string;
}

export interface Settings {
  fontFamily: FontFamily;
  fontSize: number;
  letterSpacing: number;
  wordSpacing: number;
  lineHeight: number;
  theme: Theme;
  bionicReading: boolean;
  syllableSeparation: boolean;
}