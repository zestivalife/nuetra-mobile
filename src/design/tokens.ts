import { TextStyle, ViewStyle } from 'react-native';

export const colors = {
  bgPrimary: '#1D1738',
  bgSecondary: '#241C46',
  card: '#2A214F',
  cardMuted: '#32295D',
  stroke: '#4A4272',
  textPrimary: '#F6F5FF',
  textSecondary: '#B6B0D5',
  textMuted: '#8E88B0',
  blue: '#1D8CFF',
  blueDark: '#1B6EE0',
  pink: '#E955B9',
  purple: '#8D53FF',
  success: '#35D18C',
  warning: '#FFC947',
  danger: '#FF5B74',
  white: '#FFFFFF'
} as const;

export const spacing = {
  xxs: 4,
  xs: 8,
  sm: 12,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 32
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 18,
  pill: 999
} as const;

export const typography: Record<string, TextStyle> = {
  titleXL: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '700',
    color: colors.textPrimary
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    color: colors.textPrimary
  },
  section: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: '700',
    color: colors.textPrimary
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
    color: colors.textSecondary
  },
  bodyStrong: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    color: colors.textPrimary
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    color: colors.textMuted
  }
};

export const shadows: Record<string, ViewStyle> = {
  card: {
    shadowColor: '#000000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6
  }
};

export const gradients = {
  appBackground: ['#17132F', '#231C48'],
  appBackgroundLight: ['#F7FBFF', '#EEF4FF', '#E7EEFF'],
  accent: ['#1D8CFF', '#3D6CFF'],
  ring: ['#E955B9', '#8D53FF']
} as const;
