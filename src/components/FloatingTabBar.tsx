import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { colors, typography } from '../design/tokens';
import { MainTabParamList } from '../navigation/types';
import { useAppContext } from '../state/AppContext';

const iconMap: Record<keyof MainTabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home-outline',
  Tracker: 'fitness-outline',
  Reports: 'heart-outline',
  Sessions: 'id-card-outline'
};

export const FloatingTabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const insets = useSafeAreaInsets();
  const bottomOffset = 0;
  const { themeMode } = useAppContext();
  const isLight = themeMode === 'light';

  return (
    <View pointerEvents="box-none" style={[styles.container, { bottom: bottomOffset }]}>
      <BlurView intensity={isLight ? 78 : 62} tint={isLight ? 'light' : 'dark'} style={[styles.blurShell, isLight && styles.blurShellLight]}>
        <LinearGradient
          colors={isLight ? ['rgba(255,255,255,0.90)', 'rgba(235,242,255,0.86)', 'rgba(213,226,250,0.88)'] : ['rgba(255,255,255,0.16)', 'rgba(170,170,220,0.08)', 'rgba(40,36,62,0.30)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.bar, { paddingBottom: Math.max(2, Math.round(insets.bottom * 0.45)) }]}
        >
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const onPress = () => {
              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            const onLongPress = () => {
              navigation.emit({
                type: 'tabLongPress',
                target: route.key
              });
            };

            const label = descriptors[route.key].options.tabBarLabel ?? descriptors[route.key].options.title ?? route.name;

            return (
              <Pressable
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                onLongPress={onLongPress}
                style={[styles.item, isLight && styles.itemLight, isFocused && styles.itemActive, isFocused && isLight && styles.itemActiveLight]}
              >
              <Ionicons
                name={iconMap[route.name as keyof MainTabParamList]}
                size={20}
                color={isFocused ? colors.white : isLight ? '#49608D' : '#F3F0FF'}
              />
                <Text style={[styles.label, isLight && styles.labelLight, isFocused && styles.labelActive]}>{String(label)}</Text>
              </Pressable>
            );
          })}
        </LinearGradient>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 10,
    right: 10,
    backgroundColor: 'transparent'
  },
  blurShell: {
    borderRadius: 36,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(220,220,255,0.26)',
    shadowColor: '#000000',
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14
  },
  blurShellLight: {
    borderColor: 'rgba(168,184,225,0.78)',
    shadowColor: '#6E88C8',
    shadowOpacity: 0.22
  },
  bar: {
    flexDirection: 'row',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 4,
    minHeight: 70
  },
  item: {
    flex: 1,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 4
  },
  itemLight: {
    backgroundColor: 'transparent'
  },
  itemActive: {
    backgroundColor: '#1B8AFB'
  },
  itemActiveLight: {
    backgroundColor: '#2E7DF2'
  },
  label: {
    ...typography.caption,
    color: '#F3F0FF',
    fontSize: 11
  },
  labelLight: {
    color: '#4F648C'
  },
  labelActive: {
    color: colors.white,
    fontWeight: '700'
  }
});
