import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Stats {
  solves: Record<Difficulty, number>;
  totalMoves: Record<Difficulty, number>;
  fewestMoves: Record<Difficulty, number>;
}

const DEFAULT_STATS: Stats = {
  solves: { easy: 0, medium: 0, hard: 0 },
  totalMoves: { easy: 0, medium: 0, hard: 0 },
  fewestMoves: { easy: 0, medium: 0, hard: 0 },
};

const STORAGE_KEY = 'reduxion_stats_v1';

export function useStats() {
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(data => {
      if (data) setStats(JSON.parse(data));
      setLoaded(true);
    });
  }, []);

  const recordSolve = useCallback((difficulty: Difficulty, moves: number) => {
    setStats(prev => {
      const newSolves = { ...prev.solves, [difficulty]: prev.solves[difficulty] + 1 };
      // Update average moves
      const newTotalMoves = prev.totalMoves[difficulty] + moves;
      // Update fewest moves
      const prevFewest = prev.fewestMoves[difficulty];
      const newFewest = prevFewest === 0 ? moves : Math.min(prevFewest, moves);
      const newStats = {
        ...prev,
        solves: newSolves,
        totalMoves: { ...prev.totalMoves, [difficulty]: newTotalMoves },
        fewestMoves: { ...prev.fewestMoves, [difficulty]: newFewest },
      };
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
      return newStats;
    });
  }, []);

  const resetStats = useCallback(() => {
    setStats(DEFAULT_STATS);
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_STATS));
  }, []);

  return { stats, loaded, recordSolve, resetStats };
}
