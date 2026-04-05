import React, { useEffect, useMemo, useRef, useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
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

const checkInScale = [1, 2, 3, 4, 5] as const;
const checkInMoodMap: Record<MoodSelection, 1 | 2 | 3 | 4 | 5> = {
  '😂': 5,
  '😀': 5,
  '🙂': 4,
  '😐': 3,
  '☹️': 2,
  '😔': 1
};

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

const ActivityCard = ({ title, subtitle, meta, icon, onPress, isLight }: ActivityCardProps) => {
  return (
    <Pressable onPress={onPress} style={[styles.activityCard, isLight && styles.activityCardLight]}>
      <View style={styles.activityCopyWrap}>
        <Text style={[styles.activityMeta, isLight && styles.activityMetaLight]}>{meta}</Text>
        <Text style={[styles.activityTitle, isLight && styles.activityTitleLight]} numberOfLines={1}>
          {title}
        </Text>
      </View>
      <View style={[styles.activityIconWrap, isLight && styles.activityIconWrapLight]}>
        {icon}
      </View>

      <Text style={[styles.activitySubtitle, isLight && styles.activitySubtitleLight]}>{subtitle}</Text>

      <View style={styles.activityFooter}>
        <Ionicons name="chevron-forward" size={20} color="#F9D61F" />
      </View>
    </Pressable>
  );
};

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

  const moodMessage = useMemo(
    () => moodConfigs.find((item) => item.emoji === mood)?.message ?? '',
    [mood]
  );

  const connectedDevice = devices.find((d) => d.id === selectedDeviceId);
  const wellnessTags = useMemo(() => wellnessTagsFromSnapshot(wellness), [wellness]);
  const trendDelta = useMemo(() => trendDeltaFromCheckins(checkIns.map((item) => (item.mood + item.energy + item.sleepQuality) / 3)), [checkIns]);
  const pendingNudge = nudges[nudges.length - 1];
  const activities: ActivityCardProps[] = [
    {
      title: 'Focus Mode',
      meta: '15 min',
      subtitle: 'Deep work session with binaural beats.',
      icon: <Ionicons name="timer-outline" size={22} color="#F6A800" />,
      onPress: () => navigation.navigate('FocusSession')
    },
    {
      title: 'Breathing',
      meta: '5 min',
      subtitle: '4-7-8 technique for nervous system reset.',
      icon: <MaterialCommunityIcons name="weather-windy" size={24} color="#1BCB66" />,
      onPress: () => navigation.navigate('BreathingSession')
    },
    {
      title: 'Movement',
      meta: '10 min',
      subtitle: 'Mobility sequence to unlock tight joints.',
      icon: <Ionicons name="expand-outline" size={22} color="#9EB8E8" />,
      onPress: () => navigation.navigate('MovementSession')
    },
    {
      title: 'Hydration',
      meta: `${wellness.hydrationLiters.toFixed(1)} ltr`,
      subtitle: 'Drink some water to stay refreshed.',
      icon: <Ionicons name="water-outline" size={22} color="#3C8FFF" />,
      onPress: () => navigation.navigate('HydrationSession')
    }
  ];

  return (
    <Screen scroll contentStyle={styles.screenContent}>
      <View style={styles.headerRow}>
        <Text style={[styles.greeting, isLight && styles.greetingLight]} numberOfLines={1}>Hi!, {onboarding?.name ?? 'Employee'}</Text>

        <View style={styles.headerActionsWrap}>
          <View style={[styles.actionsPill, isLight && styles.actionsPillLight]}>
            <Pressable style={[styles.iconButton, isLight && styles.iconButtonLight]} onPress={() => navigation.navigate('Search')}>
              <Ionicons name="search-outline" size={24} color={isLight ? '#2B3F69' : '#E7E1FF'} />
            </Pressable>

            <Pressable style={[styles.iconButton, isLight && styles.iconButtonLight]} onPress={() => navigation.navigate('Leadership')}>
              <Ionicons name="people-outline" size={22} color={isLight ? '#2B3F69' : '#E7E1FF'} />
            </Pressable>

            <Pressable style={[styles.iconButton, isLight && styles.iconButtonLight]} onPress={() => navigation.navigate('Notifications')}>
              <Ionicons name="notifications-outline" size={24} color={isLight ? '#2B3F69' : '#E7E1FF'} />
              <View style={styles.badgeDot}>
                <Text style={styles.badgeText}>9</Text>
              </View>
            </Pressable>
          </View>

          <Pressable style={[styles.avatar, isLight && styles.avatarLight]} onPress={() => navigation.navigate('Profile')}>
            <Ionicons name="person" size={26} color={isLight ? '#2C3D60' : '#E7E1FF'} />
          </Pressable>
        </View>
      </View>

      <LinearGradient colors={homeGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.scoreCard, isLight && styles.scoreCardLight]}>
        <Text style={styles.scoreHeading}>Your Wellness Score</Text>

        <View style={styles.scoreRow}>
          <View style={styles.scoreTagsWrap}>
            <View style={styles.scoreTagRow}>
              <View style={styles.scoreTag}>
                <Text style={styles.scoreTagText} numberOfLines={1}>
                  {wellnessTags[0]}
                </Text>
              </View>
              <View style={styles.scoreTag}>
                <Text style={styles.scoreTagText} numberOfLines={1}>
                  {wellnessTags[1]}
                </Text>
              </View>
            </View>
            <View style={styles.scoreTagRow}>
              <View style={styles.scoreTag}>
                <Text style={styles.scoreTagText} numberOfLines={1}>
                  {wellnessTags[2]}
                </Text>
              </View>
              <View style={styles.scoreTag}>
                <Text style={styles.scoreTagText} numberOfLines={1}>
                  {wellnessTags[3]}
                </Text>
              </View>
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

      <View style={[styles.smartPreviewCard, isLight && styles.smartPreviewCardLight]}>
        <Text style={[styles.smartPreviewTitle, isLight && styles.textDark]}>Smart Preview</Text>
        <Text style={[styles.smartPreviewCopy, isLight && styles.textMutedDark]}>{priorityPlan?.smartPreview ?? 'Complete your check-in to personalize today’s support.'}</Text>
      </View>

      {pendingNudge ? (
        <View style={[styles.nudgeCard, isLight && styles.nudgeCardLight]}>
          <Text style={[styles.nudgeTitle, isLight && styles.textDark]}>{pendingNudge.title}</Text>
          <Text style={[styles.nudgeCopy, isLight && styles.textMutedDark]}>{pendingNudge.body}</Text>
        </View>
      ) : null}

      <View style={styles.syncRow}>
        <Text style={[styles.syncLabel, isLight && styles.syncLabelLight]}>{connectedDevice ? `Synced: ${connectedDevice.brand}` : 'Watch not synced'}</Text>
        <Pressable style={styles.syncButton} onPress={() => navigation.navigate('SyncWearable')}>
          <Ionicons name="watch-outline" size={16} color={colors.white} />
          <Text style={styles.syncButtonText}>{connectedDevice ? 'Re-sync Watch' : 'Sync Watch'}</Text>
        </Pressable>
      </View>

      <Text style={[styles.sectionTitle, isLight && styles.sectionTitleLight]}>Choose your mood for today!</Text>
      <View style={styles.moodRow}>
        {moodConfigs.map((item) => {
          const active = mood === item.emoji;
          return (
            <Pressable key={item.emoji} style={[styles.moodItem, isLight && styles.moodItemLight, active && styles.moodItemActive]} onPress={() => setMood(item.emoji)}>
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

      <View style={styles.insightHeader}>
        <Text style={[styles.sectionTitle, isLight && styles.sectionTitleLight]}>Today’s Insight</Text>
        <Pressable>
          <Text style={[styles.readAll, isLight && styles.sectionTitleLight]}>Read All</Text>
        </Pressable>
      </View>

      <View style={[styles.insightCard, isLight && styles.insightCardLight]}>
        <Text style={[styles.insightText, isLight && styles.textMutedDark]}>Your energy is lower than usual. Avoid back-to-back meetings if possible.</Text>
      </View>

      <View style={styles.pagination}>
        <View style={styles.dot} />
        <View style={[styles.dot, styles.dotActive]} />
        <View style={styles.dot} />
      </View>

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
  screenContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 124
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  greeting: {
    ...typography.title,
    fontSize: 24
  },
  greetingLight: {
    color: '#243A5A'
  },
  headerActionsWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs
  },
  actionsPill: {
    flexDirection: 'row',
    backgroundColor: '#4B4764',
    borderRadius: radius.pill,
    padding: spacing.xxs,
    borderWidth: 1,
    borderColor: '#87809D'
  },
  actionsPillLight: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: 'rgba(170,189,227,0.9)'
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2A2548'
  },
  iconButtonLight: {
    backgroundColor: '#E9F1FF'
  },
  badgeDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D94358',
    borderWidth: 1,
    borderColor: colors.white
  },
  badgeText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 10,
    lineHeight: 12
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#8EA4BF',
    alignItems: 'center',
    justifyContent: 'center'
  },
  avatarLight: {
    backgroundColor: '#D6E4F8'
  },
  profileMenuFloating: {
    position: 'absolute',
    top: 108,
    right: 16,
    width: 180,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#6E6791',
    backgroundColor: '#2A244C',
    padding: 10,
    gap: 10
  },
  profileMenuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.12)'
  },
  profileMenuRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  profileMenuLabel: {
    ...typography.bodyStrong,
    fontSize: 14
  },
  themeSwitch: {
    width: 44,
    height: 24,
    borderRadius: 999,
    backgroundColor: '#4C466E',
    paddingHorizontal: 3,
    justifyContent: 'center'
  },
  themeSwitchActive: {
    backgroundColor: '#1B8AFB'
  },
  themeSwitchKnob: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#EDE8FF'
  },
  themeSwitchKnobActive: {
    alignSelf: 'flex-end'
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#7A4962',
    backgroundColor: '#45243A',
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  logoutText: {
    ...typography.bodyStrong,
    fontSize: 14,
    color: '#FFD8DF'
  },
  scoreCard: {
    borderRadius: 26,
    padding: spacing.md,
    marginBottom: 16
  },
  scoreCardLight: {
    borderWidth: 1,
    borderColor: 'rgba(173,191,227,0.85)',
    shadowColor: '#85A4DA',
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  },
  checkInRow: {
    marginBottom: 8
  },
  checkInLabel: {
    ...typography.bodyStrong,
    fontSize: 14,
    marginBottom: 6
  },
  scaleRow: {
    flexDirection: 'row',
    gap: 6
  },
  scaleChip: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#7E749F',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#342C5D'
  },
  scaleChipActive: {
    backgroundColor: '#1B8AFB',
    borderColor: '#1B8AFB'
  },
  scaleChipText: {
    ...typography.caption,
    fontSize: 14,
    color: colors.white
  },
  priorityInlineCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#65539D',
    backgroundColor: 'rgba(35, 28, 72, 0.7)',
    padding: 12,
    marginTop: 10
  },
  priorityLabel: {
    ...typography.caption,
    fontSize: 14,
    color: '#E7DFFF'
  },
  priorityTitle: {
    ...typography.bodyStrong,
    fontSize: 14,
    marginTop: 4
  },
  priorityAction: {
    ...typography.body,
    fontSize: 14,
    marginTop: 4
  },
  scoreHeading: {
    ...typography.bodyStrong,
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  scoreTagsWrap: {
    flex: 1,
    gap: 8
  },
  scoreTagRow: {
    flexDirection: 'row',
    gap: 6
  },
  scoreTag: {
    flex: 1,
    borderRadius: radius.pill,
    backgroundColor: '#9F3D8E',
    paddingHorizontal: 6,
    paddingVertical: 7
  },
  scoreTagText: {
    ...typography.bodyStrong,
    fontSize: 12,
    lineHeight: 16,
    color: '#FDF2FF'
  },
  ringWrap: {
    width: 94,
    height: 94,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ringText: {
    position: 'absolute',
    ...typography.bodyStrong,
    fontSize: 14,
    lineHeight: 20,
    color: colors.white
  },
  trendRow: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  trendLabel: {
    ...typography.caption,
    fontSize: 14,
    color: '#E4DBFF'
  },
  trendValue: {
    ...typography.bodyStrong,
    fontSize: 14
  },
  trendUp: {
    color: '#4AE095'
  },
  trendDown: {
    color: '#FF7A93'
  },
  smartPreviewCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#5D547D',
    backgroundColor: '#211B42',
    padding: 12,
    marginBottom: 10
  },
  smartPreviewCardLight: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderColor: 'rgba(173,191,227,0.85)'
  },
  smartPreviewTitle: {
    ...typography.bodyStrong,
    fontSize: 14
  },
  smartPreviewCopy: {
    ...typography.body,
    fontSize: 14,
    marginTop: 4
  },
  nudgeCard: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#4076AE',
    backgroundColor: '#1E2E4B',
    padding: 12,
    marginBottom: 12
  },
  nudgeCardLight: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderColor: 'rgba(157,187,231,0.88)'
  },
  nudgeTitle: {
    ...typography.bodyStrong,
    fontSize: 14
  },
  nudgeCopy: {
    ...typography.body,
    fontSize: 14,
    marginTop: 4
  },
  viewCheckInsButton: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#5B6AA7',
    backgroundColor: '#252F56',
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12
  },
  viewCheckInsText: {
    ...typography.bodyStrong,
    fontSize: 14,
    color: colors.white
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20
  },
  modalCard: {
    width: '100%',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#625995',
    backgroundColor: '#26204A',
    padding: 16
  },
  modalTitle: {
    ...typography.bodyStrong,
    fontSize: 14
  },
  modalCopy: {
    ...typography.body,
    fontSize: 14,
    marginTop: 6
  },
  modalMetrics: {
    ...typography.bodyStrong,
    fontSize: 14,
    marginTop: 8
  },
  modalButton: {
    marginTop: 14,
    borderRadius: 999,
    backgroundColor: '#1B8AFB',
    alignItems: 'center',
    paddingVertical: 10
  },
  modalButtonText: {
    ...typography.bodyStrong,
    fontSize: 14,
    color: colors.white
  },
  popupMoodRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10
  },
  popupMoodItem: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#5E5578',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#201A3E'
  },
  historyList: {
    marginTop: 8,
    gap: 8
  },
  historyRow: {
    borderWidth: 1,
    borderColor: '#554D82',
    borderRadius: 12,
    backgroundColor: '#2E2756',
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  historyDate: {
    ...typography.caption,
    fontSize: 14,
    color: '#D8D2F8'
  },
  historyValues: {
    ...typography.body,
    fontSize: 14,
    marginTop: 2
  },
  syncRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14
  },
  syncLabel: {
    ...typography.body,
    color: '#D9D4F7',
    fontSize: 14
  },
  syncLabelLight: {
    color: '#425577'
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xxs,
    borderRadius: radius.pill,
    backgroundColor: '#1B8AFB',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8
  },
  syncButtonText: {
    ...typography.caption,
    color: colors.white,
    fontSize: 13
  },
  sectionTitle: {
    ...typography.section,
    fontWeight: '500',
    marginBottom: 12,
    marginTop: 2
  },
  sectionTitleLight: {
    color: '#2A3E60'
  },
  moodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8
  },
  moodItem: {
    width: 50,
    height: 50,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#5E5578',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#201A3E'
  },
  moodItemLight: {
    borderColor: '#A7BCE1',
    backgroundColor: 'rgba(252,254,255,0.96)'
  },
  moodItemActive: {
    borderColor: '#F0C33A',
    backgroundColor: '#2C244F'
  },
  moodText: {
    fontSize: 26
  },
  moodFeedback: {
    borderRadius: 16,
    backgroundColor: '#2B2550',
    borderWidth: 1,
    borderColor: '#5E5578',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginBottom: 16
  },
  moodFeedbackText: {
    ...typography.body,
    fontSize: 14,
    color: '#F1EBFF'
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  readAll: {
    ...typography.section,
    fontWeight: '500'
  },
  insightCard: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#C99519',
    backgroundColor: '#17132E',
    padding: 18,
    marginBottom: 14
  },
  insightCardLight: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderColor: '#D9B16A'
  },
  insightText: {
    ...typography.body,
    color: '#A19EAF',
    fontSize: 14,
    lineHeight: 20
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 18
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#D9D9D9'
  },
  dotActive: {
    width: 44,
    backgroundColor: '#A63C93'
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12
  },
  activityCard: {
    width: '48%',
    minHeight: 170,
    borderRadius: 32,
    borderCurve: 'continuous',
    borderWidth: 1,
    borderColor: '#5E4F2F',
    backgroundColor: '#1B1536',
    padding: 12,
    paddingBottom: 28,
    justifyContent: 'flex-start',
    position: 'relative'
  },
  activityCardLight: {
    borderColor: '#B8C8E8',
    backgroundColor: 'rgba(255,255,255,0.92)'
  },
  activityCopyWrap: {
    flexShrink: 1,
    paddingRight: 58
  },
  activityMeta: {
    ...typography.title,
    fontSize: 18,
    lineHeight: 22,
    marginBottom: 4
  },
  activityMetaLight: {
    color: '#2A3D5F'
  },
  activityTitle: {
    ...typography.section,
    fontSize: 16,
    lineHeight: 20,
    color: '#CAC5E0'
  },
  activityTitleLight: {
    color: '#4A5E83'
  },
  activityIconWrap: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 48,
    height: 48,
    borderRadius: 24,
    borderCurve: 'continuous',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3A3456'
  },
  activityIconWrapLight: {
    backgroundColor: '#EAF1FF'
  },
  activitySubtitle: {
    ...typography.body,
    fontSize: 14,
    lineHeight: 20,
    color: '#8F8CA3',
    marginTop: 8
  },
  activitySubtitleLight: {
    color: '#6B7F9D'
  },
  textDark: {
    color: '#243B5E'
  },
  textMutedDark: {
    color: '#61779C'
  },
  activityFooter: {
    position: 'absolute',
    right: 12,
    bottom: 14
  },
  bottomSpacer: {
    height: 0
  }
});
