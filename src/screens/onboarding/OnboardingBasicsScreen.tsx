import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { TextField } from '../../components/TextField';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, typography } from '../../design/tokens';
import { RootStackParamList } from '../../navigation/types';
import { CoreChallenge, OnboardingProfile } from '../../types';
import { useAppContext } from '../../state/AppContext';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingBasics'>;

const challenges: CoreChallenge[] = ['Stress', 'Sleep', 'Energy', 'Focus'];
const standardWorkHours = ['08:00 - 17:00', '09:00 - 18:00', '10:00 - 19:00', 'Flexible'] as const;

const baseProfile = (): OnboardingProfile => ({
  name: '',
  role: '',
  workHours: '',
  biggestChallenge: 'Stress',
  calendarProvider: 'None',
  calendarPermissionGranted: false,
  notificationPermissionGranted: false,
  createdAtISO: new Date().toISOString()
});

export const OnboardingBasicsScreen = ({ navigation }: Props) => {
  const { onboarding, setOnboarding } = useAppContext();
  const seed = useMemo(() => onboarding ?? baseProfile(), [onboarding]);

  const [name, setName] = useState(seed.name);
  const [role, setRole] = useState(seed.role);
  const [workHours, setWorkHours] = useState(seed.workHours);
  const [biggestChallenge, setBiggestChallenge] = useState<CoreChallenge>(seed.biggestChallenge);

  const continueNext = () => {
    setOnboarding({
      ...seed,
      name: name.trim() || 'Employee',
      role: role.trim() || 'Team Member',
      workHours: workHours.trim() || '09:00 - 18:00',
      biggestChallenge,
      createdAtISO: seed.createdAtISO || new Date().toISOString()
    });
    navigation.navigate('OnboardingCalendar');
  };

  return (
    <Screen scroll>
      <Text style={styles.title}>Set up your wellness copilot</Text>
      <Text style={styles.subtitle}>Three quick steps. No clutter, no overwhelm.</Text>

      <View style={styles.form}>
        <TextField label="Name" placeholder="Your name" value={name} onChangeText={setName} />
        <TextField label="Role" placeholder="Your role" value={role} onChangeText={setRole} />
        <TextField label="Work hours" placeholder="09:00 - 18:00" value={workHours} onChangeText={setWorkHours} />
      </View>

      <Text style={styles.label}>Standard working hours</Text>
      <View style={styles.options}>
        {standardWorkHours.map((item) => {
          const active = workHours === item;
          return (
            <Pressable key={item} style={[styles.option, active && styles.optionActive]} onPress={() => setWorkHours(item)}>
              <Text style={[styles.optionText, active && styles.optionTextActive]}>{item}</Text>
            </Pressable>
          );
        })}
      </View>

      <Text style={styles.label}>Biggest challenge</Text>
      <View style={styles.options}>
        {challenges.map((item) => {
          const active = item === biggestChallenge;
          return (
            <Pressable key={item} style={[styles.option, active && styles.optionActive]} onPress={() => setBiggestChallenge(item)}>
              <Text style={[styles.optionText, active && styles.optionTextActive]}>{item}</Text>
            </Pressable>
          );
        })}
      </View>

      <PrimaryButton title="Continue" onPress={continueNext} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    ...typography.title,
    fontSize: 24,
    lineHeight: 30
  },
  subtitle: {
    ...typography.body,
    marginTop: 8,
    marginBottom: 20
  },
  form: {
    gap: 12,
    marginBottom: 16
  },
  label: {
    ...typography.bodyStrong,
    fontSize: 14,
    marginBottom: 10
  },
  options: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20
  },
  option: {
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 999,
    backgroundColor: '#2F2858',
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  optionActive: {
    backgroundColor: '#1B8AFB',
    borderColor: '#1B8AFB'
  },
  optionText: {
    ...typography.body,
    fontSize: 14,
    color: colors.textPrimary
  },
  optionTextActive: {
    color: colors.white,
    fontWeight: '700'
  }
});
