import { EditorTheme } from '../types/editor';

export interface ThemeConfig {
  id: EditorTheme;
  label: string;
  isDark: boolean;
}

export const THEMES: Record<EditorTheme, ThemeConfig> = {
  'vs-dark': {
    id: 'vs-dark',
    label: 'Dark',
    isDark: true,
  },
  light: {
    id: 'light',
    label: 'Light',
    isDark: false,
  },
  'hc-black': {
    id: 'hc-black',
    label: 'High Contrast',
    isDark: true,
  },
};

export const THEME_LIST = Object.values(THEMES);
