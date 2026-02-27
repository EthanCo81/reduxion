import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useStats } from '@/hooks/use-stats'; // <-- import the hook
import React, { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

export default function ScoreboardScreen() {
  const stats = useStats().stats;
  
  useEffect(() => {
    // This effect runs when the component mounts
  }, [stats]);

  const formatNumber = (num: number): string | number => {
    return num % 1 === 0 ? num : num.toFixed(2);
  };

  return (
    <ScrollView>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Scoreboard</ThemedText>
        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold">Total Solves</ThemedText>
          <ThemedText style={styles.value}>{formatNumber(stats.solves.easy + stats.solves.medium + stats.solves.hard)}</ThemedText>
        </ThemedView>
        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold">Solves per Difficulty</ThemedText>
          <View style={styles.row}><ThemedText>Easy:</ThemedText><ThemedText style={styles.value}>{formatNumber(stats.solves.easy)}</ThemedText></View>
          <View style={styles.row}><ThemedText>Medium:</ThemedText><ThemedText style={styles.value}>{formatNumber(stats.solves.medium)}</ThemedText></View>
          <View style={styles.row}><ThemedText>Hard:</ThemedText><ThemedText style={styles.value}>{formatNumber(stats.solves.hard)}</ThemedText></View>
        </ThemedView>
        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold">Average Moves per Solve</ThemedText>
          <View style={styles.row}><ThemedText>Easy:</ThemedText><ThemedText style={styles.value}>{formatNumber((stats.totalMoves.easy / stats.solves.easy) || 0)}</ThemedText></View>
          <View style={styles.row}><ThemedText>Medium:</ThemedText><ThemedText style={styles.value}>{formatNumber((stats.totalMoves.medium / stats.solves.medium) || 0)}</ThemedText></View>
          <View style={styles.row}><ThemedText>Hard:</ThemedText><ThemedText style={styles.value}>{formatNumber((stats.totalMoves.hard / stats.solves.hard) || 0)}</ThemedText></View>
        </ThemedView>
        <ThemedView style={styles.section}>
          <ThemedText type="defaultSemiBold">Fewest Moves to Solve</ThemedText>
          <View style={styles.row}><ThemedText>Easy:</ThemedText><ThemedText style={styles.value}>{formatNumber(stats.fewestMoves.easy)}</ThemedText></View>
          <View style={styles.row}><ThemedText>Medium:</ThemedText><ThemedText style={styles.value}>{formatNumber(stats.fewestMoves.medium)}</ThemedText></View>
          <View style={styles.row}><ThemedText>Hard:</ThemedText><ThemedText style={styles.value}>{formatNumber(stats.fewestMoves.hard)}</ThemedText></View>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    gap: 18,
  },
  title: {
    fontSize: 32,
    marginBottom: 18,
    textAlign: 'center',
  },
  section: {
    marginBottom: 18,
    padding: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(128,128,128,0.07)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  value: {
    fontWeight: 'bold',
    marginLeft: 12,
  },
});
