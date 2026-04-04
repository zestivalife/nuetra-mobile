export type WearableBrand = 'Apple' | 'Samsung' | 'Xiaomi' | 'Amazfit' | 'Other';

export type MoodSelection = '😂' | '😀' | '🙂' | '😐' | '☹️' | '😔';

export type HrvStatus = 'High' | 'Normal' | 'Low';
export type CoreChallenge = 'Stress' | 'Sleep' | 'Energy' | 'Focus';
export type CalendarProvider = 'Google' | 'Outlook' | 'None';
export type BurnoutRiskFlag = 'none' | 'watch' | 'alert';
export type NudgeType = 'break' | 'breathing' | 'hydration' | 'winddown' | 'weekly_insight';
export type NudgeAction = 'sent' | 'opened' | 'snoozed' | 'dismissed';
export type ThemeMode = 'dark' | 'light';

export type OnboardingProfile = {
  name: string;
  role: string;
  workHours: string;
  biggestChallenge: CoreChallenge;
  calendarProvider: CalendarProvider;
  calendarPermissionGranted: boolean;
  notificationPermissionGranted: boolean;
  createdAtISO: string;
};

export type DailyCheckIn = {
  dateISO: string;
  mood: 1 | 2 | 3 | 4 | 5;
  energy: 1 | 2 | 3 | 4 | 5;
  sleepQuality: 1 | 2 | 3 | 4 | 5;
};

export type RiskSnapshot = {
  stressRisk: number;
  burnoutRisk: number;
  energyDeficit: number;
  burnoutFlag: BurnoutRiskFlag;
  anomalyDetected: boolean;
};

export type Nudge = {
  id: string;
  userId: string;
  type: NudgeType;
  title: string;
  body: string;
  actionLabel: string;
  actionMinutes: 1 | 2 | 5;
  scheduledAtISO: string;
};

export type DecisionLog = {
  id: string;
  createdAtISO: string;
  inputSummary: string;
  reasoning: string;
  outputSummary: string;
};

export type PriorityPlan = {
  priorityTitle: string;
  priorityAction: string;
  risk: RiskSnapshot;
  suggestedNudge: Nudge | null;
  smartPreview: string;
};

export type WearableDevice = {
  id: string;
  brand: WearableBrand;
  model: string;
  connected: boolean;
  battery: number;
  lastSyncISO: string;
};

export type WellnessSnapshot = {
  focusMinutes: number;
  breathingMinutes: number;
  movementMinutes: number;
  hydrationLiters: number;
  hydrationGoalLiters: number;
  heartRateAvg: number;
  sleepHours: number;
  moodScore: number;
  recoveryScore: number;
  nourishmentScore: number;
  wellnessScore: number;
  hrvStatus: HrvStatus;
  stressScore: number;
};
