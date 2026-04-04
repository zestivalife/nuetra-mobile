import { WearableDevice, WellnessSnapshot } from '../types';
import { initialWellness } from '../data/mock';
import { recalculateWellness } from '../utils/wellness';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const connectWearable = async (device: WearableDevice): Promise<WearableDevice> => {
  await delay(900);
  return {
    ...device,
    connected: true,
    lastSyncISO: new Date().toISOString()
  };
};

export const syncWearableData = async (): Promise<WellnessSnapshot> => {
  await delay(1100);
  return recalculateWellness({
    ...initialWellness,
    focusMinutes: initialWellness.focusMinutes + 2,
    movementMinutes: initialWellness.movementMinutes + 1,
    hydrationLiters: Number((initialWellness.hydrationLiters + 0.1).toFixed(1))
  });
};
