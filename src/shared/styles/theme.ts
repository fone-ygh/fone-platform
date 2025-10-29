// src/shared/styles/theme.ts
import { Theme } from '@emotion/react';

const theme: Theme = {
  colors: {
    primary: '#0064FF',
    secondary: '#3182F6',
    text: '#222',
    background: '#fff',
  },
  spacing: (value: number) => `${value * 4}px`,
  borderRadius: '8px',
};

export default theme;

declare module '@emotion/react' {
  export interface Theme {
    colors: {
      primary: string;
      secondary: string;
      text: string;
      background: string;
    };
    spacing: (value: number) => string;
    borderRadius: string;
  }
}
