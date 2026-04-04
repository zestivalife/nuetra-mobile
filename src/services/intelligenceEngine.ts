import { DailyCheckIn, DecisionLog, Nudge, OnboardingProfile, PriorityPlan, RiskSnapshot } from '../types';
import { todayKey } from '../utils/date';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

const mean = (values: number[]) => {
  if (values.length === 0) {
    return 0;
  }
  return values.reduce((total, value) => total + value, 0) / values.length;
};

export const calculateRiskSnapshot = (checkins: DailyCheckIn[]): RiskSnapshot => {
  const recent14 = checkins.slice(-14);
  const recent7 = recent14.slice(-7);
  const recent3 = recent14.slice(-3);

  const moodAvg = mean(recent7.map((item) => item.mood));
  const energyAvg = mean(recent7.map((item) => item.energy));
  const sleepAvg = mean(recent7.map((item) => item.sleepQuality));

  const lowEnergyDays = recent3.filter((item) => item.energy <= 2).length;
  const previousEnergyAvg = mean(recent14.slice(0, Math.max(0, recent14.length - 3)).map((item) => item.energy));
  const currentEnergyAvg = mean(recent3.map((item) => item.energy));
  const suddenDrop = previousEnergyAvg > 0 && currentEnergyAvg > 0 && previousEnergyAvg - currentEnergyAvg >= 1.3;

  const stressRisk = Math.round(clamp((5 - moodAvg) * 16 + (5 - sleepAvg) * 10 + (5 - energyAvg) * 10, 0, 100));
  const burnoutRisk = Math.round(clamp(stressRisk * 0.55 + (lowEnergyDays >= 2 ? 20 : 0) + (suddenDrop ? 16 : 0), 0, 100));
  const energyDeficit = Math.round(clamp((5 - energyAvg) * 22 + (5 - sleepAvg) * 9, 0, 100));

  let burnoutFlag: RiskSnapshot['burnoutFlag'] = 'none';
  if (burnoutRisk >= 70) {
    burnoutFlag = 'alert';
  } else if (burnoutRisk >= 45) {
    burnoutFlag = 'watch';
  }

  return {
    stressRisk,
    burnoutRisk,
    energyDeficit,
    burnoutFlag,
    anomalyDetected: lowEnergyDays >= 3 || suddenDrop
  };
};

const basePriority = (risk: RiskSnapshot, profile: OnboardingProfile | null) => {
  if (risk.energyDeficit >= 60 || profile?.biggestChallenge === 'Energy') {
    return {
      title: 'Protect your energy before the afternoon dip',
      action: 'Take a 5-minute walk before your next deep work block.'
    };
  }
  if (risk.stressRisk >= 55 || profile?.biggestChallenge === 'Stress') {
    return {
      title: 'Lower tension in under 2 minutes',
      action: 'Do one round of box breathing (4-4-4-4) now.'
    };
  }
  if (profile?.biggestChallenge === 'Focus') {
    return {
      title: 'Create one interruption-free sprint',
      action: 'Start one 15-minute focus sprint and mute notifications.'
    };
  }
  return {
    title: 'Build momentum with one small win',
    action: 'Log one gratitude note and start your first task.'
  };
};

const scheduleSmartNudge = (
  risk: RiskSnapshot,
  todayMeetings: number,
  nudgesSentToday: number,
  userId: string
): Nudge | null => {
  const now = new Date();
  const hour = now.getHours();
  if (hour < 8 || hour >= 20 || nudgesSentToday >= 3) {
    return null;
  }

  let type: Nudge['type'] = 'hydration';
  let title = 'Hydration reset';
  let body = 'Take 2 minutes to drink water and reset your focus.';
  let actionLabel = 'Start 2-min reset';
  let actionMinutes: Nudge['actionMinutes'] = 2;

  if (todayMeetings >= 3) {
    type = 'break';
    title = 'Buffer before your next meeting';
    body = 'You have a heavy calendar. Take a 2-minute movement break now.';
  } else if (risk.stressRisk >= 55) {
    type = 'breathing';
    title = 'Nervous system reset';
    body = 'Two calm minutes now can protect your energy for the rest of the day.';
  } else if (risk.energyDeficit >= 60) {
    type = 'winddown';
    title = 'Gentle energy reset';
    body = 'Pause for 2 minutes and do a short breathing + posture reset.';
  }

  const scheduledAt = new Date();
  scheduledAt.setMinutes(scheduledAt.getMinutes() + 20);

  return {
    id: `ndg-${Date.now()}`,
    userId,
    type,
    title,
    body,
    actionLabel,
    actionMinutes,
    scheduledAtISO: scheduledAt.toISOString()
  };
};

export const generatePriorityPlan = (params: {
  userId: string;
  profile: OnboardingProfile | null;
  checkins: DailyCheckIn[];
  todayMeetings: number;
  nudgesSentToday: number;
}): PriorityPlan => {
  const risk = calculateRiskSnapshot(params.checkins);
  const priority = basePriority(risk, params.profile);
  const nudge = scheduleSmartNudge(risk, params.todayMeetings, params.nudgesSentToday, params.userId);

  const smartPreview =
    params.todayMeetings >= 4
      ? `You have ${params.todayMeetings} meetings today. I will protect a short break before your busiest block.`
      : 'Your day has enough room for one focused action. I will nudge only if needed.';

  return {
    priorityTitle: priority.title,
    priorityAction: priority.action,
    risk,
    suggestedNudge: nudge,
    smartPreview
  };
};

export const buildDecisionLog = (plan: PriorityPlan, checkins: DailyCheckIn[]): DecisionLog => {
  const recent = checkins.slice(-14);
  return {
    id: `dec-${Date.now()}`,
    createdAtISO: new Date().toISOString(),
    inputSummary: `Analyzed ${recent.length} check-ins and today's context at ${todayKey()}.`,
    reasoning: `Stress risk ${plan.risk.stressRisk}, burnout risk ${plan.risk.burnoutRisk}, energy deficit ${plan.risk.energyDeficit}. Selected one action to maximize adherence.`,
    outputSummary: `${plan.priorityTitle}. Nudge: ${plan.suggestedNudge ? plan.suggestedNudge.type : 'none'}. Burnout flag: ${plan.risk.burnoutFlag}.`
  };
};
