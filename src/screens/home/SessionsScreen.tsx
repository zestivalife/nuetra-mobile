import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { PrimaryButton } from '../../components/PrimaryButton';
import { RootStackParamList } from '../../navigation/types';
import { colors, typography } from '../../design/tokens';

type Nav = NativeStackNavigationProp<RootStackParamList>;

export const SessionsScreen = () => {
  const navigation = useNavigation<Nav>();
  const [gratitude, setGratitude] = useState('');
  const [shutdownDone, setShutdownDone] = useState(false);
  const [feedback, setFeedback] = useState('Pick one action. Small wins compound.');

  return (
    <Screen scroll>
      <Text style={styles.title}>Micro-Actions Library</Text>
      <View style={styles.list}>
        <Card>
          <Text style={styles.name}>2-min box breathing (4-4-4-4)</Text>
          <PrimaryButton
            title="Start Breathing"
            onPress={() => {
              setFeedback('Great choice. Two calm minutes now can reset your whole block.');
              navigation.navigate('BreathingSession');
            }}
          />
        </Card>
        <Card>
          <Text style={styles.name}>5-min walk activation</Text>
          <PrimaryButton
            title="Start Walk"
            onPress={() => {
              setFeedback('Nice. A short walk improves blood flow and focus.');
              navigation.navigate('MovementSession');
            }}
          />
        </Card>
        <Card>
          <Text style={styles.name}>1-min gratitude note</Text>
          <TextInput
            value={gratitude}
            onChangeText={setGratitude}
            placeholder="Write one thing you appreciate today"
            placeholderTextColor={colors.textMuted}
            style={styles.input}
          />
          <Pressable
            style={styles.inlineButton}
            onPress={() => setFeedback(gratitude.trim().length > 0 ? 'Saved. This is a strong resilience habit.' : 'Write one short line to complete this action.')}
          >
            <Text style={styles.inlineButtonText}>Save Note</Text>
          </Pressable>
        </Card>
        <Card>
          <Text style={styles.name}>End-of-day shutdown ritual</Text>
          <View style={styles.shutdownRow}>
            <Pressable style={[styles.toggle, shutdownDone && styles.toggleOn]} onPress={() => setShutdownDone((prev) => !prev)}>
              <Text style={styles.toggleText}>{shutdownDone ? 'Done' : 'Mark Complete'}</Text>
            </Pressable>
          </View>
        </Card>
        <Text style={styles.feedback}>{feedback}</Text>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    ...typography.section,
    marginBottom: 12
  },
  list: {
    gap: 10
  },
  name: {
    ...typography.bodyStrong,
    fontSize: 14,
    marginBottom: 10
  },
  input: {
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 12,
    backgroundColor: '#2D2655',
    color: colors.textPrimary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14
  },
  inlineButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: '#1B8AFB',
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  inlineButtonText: {
    ...typography.bodyStrong,
    fontSize: 14,
    color: colors.white
  },
  shutdownRow: {
    flexDirection: 'row'
  },
  toggle: {
    borderWidth: 1,
    borderColor: colors.stroke,
    borderRadius: 999,
    backgroundColor: '#2D2655',
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  toggleOn: {
    borderColor: '#35D18C',
    backgroundColor: '#1B4D3A'
  },
  toggleText: {
    ...typography.bodyStrong,
    fontSize: 14
  },
  feedback: {
    ...typography.body,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 2
  }
});
