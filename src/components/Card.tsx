import React from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radius, shadows } from '../design/tokens';
import { useAppContext } from '../state/AppContext';

export const Card = ({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) => {
  const { themeMode } = useAppContext();
  const isLight = themeMode === 'light';

  return <View style={[styles.card, isLight && styles.cardLight, style]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.stroke,
    padding: 12,
    ...shadows.card
  },
  cardLight: {
    backgroundColor: 'rgba(255,255,255,0.86)',
    borderColor: 'rgba(167, 184, 229, 0.7)',
    shadowColor: '#88A1D8',
    shadowOpacity: 0.2
  }
});
