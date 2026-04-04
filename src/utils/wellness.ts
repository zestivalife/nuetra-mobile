import { hydrationProgress } from './hydration';
import { HrvStatus, MoodSelection, WellnessSnapshot } from '../types';

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));
const roundedPercent = (value: number) => Math.round(clamp(value, 0, 1) * 100);

const moodWeightMap: Record<MoodSelection, number> = {
  '😂': 1,
  '😀': 0.92,
  '🙂': 0.78,
  '😐': 0.62,
  '☹️': 0.44,
  '😔': 0.28
};

const toHrvStatus = (heartRateAvg: number): HrvStatus => {
  if (heartRateAvg <= 66) {
    return 'High';
  }
  if (heartRateAvg <= 78) {
    return 'Normal';
  }
  return 'Low';
};

const toSleepTag = (sleepHours: number) => {
  const safe = Math.max(0, sleepHours);
  const totalMinutes = Math.round(safe * 60);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours}h ${minutes}m Sleep`;
};

export const recalculateWellness = (snapshot: WellnessSnapshot): WellnessSnapshot => {
  const focusQuality = clamp(snapshot.focusMinutes / 60, 0, 1);
  const breathingQuality = clamp(snapshot.breathingMinutes / 20, 0, 1);
  const movementQuality = clamp(snapshot.movementMinutes / 30, 0, 1);
  const hydrationQuality = hydrationProgress(snapshot.hydrationLiters, snapshot.hydrationGoalLiters);
  const sleepQuality = clamp(snapshot.sleepHours / 8, 0, 1);
  const moodQuality = clamp(snapshot.moodScore / 100, 0, 1);
  const heartRhythmQuality = clamp(1 - Math.abs(snapshot.heartRateAvg - 68) / 24, 0, 1);

  const recoveryScore = roundedPercent(
    0.34 * sleepQuality +
      0.2 * hydrationQuality +
      0.18 * breathingQuality +
      0.14 * moodQuality +
      0.09 * movementQuality +
      0.05 * heartRhythmQuality
  );

  const nourishmentScore = roundedPercent(0.72 * hydrationQuality + 0.28 * sleepQuality);

  const wellnessScore = roundedPercent(
    0.26 * focusQuality +
      0.22 * (recoveryScore / 100) +
      0.18 * movementQuality +
      0.14 * hydrationQuality +
      0.12 * breathingQuality +
      0.08 * moodQuality
  );

  return {
    ...snapshot,
    recoveryScore,
    nourishmentScore,
    wellnessScore,
    stressScore: wellnessScore,
    hrvStatus: toHrvStatus(snapshot.heartRateAvg)
  };
};

export const applyMoodImpact = (snapshot: WellnessSnapshot, mood: MoodSelection | null): WellnessSnapshot => {
  if (!mood) {
    return recalculateWellness({
      ...snapshot,
      moodScore: 60
    });
  }

  return recalculateWellness({
    ...snapshot,
    moodScore: Math.round(moodWeightMap[mood] * 100)
  });
};

export const wellnessTagsFromSnapshot = (snapshot: WellnessSnapshot): [string, string, string, string] => {
  return [
    `${snapshot.nourishmentScore}% Nourishment`,
    `${snapshot.recoveryScore}% Recovery`,
    toSleepTag(snapshot.sleepHours),
    `HRV ${snapshot.hrvStatus}`
  ];
};
