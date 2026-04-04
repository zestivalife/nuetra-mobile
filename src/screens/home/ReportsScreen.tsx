import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { typography } from '../../design/tokens';
import { useAppContext } from '../../state/AppContext';

export const ReportsScreen = () => {
  const { checkIns } = useAppContext();
  const latest = checkIns.slice(-7);
  const mood = latest.map((item) => item.mood);
  const energy = latest.map((item) => item.energy);
  const sleep = latest.map((item) => item.sleepQuality);

  const topPattern = latest.length === 0
    ? 'Complete check-ins to unlock weekly insight.'
    : latest.filter((item) => item.energy <= 2).length >= 3
      ? 'Energy dips cluster around busy afternoons.'
      : 'Mood is stable when sleep quality stays above 3.';

  return (
    <Screen scroll>
      <Text style={styles.title}>Weekly Insights</Text>
      <Card>
        <Text style={styles.heading}>Top pattern</Text>
        <Text style={styles.copy}>{topPattern}</Text>
        <Text style={styles.heading}>What helped</Text>
        <Text style={styles.copy}>Short breathing and hydration resets improved recovery consistency.</Text>
        <Text style={styles.heading}>What hurt</Text>
        <Text style={styles.copy}>Back-to-back meetings without breaks lowered next-block energy.</Text>
        <Text style={styles.heading}>One focus for next week</Text>
        <Text style={styles.copy}>Protect one 2-minute reset before your busiest meeting block each day.</Text>
      </Card>

      <Card>
        <Text style={styles.heading}>4-week trend</Text>
        <Text style={styles.copy}>Mood, energy, and sleep quality</Text>
        <View style={styles.chart}>
          {[mood, energy, sleep].map((series, rowIndex) => (
            <View key={rowIndex} style={styles.row}>
              {Array.from({ length: 4 }).map((_, col) => {
                const value = series[series.length - 4 + col] ?? 3;
                return <View key={col} style={[styles.bar, { height: 8 + value * 8 }]} />;
              })}
            </View>
          ))}
        </View>
      </Card>
    </Screen>
  );
};

const styles = StyleSheet.create({
  title: {
    ...typography.section,
    marginBottom: 12
  },
  heading: {
    ...typography.bodyStrong,
    fontSize: 14,
    marginTop: 8
  },
  copy: {
    ...typography.body,
    fontSize: 14,
    marginTop: 4
  },
  chart: {
    marginTop: 10,
    gap: 8
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end'
  },
  bar: {
    flex: 1,
    borderRadius: 6,
    backgroundColor: '#5E88F5'
  }
});
