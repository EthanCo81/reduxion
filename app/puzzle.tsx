import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { parseSharedPuzzleFromParams } from '@/constants/share';
import { setPendingSharedPuzzle } from '@/constants/shared-puzzle-store';

export default function SharedPuzzleScreen() {
  const params = useLocalSearchParams<{
    numbers?: string;
    target?: string;
    difficulty?: string;
  }>();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const puzzle = parseSharedPuzzleFromParams(params);
    if (puzzle) {
      setPendingSharedPuzzle(puzzle);
    }
    setReady(true);
  }, [params]);

  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <Redirect href="/(tabs)" />;
}
