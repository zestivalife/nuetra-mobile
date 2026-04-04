import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../../components/Screen';
import { Card } from '../../components/Card';
import { typography } from '../../design/tokens';
import { useAppContext } from '../../state/AppContext';
import { toDayKey } from '../../utils/date';

export const TrackerScreen = () => {
  const { checkIns, nudges } = useAppContext();
  const last30 = checkIns.slice(-30);

  const streak = (() => {
    let count = 0;
    const daySet = new Set(last30.map((item) => toDayKey(item.dateISO)));
    const cursor = new Date();
    for (let i = 0; i < 30; i += 1) {
      const key = cursor.toISOString().slice(0, 10);
      if (!daySet.has(key)) {
        break;
      }
      count += 1;
      cursor.setUTCDate(cursor.getUTCDate() - 1);
    }
    return count;
  })();

  const bestEnergy = last30.length > 0 ? Math.max(...last30.map((item) => item.energy)) : 0;
  const bestSleep = last30.length > 0 ? Math.max(...last30.map((item) => item.sleepQuality)) : 0;
  const nudgeResponseRate = nudges.length === 0 ? 0 : Math.round((Math.min(nudges.length, checkIns.length) / nudges.length) * 100);

  return (
    <Screen scroll>
      <Text style={styles.title}>Progress</Text>
      <Card>
        <Text style={styles.metricTitle}>30-day trends</Text>
        <Text style={styles.copy}>Check-ins logged: {last30.length}</Text>
        <Text style={styles.copy}>Check-in streak: {streak} day{streak === 1 ? '' : 's'}</Text>
      </Card>
      <Card>
        <Text style={styles.metricTitle}>Personal records</Text>
        <Text style={styles.copy}>Best energy score: {bestEnergy}/5</Text>
        <Text style={styles.copy}>Best sleep quality: {bestSleep}/5</Text>
      </Card>
      <Card>
        <Text style={styles.metricTitle}>Nudge response rate</Text>
        <View style={styles.rateRow}>
          <Text style={styles.rate}>{nudgeResponseRate}%</Text>
          <Text style={styles.copy}>based on check-in follow-through</Text>
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
  metricTitle: {
    ...typography.bodyStrong,
    fontSize: 14,
    marginBottom: 6
  },
  copy: {
    ...typography.body,
    fontSize: 14,
    marginBottom: 4
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8
  },
  rate: {
    ...typography.title,
    fontSize: 24
  }
});
