import React, { useMemo, useRef, useState } from 'react';
import {
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, radius, typography } from '../../design/tokens';
import { RootStackParamList } from '../../navigation/types';
import {
  AssessmentGender,
  AssessmentGoal,
  AssessmentMood,
  AssessmentPhysicalDistress,
  AssessmentSleepQuality
} from '../../types';
import { useAppContext } from '../../state/AppContext';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingAssessment'>;

const goals: AssessmentGoal[] = ['Reduce Stress', 'Try AI Therapy', 'Cope With Trauma', 'Become Better'];
const genders: AssessmentGender[] = ['Male', 'Female', 'Prefer not to say'];
const moods: { value: AssessmentMood; label: string; emoji: string }[] = [
  { value: 'Low', label: 'Low', emoji: '☹️' },
  { value: 'Neutral', label: 'Neutral', emoji: '😐' },
  { value: 'Positive', label: 'Positive', emoji: '🙂' }
];
const sleepQualityLevels: AssessmentSleepQuality[] = ['Excellent', 'Good', 'Fair', 'Poor', 'Worst'];

const AGE_MIN = 16;
const AGE_MAX = 80;
const AGE_ITEM_HEIGHT = 52;

const WEIGHT_MIN = 40;
const WEIGHT_MAX = 160;
const WEIGHT_TICK_WIDTH = 14;

const moodToScore = (mood: AssessmentMood): 1 | 2 | 3 | 4 | 5 => {
  if (mood === 'Positive') {
    return 5;
  }
  if (mood === 'Neutral') {
    return 3;
  }
  return 2;
};

const sleepToScore = (quality: AssessmentSleepQuality): 1 | 2 | 3 | 4 | 5 => {
  const map: Record<AssessmentSleepQuality, 1 | 2 | 3 | 4 | 5> = {
    Excellent: 5,
    Good: 4,
    Fair: 3,
    Poor: 2,
    Worst: 1
  };
  return map[quality];
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const OnboardingAssessmentScreen = ({ navigation }: Props) => {
  const { setAssessment, submitCheckIn, setMood } = useAppContext();
  const { width } = useWindowDimensions();

  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState<AssessmentGoal>('Reduce Stress');
  const [gender, setGender] = useState<AssessmentGender>('Male');
  const [age, setAge] = useState(28);
  const [weightKg, setWeightKg] = useState(68);
  const [unit, setUnit] = useState<'kg' | 'lbs'>('kg');
  const [mood, setAssessmentMood] = useState<AssessmentMood>('Neutral');
  const [soughtHelpBefore, setSoughtHelpBefore] = useState<'Yes' | 'No'>('No');
  const [physicalDistress, setPhysicalDistress] = useState<AssessmentPhysicalDistress>('No');
  const [sleepQuality, setSleepQuality] = useState<AssessmentSleepQuality>('Good');
  const [stressLevel, setStressLevel] = useState<1 | 2 | 3 | 4 | 5>(3);

  const ageValues = useMemo(() => Array.from({ length: AGE_MAX - AGE_MIN + 1 }, (_, i) => AGE_MIN + i), []);
  const weightValues = useMemo(() => Array.from({ length: WEIGHT_MAX - WEIGHT_MIN + 1 }, (_, i) => WEIGHT_MIN + i), []);

  const ageRef = useRef<FlatList<number>>(null);
  const weightRef = useRef<FlatList<number>>(null);

  const rulerSidePadding = Math.max(16, (width - 32) / 2);

  const ageIndex = age - AGE_MIN;
  const weightIndex = weightKg - WEIGHT_MIN;

  const weightDisplay = useMemo(() => {
    if (unit === 'kg') {
      return `${weightKg} kg`;
    }
    const lbs = Math.round(weightKg * 2.20462);
    return `${lbs} lbs`;
  }, [unit, weightKg]);

  const totalSteps = 10;
  const isLast = step === totalSteps;

  const onAgeScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const rawIndex = Math.round(event.nativeEvent.contentOffset.y / AGE_ITEM_HEIGHT);
    const nextIndex = clamp(rawIndex, 0, ageValues.length - 1);
    setAge(ageValues[nextIndex]);
  };

  const onWeightScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const rawIndex = Math.round(event.nativeEvent.contentOffset.x / WEIGHT_TICK_WIDTH);
    const nextIndex = clamp(rawIndex, 0, weightValues.length - 1);
    setWeightKg(weightValues[nextIndex]);
  };

  const continueNext = () => {
    if (!isLast) {
      setStep((current) => current + 1);
      return;
    }

    const completedAtISO = new Date().toISOString();
    setAssessment({
      completedAtISO,
      goal,
      gender,
      age,
      weightKg,
      mood,
      soughtHelpBefore,
      physicalDistress,
      sleepQuality,
      stressLevel,
      voiceReflection: 'I believe in myself and my progress.'
    });

    const moodScore = moodToScore(mood);
    const sleepScore = sleepToScore(sleepQuality);
    const energyScore = Math.max(1, Math.min(5, 6 - stressLevel)) as 1 | 2 | 3 | 4 | 5;

    submitCheckIn({
      mood: moodScore,
      energy: energyScore,
      sleepQuality: sleepScore
    });

    const emoji = moodScore >= 4 ? '🙂' : moodScore === 3 ? '😐' : '☹️';
    setMood(emoji);

    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }]
    });
  };

  return (
    <Screen>
      <View style={styles.body}>
        <View style={styles.headerRow}>
        <Text style={styles.title}>Assessment</Text>
        <Text style={styles.progress}>{step} of {totalSteps}</Text>
      </View>

      {step === 1 ? (
        <View>
          <Text style={styles.question}>What’s your health goal for today?</Text>
          <View style={styles.list}>
            {goals.map((item) => {
              const active = goal === item;
              return (
                <Pressable key={item} style={[styles.optionRow, active && styles.optionRowActive]} onPress={() => setGoal(item)}>
                  <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {step === 2 ? (
        <View>
          <Text style={styles.question}>What’s your official gender?</Text>
          <View style={styles.list}>
            {genders.map((item) => {
              const active = gender === item;
              return (
                <Pressable key={item} style={[styles.optionRow, active && styles.optionRowActive]} onPress={() => setGender(item)}>
                  <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {step === 3 ? (
        <View>
          <Text style={styles.question}>What’s your age?</Text>
          <View style={styles.ageWheelWrap}>
            <FlatList
              ref={ageRef}
              data={ageValues}
              keyExtractor={(item) => `age-${item}`}
              showsVerticalScrollIndicator={false}
              decelerationRate="fast"
              snapToInterval={AGE_ITEM_HEIGHT}
              initialScrollIndex={ageIndex}
              getItemLayout={(_, index) => ({ length: AGE_ITEM_HEIGHT, offset: AGE_ITEM_HEIGHT * index, index })}
              contentContainerStyle={styles.ageListContent}
              onMomentumScrollEnd={onAgeScrollEnd}
              renderItem={({ item }) => {
                const selected = item === age;
                return (
                  <View style={styles.ageItem}>
                    <Text style={[styles.ageText, selected && styles.ageTextActive]}>{item}</Text>
                  </View>
                );
              }}
            />
            <View pointerEvents="none" style={styles.ageSelectionBand} />
          </View>
        </View>
      ) : null}

      {step === 4 ? (
        <View>
          <Text style={styles.question}>What’s your weight?</Text>
          <View style={styles.unitRow}>
            <Pressable style={[styles.unitChip, unit === 'kg' && styles.unitChipActive]} onPress={() => setUnit('kg')}>
              <Text style={[styles.unitChipText, unit === 'kg' && styles.unitChipTextActive]}>kg</Text>
            </Pressable>
            <Pressable style={[styles.unitChip, unit === 'lbs' && styles.unitChipActive]} onPress={() => setUnit('lbs')}>
              <Text style={[styles.unitChipText, unit === 'lbs' && styles.unitChipTextActive]}>lbs</Text>
            </Pressable>
          </View>

          <View style={styles.weightCard}>
            <Text style={styles.bigNumber}>{weightDisplay}</Text>
            <View style={styles.rulerWrap}>
              <FlatList
                ref={weightRef}
                horizontal
                data={weightValues}
                keyExtractor={(item) => `wt-${item}`}
                showsHorizontalScrollIndicator={false}
                decelerationRate="fast"
                snapToInterval={WEIGHT_TICK_WIDTH}
                initialScrollIndex={weightIndex}
                getItemLayout={(_, index) => ({ length: WEIGHT_TICK_WIDTH, offset: WEIGHT_TICK_WIDTH * index, index })}
                contentContainerStyle={{ paddingHorizontal: rulerSidePadding }}
                onMomentumScrollEnd={onWeightScrollEnd}
                renderItem={({ item }) => {
                  const selected = item === weightKg;
                  const major = item % 5 === 0;
                  return (
                    <View style={styles.tickItem}>
                      <View
                        style={[
                          styles.tick,
                          major && styles.tickMajor,
                          selected && styles.tickSelected
                        ]}
                      />
                      {major ? <Text style={styles.tickLabel}>{item}</Text> : <View style={styles.tickLabelSpacer} />}
                    </View>
                  );
                }}
              />
              <View pointerEvents="none" style={styles.rulerIndicator} />
            </View>
          </View>
        </View>
      ) : null}

      {step === 5 ? (
        <View>
          <Text style={styles.question}>How would you describe your mood?</Text>
          <View style={styles.rowWrap}>
            {moods.map((item) => {
              const active = mood === item.value;
              return (
                <Pressable key={item.value} style={[styles.moodCard, active && styles.moodCardActive]} onPress={() => setAssessmentMood(item.value)}>
                  <Text style={styles.moodEmoji}>{item.emoji}</Text>
                  <Text style={[styles.moodLabel, active && styles.optionLabelActive]}>{item.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {step === 6 ? (
        <View>
          <Text style={styles.question}>Have you sought professional help before?</Text>
          <View style={styles.binaryRow}>
            <Pressable style={[styles.binaryOption, soughtHelpBefore === 'Yes' && styles.binaryOptionActive]} onPress={() => setSoughtHelpBefore('Yes')}>
              <Text style={[styles.optionLabel, soughtHelpBefore === 'Yes' && styles.optionLabelActive]}>Yes</Text>
            </Pressable>
            <Pressable style={[styles.binaryOption, soughtHelpBefore === 'No' && styles.binaryOptionActive]} onPress={() => setSoughtHelpBefore('No')}>
              <Text style={[styles.optionLabel, soughtHelpBefore === 'No' && styles.optionLabelActive]}>No</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {step === 7 ? (
        <View>
          <Text style={styles.question}>Are you experiencing any physical distress?</Text>
          <View style={styles.binaryRow}>
            <Pressable style={[styles.binaryOption, physicalDistress === 'Yes' && styles.binaryOptionActive]} onPress={() => setPhysicalDistress('Yes')}>
              <Text style={[styles.optionLabel, physicalDistress === 'Yes' && styles.optionLabelActive]}>Yes</Text>
            </Pressable>
            <Pressable style={[styles.binaryOption, physicalDistress === 'No' && styles.binaryOptionActive]} onPress={() => setPhysicalDistress('No')}>
              <Text style={[styles.optionLabel, physicalDistress === 'No' && styles.optionLabelActive]}>No</Text>
            </Pressable>
          </View>
        </View>
      ) : null}

      {step === 8 ? (
        <View>
          <Text style={styles.question}>How would you rate your sleep quality?</Text>
          <View style={styles.list}>
            {sleepQualityLevels.map((item) => {
              const active = sleepQuality === item;
              return (
                <Pressable key={item} style={[styles.optionRow, active && styles.optionRowActive]} onPress={() => setSleepQuality(item)}>
                  <Text style={[styles.optionLabel, active && styles.optionLabelActive]}>{item}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {step === 9 ? (
        <View>
          <Text style={styles.question}>How would you rate your stress level?</Text>
          <View style={styles.stressRow}>
            {[1, 2, 3, 4, 5].map((value) => {
              const level = value as 1 | 2 | 3 | 4 | 5;
              const active = stressLevel === level;
              return (
                <Pressable key={value} style={[styles.stressChip, active && styles.stressChipActive]} onPress={() => setStressLevel(level)}>
                  <Text style={[styles.stressChipText, active && styles.stressChipTextActive]}>{value}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {step === 10 ? (
        <View>
          <Text style={styles.question}>AI Sound Analysis</Text>
          <View style={styles.voiceCard}>
            <View style={styles.ringOuter}>
              <View style={styles.ringMid}>
                <View style={styles.ringInner} />
              </View>
            </View>
            <Text style={styles.voiceCopy}>“I believe in myself and I can improve every day.”</Text>
          </View>
        </View>
      ) : null}

      </View>

      <View style={styles.footer}>
        <PrimaryButton title={isLast ? 'Finish Assessment' : 'Continue'} onPress={continueNext} />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  body: {
    flex: 1
  },
  footer: {
    paddingTop: 12
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    ...typography.bodyStrong,
    fontSize: 16
  },
  progress: {
    ...typography.caption,
    fontSize: 12,
    color: colors.textSecondary
  },
  question: {
    ...typography.title,
    fontSize: 26,
    lineHeight: 30,
    marginBottom: 16
  },
  list: {
    gap: 10,
    marginBottom: 20
  },
  optionRow: {
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 16,
    backgroundColor: '#2C2555',
    minHeight: 54,
    justifyContent: 'center',
    paddingHorizontal: 14
  },
  optionRowActive: {
    borderColor: '#9CC062',
    backgroundColor: '#6A8240'
  },
  optionLabel: {
    ...typography.body,
    fontSize: 14
  },
  optionLabelActive: {
    color: colors.white,
    fontWeight: '700'
  },
  ageWheelWrap: {
    height: AGE_ITEM_HEIGHT * 5,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: '#2C2555',
    marginBottom: 20,
    overflow: 'hidden'
  },
  ageListContent: {
    paddingVertical: AGE_ITEM_HEIGHT * 2
  },
  ageItem: {
    height: AGE_ITEM_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center'
  },
  ageText: {
    ...typography.title,
    fontSize: 34,
    color: '#7B78A7'
  },
  ageTextActive: {
    color: colors.white,
    fontSize: 46,
    lineHeight: 52
  },
  ageSelectionBand: {
    position: 'absolute',
    left: 16,
    right: 16,
    top: AGE_ITEM_HEIGHT * 2,
    height: AGE_ITEM_HEIGHT,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#B0CA7F',
    backgroundColor: 'rgba(156,192,98,0.22)'
  },
  unitRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12
  },
  unitChip: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.stroke,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#2C2555'
  },
  unitChipActive: {
    backgroundColor: '#F08A24',
    borderColor: '#F08A24'
  },
  unitChipText: {
    ...typography.body,
    fontSize: 14
  },
  unitChipTextActive: {
    color: '#231C40',
    fontWeight: '700'
  },
  weightCard: {
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 24,
    backgroundColor: '#2C2555',
    padding: 16,
    marginBottom: 20,
    alignItems: 'center'
  },
  bigNumber: {
    ...typography.title,
    fontSize: 44,
    lineHeight: 52,
    marginBottom: 12
  },
  rulerWrap: {
    width: '100%',
    height: 82,
    justifyContent: 'center'
  },
  tickItem: {
    width: WEIGHT_TICK_WIDTH,
    alignItems: 'center'
  },
  tick: {
    width: 2,
    height: 18,
    borderRadius: 1,
    backgroundColor: '#6A6495'
  },
  tickMajor: {
    height: 28,
    backgroundColor: '#938DC0'
  },
  tickSelected: {
    backgroundColor: '#9CC062'
  },
  tickLabel: {
    ...typography.caption,
    fontSize: 10,
    marginTop: 4,
    color: '#C7C1EA'
  },
  tickLabelSpacer: {
    height: 16,
    marginTop: 4
  },
  rulerIndicator: {
    position: 'absolute',
    alignSelf: 'center',
    width: 4,
    height: 46,
    borderRadius: 2,
    backgroundColor: '#9CC062'
  },
  rowWrap: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20
  },
  moodCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: '#2C2555',
    alignItems: 'center',
    paddingVertical: 14,
    gap: 6
  },
  moodCardActive: {
    borderColor: '#9CC062',
    backgroundColor: '#6A8240'
  },
  moodEmoji: {
    fontSize: 26
  },
  moodLabel: {
    ...typography.body,
    fontSize: 14
  },
  binaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20
  },
  binaryOption: {
    flex: 1,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: '#2C2555',
    alignItems: 'center',
    paddingVertical: 12
  },
  binaryOptionActive: {
    borderColor: '#9CC062',
    backgroundColor: '#6A8240'
  },
  stressRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20
  },
  stressChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.stroke,
    backgroundColor: '#2C2555'
  },
  stressChipActive: {
    borderColor: '#F08A24',
    backgroundColor: '#F08A24'
  },
  stressChipText: {
    ...typography.bodyStrong,
    fontSize: 16
  },
  stressChipTextActive: {
    color: '#231C40'
  },
  voiceCard: {
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 20,
    backgroundColor: '#2C2555',
    alignItems: 'center',
    padding: 20,
    gap: 14,
    marginBottom: 20
  },
  ringOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#D8E3C0',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ringMid: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#B4C68E',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ringInner: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#4A5D2B'
  },
  voiceCopy: {
    ...typography.body,
    textAlign: 'center',
    fontSize: 14
  }
});
