import { z } from 'zod';

export const checkinSchema = z.object({
  userId: z.string().min(1),
  mood: z.number().int().min(1).max(5),
  energy: z.number().int().min(1).max(5),
  sleepQuality: z.number().int().min(1).max(5),
  calendarLoad: z.number().int().min(0).max(24),
  history: z.array(
    z.object({
      mood: z.number().int().min(1).max(5),
      energy: z.number().int().min(1).max(5),
      sleepQuality: z.number().int().min(1).max(5)
    })
  )
});

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value));

export const computeRisk = (input: z.infer<typeof checkinSchema>) => {
  const recent = input.history.slice(-14);
  const values = recent.length > 0 ? recent : [{ mood: input.mood, energy: input.energy, sleepQuality: input.sleepQuality }];

  const avgMood = values.reduce((sum, item) => sum + item.mood, 0) / values.length;
  const avgEnergy = values.reduce((sum, item) => sum + item.energy, 0) / values.length;
  const avgSleep = values.reduce((sum, item) => sum + item.sleepQuality, 0) / values.length;

  const stressRisk = Math.round(clamp((5 - avgMood) * 16 + (5 - avgSleep) * 10 + (5 - avgEnergy) * 10, 0, 100));
  const burnoutRisk = Math.round(clamp(stressRisk * 0.6 + (input.calendarLoad >= 6 ? 20 : 0), 0, 100));
  const energyDeficit = Math.round(clamp((5 - avgEnergy) * 20 + (5 - avgSleep) * 10, 0, 100));

  const burnoutFlag: 'none' | 'watch' | 'alert' = burnoutRisk >= 70 ? 'alert' : burnoutRisk >= 45 ? 'watch' : 'none';

  return { stressRisk, burnoutRisk, energyDeficit, burnoutFlag };
};

export const generateOnePriority = (input: z.infer<typeof checkinSchema>) => {
  const risk = computeRisk(input);

  let priority = 'Take a 2-minute breathing reset before your next meeting.';
  if (risk.energyDeficit >= 60) {
    priority = 'Take a 5-minute walk before your next deep-work block.';
  }

  const nudge = input.calendarLoad >= 3
    ? {
        type: 'break',
        timing: '15 minutes before your busiest meeting block',
        text: 'Two-minute movement reset before your next meeting.'
      }
    : {
        type: 'hydration',
        timing: 'mid-morning',
        text: 'Drink water and do a 2-minute reset.'
      };

  return {
    priority,
    nudge,
    risk
  };
};
