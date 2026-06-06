/**
 * Core Design System Tokens & Configuration
 * Re-designed for premium cloud AI SaaS aesthetics (compact spacing, clean typography, neutral cloud palette).
 */

export const THEME = {
  colors: {
    primary: {
      DEFAULT: '#FF6A00', // Energetic, premium cloud accent
      hover: '#E65C00',
      light: 'rgba(255, 106, 0, 0.1)',
      dark: '#CC5200',
    },
    background: {
      DEFAULT: '#FAFAF8',
      surface: '#FFFFFF',
      subtle: '#F7F7F5',
      dark: '#0A0A0F',
    },
    text: {
      primary: '#0A0A0F',
      secondary: 'rgba(10, 10, 15, 0.6)',
      muted: 'rgba(10, 10, 15, 0.4)',
      inverse: '#FFFFFF',
    },
    border: {
      DEFAULT: 'rgba(10, 10, 15, 0.06)',
      hover: 'rgba(10, 10, 15, 0.15)',
      active: 'rgba(255, 106, 0, 0.4)',
    },
    status: {
      success: { bg: '#10b981', text: '#FFFFFF', light: 'rgba(16, 185, 129, 0.1)' },
      warning: { bg: '#f59e0b', text: '#FFFFFF', light: 'rgba(245, 158, 11, 0.1)' },
      danger: { bg: '#ef4444', text: '#FFFFFF', light: 'rgba(239, 68, 68, 0.1)' },
      info: { bg: '#3b82f6', text: '#FFFFFF', light: 'rgba(59, 130, 246, 0.1)' },
    }
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    sizes: {
      xs: 'text-[11px] leading-tight',
      sm: 'text-[12px] leading-snug',
      base: 'text-[13px] sm:text-[14px] leading-normal',
      lg: 'text-[16px] sm:text-[18px] leading-snug font-bold',
      xl: 'text-[20px] sm:text-[24px] leading-tight font-black',
    }
  },
  layout: {
    cardRadius: 'rounded-md',
    buttonRadius: 'rounded-md',
    inputRadius: 'rounded-md',
    compactPadding: 'p-3 sm:p-4',
    compactGap: 'gap-2 sm:gap-3',
  }
};
