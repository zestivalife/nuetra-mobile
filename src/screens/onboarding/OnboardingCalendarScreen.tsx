import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, typography } from '../../design/tokens';
import { RootStackParamList } from '../../navigation/types';
import { CalendarProvider, OnboardingProfile } from '../../types';
import { useAppContext } from '../../state/AppContext';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingCalendar'>;

const providers: CalendarProvider[] = ['Google', 'Outlook'];

const fallbackProfile = (): OnboardingProfile => ({
  name: 'Employee',
  role: 'Team Member',
  workHours: '09:00 - 18:00',
  biggestChallenge: 'Stress',
  calendarProvider: 'None',
  calendarPermissionGranted: false,
  notificationPermissionGranted: false,
  createdAtISO: new Date().toISOString()
});

export const OnboardingCalendarScreen = ({ navigation }: Props) => {
  const { onboarding, setOnboarding } = useAppContext();
  const profile = onboarding ?? fallbackProfile();

  const selectProvider = (provider: CalendarProvider) => {
    setOnboarding({
      ...profile,
      calendarProvider: provider,
      calendarPermissionGranted: true
    });
  };

  const continueNext = () => {
    setOnboarding({
      ...profile,
      calendarPermissionGranted: profile.calendarProvider !== 'None'
    });
    navigation.navigate('OnboardingNotifications');
  };

  return (
    <Screen>
      <View style={styles.body}>
        <Text style={styles.title}>Connect your calendar</Text>
        <Text style={styles.subtitle}>We only use your calendar to protect your time and avoid interruptions.</Text>

        <View style={styles.list}>
          {providers.map((provider) => {
            const active = profile.calendarProvider === provider;
            return (
              <Pressable key={provider} style={[styles.option, active && styles.optionActive]} onPress={() => selectProvider(provider)}>
                <Text style={[styles.optionTitle, active && styles.optionTitleActive]}>{provider}</Text>
                <Text style={styles.optionCopy}>Connect securely and block nudges during meetings.</Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <PrimaryButton title="Continue" onPress={continueNext} />
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
  title: {
    ...typography.title
  },
  subtitle: {
    ...typography.body,
    marginTop: 8,
    marginBottom: 18
  },
  list: {
    gap: 10,
    marginBottom: 18
  },
  option: {
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 16,
    backgroundColor: '#2B2450',
    paddingHorizontal: 14,
    paddingVertical: 14
  },
  optionActive: {
    borderColor: '#1B8AFB',
    backgroundColor: '#20385E'
  },
  optionTitle: {
    ...typography.bodyStrong,
    fontSize: 14
  },
  optionTitleActive: {
    color: colors.white
  },
  optionCopy: {
    ...typography.body,
    fontSize: 14,
    marginTop: 4
  }
});
