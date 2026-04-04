import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { PrimaryButton } from '../../components/PrimaryButton';
import { colors, typography } from '../../design/tokens';
import { RootStackParamList } from '../../navigation/types';
import { OnboardingProfile } from '../../types';
import { useAppContext } from '../../state/AppContext';

type Props = NativeStackScreenProps<RootStackParamList, 'OnboardingNotifications'>;

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

export const OnboardingNotificationsScreen = ({ navigation }: Props) => {
  const { onboarding, setOnboarding } = useAppContext();
  const profile = onboarding ?? fallbackProfile();

  const allowNotifications = () => {
    setOnboarding({
      ...profile,
      notificationPermissionGranted: true
    });
  };

  const complete = () => {
    if (!profile.notificationPermissionGranted) {
      allowNotifications();
    }
    navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }]
    });
  };

  return (
    <Screen>
      <Text style={styles.title}>Smart nudges only</Text>
      <Text style={styles.subtitle}>We only nudge when it matters.</Text>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Notification Promise</Text>
        <Text style={styles.cardCopy}>No spam, no guilt. Max 3 nudges/day, never during meetings.</Text>
      </View>

      <Pressable style={styles.permissionButton} onPress={allowNotifications}>
        <Text style={styles.permissionText}>Allow notifications</Text>
      </Pressable>

      <PrimaryButton title="Finish setup" onPress={complete} />
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    ...typography.title
  },
  subtitle: {
    ...typography.body,
    marginTop: 8,
    marginBottom: 18
  },
  card: {
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 16,
    backgroundColor: '#2B2450',
    padding: 14,
    marginBottom: 16
  },
  cardTitle: {
    ...typography.bodyStrong,
    fontSize: 14
  },
  cardCopy: {
    ...typography.body,
    fontSize: 14,
    marginTop: 6
  },
  permissionButton: {
    borderWidth: 1,
    borderColor: '#1B8AFB',
    borderRadius: 999,
    backgroundColor: '#213D67',
    alignItems: 'center',
    paddingVertical: 12,
    marginBottom: 12
  },
  permissionText: {
    ...typography.bodyStrong,
    fontSize: 14,
    color: colors.white
  }
});
