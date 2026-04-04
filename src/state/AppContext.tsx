import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { mockDevices, initialWellness } from '../data/mock';
import {
  DailyCheckIn,
  DecisionLog,
  MoodSelection,
  Nudge,
  NudgeAction,
  OnboardingProfile,
  PriorityPlan,
  ThemeMode,
  WearableDevice,
  WellnessSnapshot
} from '../types';
import { applyMoodImpact } from '../utils/wellness';
import { generatePriorityPlan, buildDecisionLog } from '../services/intelligenceEngine';
import { todayKey, toDayKey } from '../utils/date';

type AppContextValue = {
  devices: WearableDevice[];
  setDevices: React.Dispatch<React.SetStateAction<WearableDevice[]>>;
  wellness: WellnessSnapshot;
  setWellness: React.Dispatch<React.SetStateAction<WellnessSnapshot>>;
  mood: MoodSelection | null;
  setMood: React.Dispatch<React.SetStateAction<MoodSelection | null>>;
  onboarding: OnboardingProfile | null;
  setOnboarding: React.Dispatch<React.SetStateAction<OnboardingProfile | null>>;
  checkIns: DailyCheckIn[];
  submitCheckIn: (checkIn: Omit<DailyCheckIn, 'dateISO'>) => void;
  hasCheckedInToday: boolean;
  priorityPlan: PriorityPlan | null;
  decisionLogs: DecisionLog[];
  nudges: Nudge[];
  logNudgeAction: (nudgeId: string, action: NudgeAction) => void;
  themeMode: ThemeMode;
  setThemeMode: React.Dispatch<React.SetStateAction<ThemeMode>>;
  logout: () => void;
  selectedDeviceId: string | null;
  setSelectedDeviceId: React.Dispatch<React.SetStateAction<string | null>>;
};

const AppContext = createContext<AppContextValue | undefined>(undefined);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const userId = 'emp-demo-1';
  const [devices, setDevices] = useState<WearableDevice[]>(mockDevices);
  const [wellness, setWellnessState] = useState<WellnessSnapshot>(initialWellness);
  const [mood, setMood] = useState<MoodSelection | null>(null);
  const [onboarding, setOnboarding] = useState<OnboardingProfile | null>(null);
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>([]);
  const [priorityPlan, setPriorityPlan] = useState<PriorityPlan | null>(null);
  const [decisionLogs, setDecisionLogs] = useState<DecisionLog[]>([]);
  const [nudges, setNudges] = useState<Nudge[]>([]);
  const [themeMode, setThemeMode] = useState<ThemeMode>('dark');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null);

  const setWellness = useCallback<React.Dispatch<React.SetStateAction<WellnessSnapshot>>>(
    (updater) => {
      setWellnessState((previous) => {
        const next = typeof updater === 'function' ? updater(previous) : updater;
        return applyMoodImpact(next, mood);
      });
    },
    [mood]
  );

  const setMoodWithImpact = useCallback<React.Dispatch<React.SetStateAction<MoodSelection | null>>>((updater) => {
    setMood((previousMood) => {
      const nextMood = typeof updater === 'function' ? updater(previousMood) : updater;
      setWellnessState((previousWellness) => applyMoodImpact(previousWellness, nextMood));
      return nextMood;
    });
  }, []);

  const submitCheckIn = useCallback(
    (checkIn: Omit<DailyCheckIn, 'dateISO'>) => {
      const nowISO = new Date().toISOString();
      const nextCheckIn: DailyCheckIn = {
        ...checkIn,
        dateISO: nowISO
      };

      setCheckIns((previous) => {
        const key = toDayKey(nowISO);
        const withoutToday = previous.filter((item) => toDayKey(item.dateISO) !== key);
        const next = [...withoutToday, nextCheckIn].slice(-30);

        const sentToday = nudges.filter((nudge) => toDayKey(nudge.scheduledAtISO) === key).length;
        const todayMeetings = 4;
        const plan = generatePriorityPlan({
          userId,
          profile: onboarding,
          checkins: next,
          todayMeetings,
          nudgesSentToday: sentToday
        });

        setPriorityPlan(plan);
        setDecisionLogs((logs) => [...logs.slice(-99), buildDecisionLog(plan, next)]);
        if (plan.suggestedNudge) {
          setNudges((previousNudges) => [...previousNudges, plan.suggestedNudge as Nudge]);
        }

        const moodMap: Record<number, MoodSelection> = {
          1: '😔',
          2: '☹️',
          3: '😐',
          4: '🙂',
          5: '😀'
        };
        const moodFromCheckIn = moodMap[checkIn.mood];
        setMood((_) => moodFromCheckIn);

        const blendedWellness = Math.round((checkIn.mood * 0.3 + checkIn.energy * 0.4 + checkIn.sleepQuality * 0.3) * 20);
        setWellnessState((current) =>
          applyMoodImpact(
            {
              ...current,
              sleepHours: Number((6 + checkIn.sleepQuality * 0.5).toFixed(1)),
              wellnessScore: blendedWellness
            },
            moodFromCheckIn
          )
        );

        return next;
      });
    },
    [nudges, onboarding]
  );

  const logNudgeAction = useCallback((nudgeId: string, action: NudgeAction) => {
    setDecisionLogs((previous) => [
      ...previous.slice(-99),
      {
        id: `dec-${Date.now()}`,
        createdAtISO: new Date().toISOString(),
        inputSummary: `Nudge feedback received for ${nudgeId}`,
        reasoning: `User selected ${action}.`,
        outputSummary: action === 'snoozed' ? 'Future nudge timing should be delayed.' : 'Nudge preference updated.'
      }
    ]);
  }, []);

  const hasCheckedInToday = useMemo(() => checkIns.some((item) => toDayKey(item.dateISO) === todayKey()), [checkIns]);

  const logout = useCallback(() => {
    setMood(null);
    setSelectedDeviceId(null);
    setCheckIns([]);
    setPriorityPlan(null);
    setDecisionLogs([]);
    setNudges([]);
  }, []);

  const value = useMemo(
    () => ({
      devices,
      setDevices,
      wellness,
      setWellness,
      mood,
      setMood: setMoodWithImpact,
      onboarding,
      setOnboarding,
      checkIns,
      submitCheckIn,
      hasCheckedInToday,
      priorityPlan,
      decisionLogs,
      nudges,
      logNudgeAction,
      themeMode,
      setThemeMode,
      logout,
      selectedDeviceId,
      setSelectedDeviceId
    }),
    [
      checkIns,
      decisionLogs,
      devices,
      hasCheckedInToday,
      logNudgeAction,
      logout,
      mood,
      nudges,
      onboarding,
      priorityPlan,
      selectedDeviceId,
      setThemeMode,
      setMoodWithImpact,
      setWellness,
      submitCheckIn,
      themeMode,
      wellness
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used inside AppProvider');
  }
  return context;
};
