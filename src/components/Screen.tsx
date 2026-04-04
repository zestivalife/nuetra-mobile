import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, gradients } from '../design/tokens';
import { useAppContext } from '../state/AppContext';

export const Screen = ({
  children,
  scroll = false,
  contentStyle
}: {
  children: React.ReactNode;
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
}) => {
  const { themeMode } = useAppContext();
  const backgroundGradient = themeMode === 'light' ? gradients.appBackgroundLight : gradients.appBackground;

  return (
    <LinearGradient colors={[...backgroundGradient]} style={styles.gradient}>
      <SafeAreaView style={styles.safe}>
        {scroll ? (
          <ScrollView contentContainerStyle={[styles.content, contentStyle]}>{children}</ScrollView>
        ) : (
          <View style={[styles.content, contentStyle]}>{children}</View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
    backgroundColor: colors.bgPrimary
  },
  safe: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 12
  }
});
