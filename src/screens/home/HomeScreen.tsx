import React, { useEffect, useMemo, useRef } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { ProgressRing } from '../../components/ProgressRing';
import { colors, radius, spacing, typography } from '../../design/tokens';
import { RootStackParamList } from '../../navigation/types';
import { useAppContext } from '../../state/AppContext';
import { MoodSelection } from '../../types';
import { wellnessTagsFromSnapshot } from '../../utils/wellness';

type Nav = NativeStackNavigationProp<RootStackParamList>;

type ActivityCardProps = {
  title: string;
  subtitle: string;
  meta: string;
  icon: React.ReactNode;
  onPress: () => void;
  isLight?: boolean;
};

type MoodConfig = {
  emoji: MoodSelection;
  message: string;
};

const moodConfigs: MoodConfig[] = [
  { emoji: '😂', message: 'Love this energy. Keep smiling and moving.' },
  { emoji: '😀', message: 'Great mood. Today is yours, stay consistent.' },
  { emoji: '🙂', message: 'Nice and balanced. Small wins will compound.' },
  { emoji: '😐', message: 'You are doing okay. A short breath break may help.' },
  { emoji: '☹️', message: 'Tough day. Take it one step at a time.' },
  { emoji: '😔', message: 'You are not alone. Start with hydration and one walk.' }
];

const trendDeltaFromCheckins = (values: number[]) => {
  if (values.length < 6) {
    return 0;
  }
  const current = values.slice(-7);
  const previous = values.slice(-14, -7);
  if (previous.length === 0) {
    return 0;
  }
  const currentAvg = current.reduce((sum, value) => sum + value, 0) / current.length;
  const previousAvg = previous.reduce((sum, value) => sum + value, 0) / previous.length;
  return Math.round((currentAvg - previousAvg) * 20);
};

const ActivityCard = ({ title, subtitle, meta, icon, onPress, isLight }: ActivityCardProps) => (
  <Pressable onPress={onPress} style={[styles.activityCard, isLight && styles.activityCardLight]}>
    <View style={styles.activityTopRow}>
      <View style={styles.activityCopyWrap}>
        <Text style={[styles.activityMeta, isLight && styles.activityMetaLight]}>{meta}</Text>
        <Text style={[styles.activityTitle, isLight && styles.activityTitleLight]} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={[styles.activityIconWrap, isLight && styles.activityIconWrapLight]}>{icon}</View>
    </View>
    <Text style={[styles.activitySubtitle, isLight && styles.activitySubtitleLight]} numberOfLines={2}>
      {subtitle}
    </Text>
    <View style={styles.activityFooter}>
      <Ionicons name="chevron-forward" size={18} color="#F9D61F" />
    </View>
  </Pressable>
);

export const HomeScreen = () => {
  const { onboarding, wellness, selectedDeviceId, devices, mood, setMood, priorityPlan, checkIns, nudges, themeMode } =
    useAppContext();
  const navigation = useNavigation<Nav>();
  const isLight = themeMode === 'light';
  const homeGradient = isLight ? (['#F8FBFF', '#EAF1FF'] as const) : (['#4A123F', '#1F214D'] as const);
  const moodAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!mood) {
      return;
    }
    moodAnim.setValue(0);
    Animated.timing(moodAnim, {
      toValue: 1,
      duration: 240,
      useNativeDriver: true
    }).start();
  }, [mood, moodAnim]);

  const moodMessage = useMemo(() => moodConfigs.find((item) => item.emoji === mood)?.message ?? '', [mood]);
  const connectedDevice = devices.find((d) => d.id === selectedDeviceId);
  const wellnessTags = useMemo(() => wellnessTagsFromSnapshot(wellness), [wellness]);
  const trendDelta = useMemo(
    () => trendDeltaFromCheckins(checkIns.map((item) => (item.mood + item.energy + item.sleepQuality) / 3)),
    [checkIns]
  );
  const pendingNudge = nudges[nudges.length - 1];

  const quickStats = [
    { label: 'Sleep', value: String(Math.round((wellness.sleepHours / 8) * 100)) + '%', tone: '#8D53FF' },
    { label: 'Focus', value: String(wellness.focusMinutes) + 'm', tone: '#1D8CFF' },
    { label: 'Hydration', value: wellness.hydrationLiters.toFixed(1) + 'L', tone: '#35D18C' }
  ];

  const glancePoints = [
    { icon: 'flash-outline', text: priorityPlan?.priorityAction ?? 'Take one 2-minute reset between meetings.' },
    { icon: 'calendar-outline', text: priorityPlan?.smartPreview ?? 'Nuetra will protect your focus around meeting load.' },
    { icon: 'notifications-outline', text: pendingNudge?.title ?? 'No urgent nudges. You are on track today.' }
  ];

  const activities: ActivityCardProps[] = [
    {
      title: 'Focus Mode',
      meta: '15 min',
      subtitle: 'Deep work session with binaural beats.',
      icon: <Ionicons name="timer-outline" size={20} color="#F6A800" />,
      onPress: () => navigation.navigate('FocusSession')
    },
    {
      title: 'Breathing',
      meta: '5 min',
      subtitle: '4-7-8 technique for nervous system reset.',
      icon: <MaterialCommunityIcons name="weather-windy" size={22} color="#1BCB66" />,
      onPress: () => navigation.navigate('BreathingSession')
    },
    {
      title: 'Movement',
      meta: '10 min',
      subtitle: 'Mobility sequence to unlock tight joints.',
      icon: <Ionicons name="expand-outline" size={20} color="#9EB8E8" />,
      onPress: () => navigation.navigate('MovementSession')
    },
    {
      title: 'Hydration',
      meta: `${wellness.hydrationLiters.toFixed(1)} ltr`,
      subtitle: 'Drink some water to stay refreshed.',
      icon: <Ionicons name="water-outline" size={20} color="#3C8FFF" />,
      onPress: () => navigation.navigate('HydrationSession')
    }
  ];

  return (
    <Screen scroll contentStyle={styles.screenContent}>
      <View style={styles.headerRow}>
        <Text style={[styles.greeting, isLight && styles.greetingLight]} numberOfLines={1}>
          Hi, {onboarding?.name ?? 'Employee'}
        </Text>

        <View style={styles.headerActionsWrap}>
          <View style={[styles.actionsPill, isLight && styles.actionsPillLight]}>
            <Pressable style={[styles.iconButton, isLight && styles.iconButtonLight]} onPress={() => navigation.navigate('Search')}>
              <Ionicons name="search-outline" size={20} color={isLight ? '#2B3F69' : '#E7E1FF'} />
            </Pressable>
            <Pressable style={[styles.iconButton, isLight && styles.iconButtonLight]} onPress={() => navigation.navigate('Leadership')}>
              <Ionicons name="people-outline" size={20} color={isLight ? '#2B3F69' : '#E7E1FF'} />
            </Pressable>
            <Pressable style={[styles.iconButton, isLight && styles.iconButtonLight]} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={20} color={isLight ? '#2B3F69' : '#E7E1FF'} />
              <View style={styles.badgeDot}>
                <Text style={styles.badgeText}>9</Text>
              </View>
            </Pressable>
          </View>

          <Pressable style={[styles.avatar, isLight && styles.avatarLight]} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person" size={22} color={isLight ? '#2C3D60' : '#E7E1FF'} />
          </Pressable>
        </View>
      </View>

      <LinearGradient colors={homeGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.scoreCard, isLight && styles.scoreCardLight]}>
        <Text style={styles.scoreHeading}>Your Wellness Score</Text>

        <View style={styles.scoreRow}>
          <View style={styles.scoreTagsWrap}>
            <View style={styles.scoreTagRow}>
              <View style={styles.scoreTag}><Text style={styles.scoreTagText} numberOfLines={1}>{wellnessTags[0]}</Text></View>
              <View style={styles.scoreTag}><Text style={styles.scoreTagText} numberOfLines={1}>{wellnessTags[1]}</Text></View>
            </View>
            <View style={styles.scoreTagRow}>
              <View style={styles.scoreTag}><Text style={styles.scoreTagText} numberOfLines={1}>{wellnessTags[2]}</Text></View>
              <View style={styles.scoreTag}><Text style={styles.scoreTagText} numberOfLines={1}>{wellnessTags[3]}</Text></View>
            </View>
          </View>

          <View style={styles.ringWrap}>
            <ProgressRing progress={wellness.wellnessScore / 100} size={91.2} strokeWidth={8.4} />
            <Text style={styles.ringText}>{wellness.wellnessScore}%</Text>
          </View>
        </View>

        <View style={styles.trendRow}>
          <Text style={styles.trendLabel}>vs last week</Text>
          <Text style={[styles.trendValue, trendDelta >= 0 ? styles.trendUp : styles.trendDown]}>
            {trendDelta >= 0 ? '↑' : '↓'} {Math.abs(trendDelta)}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.quickStatsRow}>
        {quickStats.map((stat) => (
          <View key={stat.label} style={[styles.quickStatCard, isLight && styles.quickStatCardLight]}>
            <View style={[styles.quickStatDot, { backgroundColor: stat.tone }]} />
            <Text style={[styles.quickStatValue, isLight && styles.quickStatValueLight]}>{stat.value}</Text>
            <Text style={[styles.quickStatLabel, isLight && styles.quickStatLabelLight]}>{stat.label}</Text>
          </View>
        ))}
      </View>

      <View style={[styles.glanceCard, isLight && styles.glanceCardLight]}>
        <View style={styles.glanceHeader}>
          <Text style={[styles.glanceTitle, isLight && styles.textDark]}>Today at a glance</Text>
          <Text style={[styles.glanceMeta, isLight && styles.textMutedDark]}>Live</Text>
        </View>
        {glancePoints.map((point) => (
          <View key={point.icon} style={styles.glanceRow}>
            <Ionicons name={point.icon as keyof typeof Ionicons.glyphMap} size={16} color={isLight ? '#2D4E83' : '#CFC7F5'} />
            <Text style={[styles.glanceText, isLight && styles.textMutedDark]} numberOfLines={2}>{point.text}</Text>
          </View>
        ))}
      </View>

      <View style={styles.syncRow}>
        <Text style={[styles.syncLabel, isLight && styles.syncLabelLight]}>
          {connectedDevice ? `Synced: ${connectedDevice.brand}` : 'Watch not synced'}
        </Text>
        <Pressable style={styles.syncButton} onPress={() => navigation.navigate('SyncWearable')}>
          <Ionicons name="watch-outline" size={16} color={colors.white} />
          <Text style={styles.syncButtonText}>{connectedDevice ? 'Re-sync Watch' : 'Sync Watch'}</Text>
        </Pressable>
      </View>

      <Text style={[styles.sectionTitle, isLight && styles.sectionTitleLight]}>Choose your mood for today</Text>
      <View style={styles.moodRow}>
        {moodConfigs.map((item) => {
          const active = mood === item.emoji;
          return (
            <Pressable
              key={item.emoji}
              style={[styles.moodItem, isLight && styles.moodItemLight, active && styles.moodItemActive]}
              onPress={() => setMood(item.emoji)}
            >
              <Text style={styles.moodText}>{item.emoji}</Text>
            </Pressable>
          );
        })}
      </View>

      {mood ? (
        <Animated.View
          style={[
            styles.moodFeedback,
            {
              opacity: moodAnim,
              transform: [
                {
                  translateY: moodAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [4, 0]
                  })
                }
              ]
            }
          ]}
        >
          <Text style={styles.moodFeedbackText}>{moodMessage}</Text>
        </Animated.View>
      ) : null}

      <Text style={[styles.sectionTitle, isLight && styles.sectionTitleLight]}>Pending Activities</Text>
      <View style={styles.activityGrid}>
        {activities.map((activity) => (
          <ActivityCard key={activity.title} {...activity} isLight={isLight} />
        ))}
      </View>

      <View style={styles.bottomSpacer} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  screenContent: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 124 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  greeting: { ...typography.title, fontSize: 24 },
  greetingLight: { color: '#243A5A' },
  headerActionsWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  actionsPill: { flexDirection: 'row', backgroundColor: '#4B4764', borderRadius: radius.pill, padding: spacing.xxs, borderWidth: 1, borderColor: '#87809D' },
  actionsPillLight: { backgroundColor: 'rgba(255,255,255,0.9)', borderColor: 'rgba(170,189,227,0.9)' },
  iconButton: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center', backgroundColor: '#2A2548' },
  iconButtonLight: { backgroundColor: '#E9F1FF' },
  badgeDot: { position: 'absolute', top: -2, right: -2, width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#D94358', borderWidth: 1, borderColor: colors.white },
  badgeText: { ...typography.caption, color: colors.white, fontSize: 9, lineHeight: 11 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: '#8EA4BF', alignItems: 'center', justifyContent: 'center' },
  avatarLight: { backgroundColor: '#D6E4F8' },
  scoreCard: { borderRadius: 26, padding: spacing.md, marginBottom: 12 },
  scoreCardLight: { borderWidth: 1, borderColor: 'rgba(173,191,227,0.85)', shadowColor: '#85A4DA', shadowOpacity: 0.24, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  scoreHeading: { ...typography.bodyStrong, fontSize: 14, marginBottom: 12 },
  scoreRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  scoreTagsWrap: { flex: 1, gap: 8 },
  scoreTagRow: { flexDirection: 'row', gap: 6 },
  scoreTag: { flex: 1, borderRadius: radius.pill, backgroundColor: '#9F3D8E', paddingHorizontal: 6, paddingVertical: 7 },
  scoreTagText: { ...typography.bodyStrong, fontSize: 12, color: '#FDF2FF' },
  ringWrap: { width: 94, height: 94, alignItems: 'center', justifyContent: 'center' },
  ringText: { position: 'absolute', ...typography.bodyStrong, fontSize: 14, color: colors.white },
  trendRow: { marginTop: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  trendLabel: { ...typography.caption, fontSize: 13, color: '#E4DBFF' },
  trendValue: { ...typography.bodyStrong, fontSize: 14 },
  trendUp: { color: '#4AE095' },
  trendDown: { color: '#FF7A93' },
  quickStatsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  quickStatCard: { flex: 1, borderRadius: 14, borderWidth: 1, borderColor: '#5D547D', backgroundColor: '#211B42', paddingVertical: 10, paddingHorizontal: 10 },
  quickStatCardLight: { backgroundColor: 'rgba(255,255,255,0.92)', borderColor: 'rgba(173,191,227,0.85)' },
  quickStatDot: { width: 8, height: 8, borderRadius: 4, marginBottom: 8 },
  quickStatValue: { ...typography.bodyStrong, fontSize: 18, lineHeight: 22, color: '#F6F5FF' },
  quickStatValueLight: { color: '#243A5A' },
  quickStatLabel: { ...typography.caption, fontSize: 12, marginTop: 2, color: '#B6B0D5' },
  quickStatLabelLight: { color: '#5A6F95' },
  glanceCard: { borderRadius: 16, borderWidth: 1, borderColor: '#5D547D', backgroundColor: '#211B42', padding: 12, marginBottom: 12 },
  glanceCardLight: { backgroundColor: 'rgba(255,255,255,0.9)', borderColor: 'rgba(173,191,227,0.85)' },
  glanceHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  glanceTitle: { ...typography.bodyStrong, fontSize: 14 },
  glanceMeta: { ...typography.caption, fontSize: 12, color: '#B6B0D5' },
  glanceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  glanceText: { ...typography.body, flex: 1, fontSize: 13, lineHeight: 18 },
  syncRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  syncLabel: { ...typography.body, color: '#D9D4F7', fontSize: 14 },
  syncLabelLight: { color: '#425577' },
  syncButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xxs, borderRadius: radius.pill, backgroundColor: '#1B8AFB', paddingHorizontal: spacing.sm, paddingVertical: 8 },
  syncButtonText: { ...typography.caption, color: colors.white, fontSize: 13 },
  sectionTitle: { ...typography.section, fontWeight: '500', marginBottom: 12, marginTop: 2 },
  sectionTitleLight: { color: '#2A3E60' },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  moodItem: { width: 50, height: 50, borderRadius: 18, borderWidth: 1, borderColor: '#5E5578', alignItems: 'center', justifyContent: 'center', backgroundColor: '#201A3E' },
  moodItemLight: { backgroundColor: '#EEF3FC', borderColor: '#C8D8EE' },
  moodItemActive: { borderColor: '#F6A800', backgroundColor: '#34273D' },
  moodText: { fontSize: 26 },
  moodFeedback: { borderRadius: 12, borderWidth: 1, borderColor: '#7E6AB6', backgroundColor: '#2A214F', paddingHorizontal: 10, paddingVertical: 9, marginBottom: 12 },
  moodFeedbackText: { ...typography.body, fontSize: 13, color: '#E7DCFF' },
  activityGrid: { gap: 10 },
  activityCard: { borderRadius: 20, borderWidth: 1, borderColor: '#5E5578', backgroundColor: '#17112F', padding: 12 },
  activityCardLight: { borderColor: '#C9D6EA', backgroundColor: 'rgba(255,255,255,0.95)' },
  activityTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  activityCopyWrap: { flex: 1, paddingRight: 8 },
  activityMeta: { ...typography.bodyStrong, color: '#F7F6FF', fontSize: 13 },
  activityMetaLight: { color: '#243A5A' },
  activityTitle: { ...typography.section, color: '#E4DFFF', fontSize: 15, marginTop: 1 },
  activityTitleLight: { color: '#243A5A' },
  activityIconWrap: { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', backgroundColor: '#322A56' },
  activityIconWrapLight: { backgroundColor: '#EEF3FC' },
  activitySubtitle: { ...typography.body, color: '#9D95C5', fontSize: 13, lineHeight: 18, minHeight: 36 },
  activitySubtitleLight: { color: '#5B6C90' },
  activityFooter: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 6 },
  textDark: { color: '#243A5A' },
  textMutedDark: { color: '#5A6F95' },
  bottomSpacer: { height: 16 }
});
