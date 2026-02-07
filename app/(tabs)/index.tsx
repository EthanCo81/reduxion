import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useStats } from '@/hooks/use-stats'; // Import the hook
import { useThemeColor } from '@/hooks/use-theme-color';
import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function GameScreen() {
  const [currentNumbers, setCurrentNumbers] = useState<number[]>([]);
  const [initialNumbers, setInitialNumbers] = useState<number[]>([]);
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [history, setHistory] = useState<number[][]>([]);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [menuVisible, setMenuVisible] = useState(false);

  const primaryColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const { recordSolve } = useStats(); // Get the recordSolve method

  useEffect(() => {
    startNewGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  useEffect(() => {
    checkWinCondition();
  }, [currentNumbers]);

  // Handler to record the solve
  const handleWin = () => {
    if (!gameWon) {
      recordSolve(difficulty, moves);
      setGameWon(true);
    }
  };

  // Update checkWinCondition to use handleWin
  const checkWinCondition = () => {
    if (currentNumbers.some(num => num === targetNumber) && !gameWon) {
      handleWin();
    }
  };

  const startNewGame = () => {
    let nums: number[] = [];
    let target: number;
    if (difficulty === 'easy') {
      // One even and one odd 1-digit number (1-9)
      let even = Math.ceil(Math.random() * 3) * 2 + 2; // 4,6,8
      let odd = (Math.ceil(Math.random() * 3) + 2) * 2 - 1; // 5,7,9
      nums = Math.random() < 0.5 ? [even, odd] : [odd, even];
      target = Math.floor(Math.random() * 90) + 10; // 10-99
    } else if (difficulty === 'medium') {
      // One even and one odd 2-digit number (10-99)
      let even = Math.floor(Math.random() * 45) * 2 + 10; // 10-98 even
      let odd = Math.floor(Math.random() * 45) * 2 + 11;  // 11-99 odd
      nums = Math.random() < 0.5 ? [even, odd] : [odd, even];
      target = Math.floor(Math.random() * 900) + 100; // 100-999
    } else {
      // hard: One even and one odd 3-digit number (100-999)
      let even = Math.floor(Math.random() * 450) * 2 + 100; // 100-998 even
      let odd = Math.floor(Math.random() * 450) * 2 + 101;  // 101-999 odd
      nums = Math.random() < 0.5 ? [even, odd] : [odd, even];
      target = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
    }
    setInitialNumbers(nums);
    setCurrentNumbers(nums);
    setTargetNumber(target);
    setSelectedNumbers([]);
    setMoves(0);
    setGameWon(false);
    setHistory([]);
  };

  const resetGame = () => {
    setCurrentNumbers([...initialNumbers]);
    setSelectedNumbers([]);
    setMoves(0);
    setGameWon(false);
    setHistory([]);
  };

  const undoMove = () => {
    if (history.length === 0) return;
    
    const previousState = history[history.length - 1];
    setCurrentNumbers(previousState);
    setHistory(history.slice(0, -1));
    setSelectedNumbers([]);
    setMoves(Math.max(0, moves - 1));
    setGameWon(false);
  };

  const toggleNumberSelection = (index: number) => {
    if (selectedNumbers.includes(index)) {
      setSelectedNumbers(selectedNumbers.filter(i => i !== index));
    } else if (selectedNumbers.length < 2) {
      setSelectedNumbers([...selectedNumbers, index]);
    }
  };

  const handleSplit = () => {
    if (selectedNumbers.length !== 1) return;
    const num = currentNumbers[selectedNumbers[0]];
    // Only allow splitting even numbers >= 2
    if (num < 2 || num % 2 !== 0) return;
    // Check if split would exceed 4 numbers
    if (currentNumbers.length >= 4) return;
    const newNumbers = [...currentNumbers];
    newNumbers.splice(selectedNumbers[0], 1);
    const half = num / 2;
    newNumbers.push(half, half);
    setHistory([...history, currentNumbers]);
    setCurrentNumbers(newNumbers.filter(n => n !== 0));
    setSelectedNumbers([]);
    setMoves(moves + 1);
  };

  // Square root operation removed

  const handleAdd = () => {
    if (selectedNumbers.length !== 2) return;
    
    const [idx1, idx2] = selectedNumbers.sort((a, b) => b - a);
    const result = currentNumbers[idx1] + currentNumbers[idx2];
    
    const newNumbers = [...currentNumbers];
    newNumbers.splice(idx1, 1);
    newNumbers.splice(idx2, 1);
    newNumbers.push(result);
    
    setHistory([...history, currentNumbers]);
    setCurrentNumbers(newNumbers.filter(n => n !== 0));
    setSelectedNumbers([]);
    setMoves(moves + 1);
  };

  const handleSubtract = () => {
    if (selectedNumbers.length !== 2) return;
    
    const [idx1, idx2] = selectedNumbers;
    const result = Math.abs(currentNumbers[idx1] - currentNumbers[idx2]);
    
    const sortedIndices = [idx1, idx2].sort((a, b) => b - a);
    const newNumbers = [...currentNumbers];
    newNumbers.splice(sortedIndices[0], 1);
    newNumbers.splice(sortedIndices[1], 1);
    newNumbers.push(result);
    
    setHistory([...history, currentNumbers]);
    setCurrentNumbers(newNumbers.filter(n => n !== 0));
    setSelectedNumbers([]);
    setMoves(moves + 1);
  };

  const handleMultiply = () => {
    if (selectedNumbers.length !== 2) return;
    
    const [idx1, idx2] = selectedNumbers.sort((a, b) => b - a);
    const result = currentNumbers[idx1] * currentNumbers[idx2];
    
    const newNumbers = [...currentNumbers];
    newNumbers.splice(idx1, 1);
    newNumbers.splice(idx2, 1);
    newNumbers.push(result);
    
    setHistory([...history, currentNumbers]);
    setCurrentNumbers(newNumbers.filter(n => n !== 0));
    setSelectedNumbers([]);
    setMoves(moves + 1);
  };

  const handleDifficultyChange = (newDifficulty: 'easy' | 'medium' | 'hard') => {
    setDifficulty(newDifficulty);
    setMenuVisible(false);
  }

  const singleNumberSelected = selectedNumbers.length === 1;
  const twoNumbersSelected = selectedNumbers.length === 2;
  const selectedNum = singleNumberSelected ? currentNumbers[selectedNumbers[0]] : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: backgroundColor }}>
    <ThemedView style={[styles.container, gameWon && styles.winContainerPadding]}>
      <ThemedView style={styles.header}>
        <ThemedView style={styles.gameInfo}>
          <ThemedView style={styles.infoBox}>
            <ThemedText style={styles.label}>Target:</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.infoNumber}>{targetNumber}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoBox}>
            <ThemedText style={styles.label}>Moves:</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.infoNumber}>{moves}</ThemedText>
          </ThemedView>
        </ThemedView>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}>
            {
              difficulty === 'easy' ? (
                <IconSymbol name="lightbulb" size={28} color={primaryColor} />
              ) : difficulty === 'medium' ? (
                <IconSymbol name="lightbulb.min" size={28} color={primaryColor} />
              ) : (
                <IconSymbol name="lightbulb.max" size={28} color={primaryColor} />
              )
            }
        </TouchableOpacity>
      </ThemedView>
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPressOut={() => setMenuVisible(false)}>
          <View style={styles.menuDropdown}>
            <TouchableOpacity onPress={() => { handleDifficultyChange('easy'); } } style={styles.menuItem}>
              <ThemedText style={difficulty === 'easy' ? styles.menuItemSelected : undefined}>Easy</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { handleDifficultyChange('medium'); }} style={styles.menuItem}>
              <ThemedText style={difficulty === 'medium' ? styles.menuItemSelected : undefined}>Medium</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { handleDifficultyChange('hard'); }} style={styles.menuItem}>
              <ThemedText style={difficulty === 'hard' ? styles.menuItemSelected : undefined}>Hard</ThemedText>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      {gameWon ? (
        <ThemedView style={styles.winContainer}>
          <ThemedText 
            type='title'
            style={{ color: primaryColor }}
            adjustsFontSizeToFit>
            SOLVED
          </ThemedText>
          <ThemedText style={styles.winSubtext}>
            Completed in {moves} moves
          </ThemedText>
          <Pressable
            style={[styles.button, { backgroundColor: primaryColor }]}
            onPress={startNewGame}>
            <ThemedText style={styles.winButtonText}>Play Again</ThemedText>
          </Pressable>
        </ThemedView>
      ) : (
        <>
          <ThemedView style={styles.numbersContainer}>
            <ThemedView style={styles.numbersGrid}>
              {currentNumbers.map((num, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.numberBox,
                    { borderColor: primaryColor },
                    selectedNumbers.includes(index) && { backgroundColor: primaryColor }
                  ]}
                  onPress={() => toggleNumberSelection(index)}>
                  <Text 
                    adjustsFontSizeToFit
                    numberOfLines={1}
                    style={[
                      styles.numberText,
                      { color: textColor },
                      selectedNumbers.includes(index) && styles.selectedNumberText
                    ]}>
                    {num}
                  </Text>
                </Pressable>
              ))}
            </ThemedView>
          </ThemedView>

          <ThemedView style={styles.operationsContainer}>
            <ThemedView style={styles.operationRowWithSides}>
              <Pressable
                style={styles.sideButton}
                onPress={resetGame}>
                <IconSymbol name="restart.circle" size={28} color={primaryColor} />
              </Pressable>
              <ThemedView style={styles.operationGrid}>
                <ThemedView style={styles.gridRow}>
                  <Pressable
                    style={[
                      styles.operationButton,
                      { backgroundColor: primaryColor },
                      (!singleNumberSelected || selectedNum < 2 || currentNumbers.length >= 4) && styles.buttonDisabled
                    ]}
                    onPress={handleSplit}
                    disabled={!singleNumberSelected || selectedNum < 2 || currentNumbers.length >= 4}>
                    <IconSymbol name="rectangle.fill.on.rectangle.fill" size={32} color="#fff" />
                  </Pressable>
                  <Pressable
                    style={[
                      styles.operationButton,
                      { backgroundColor: primaryColor },
                      !twoNumbersSelected && styles.buttonDisabled
                    ]}
                    onPress={handleAdd}
                    disabled={!twoNumbersSelected}>
                    <ThemedText style={styles.buttonText}>+</ThemedText>
                  </Pressable>
                </ThemedView>
                <ThemedView style={styles.gridRow}>
                  <Pressable
                    style={[
                      styles.operationButton,
                      { backgroundColor: primaryColor },
                      !twoNumbersSelected && styles.buttonDisabled
                    ]}
                    onPress={handleSubtract}
                    disabled={!twoNumbersSelected}>
                    <ThemedText style={styles.buttonText}>−</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.operationButton,
                      { backgroundColor: primaryColor },
                      !twoNumbersSelected && styles.buttonDisabled
                    ]}
                    onPress={handleMultiply}
                    disabled={!twoNumbersSelected}>
                    <ThemedText style={styles.buttonText}>×</ThemedText>
                  </Pressable>
                </ThemedView>
              </ThemedView>
              <Pressable
                style={[styles.sideButton, history.length === 0 && styles.disabledButton]}
                onPress={undoMove}
                disabled={history.length === 0}>
                <IconSymbol name="arrow.uturn.left.circle" size={28} color={primaryColor} />
              </Pressable>
            </ThemedView>
          </ThemedView>
        </>
      )}
    </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  winContainerPadding: {
    padding: 0,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
  },
  instructions: {
    textAlign: 'center',
    paddingHorizontal: 20,
    marginBottom: 20,
    fontSize: 16,
    lineHeight: 24,
  },
  header: {
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  resetIconButton: {
    padding: 8,
  },
  undoText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.3,
  },
  disabledText: {
    opacity: 0.3,
  },
  gameInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 10,
  },
  infoBox: {
    flex: 1,
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(128, 128, 128, 0.1)',
  },
  label: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  infoNumber: {
    fontSize: 20,
  },
  numbersContainer: {
    marginBottom: 20,
    minHeight: 240,
    justifyContent: 'center',
  },
  numbersGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: 250,
    alignSelf: 'center',
  },
  numberBox: {
    borderWidth: 3,
    borderRadius: 12,
    padding: 15,
    width: '45%',
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridNumberBox: {
    width: '47%',
    minWidth: 0,
  },
  numberText: {
    fontSize: 40,
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'center',
  },
  selectedNumberText: {
    color: '#fff',
  },
  operationsContainer: {
    marginBottom: 20,
  },
  operationGrid: {
    flexDirection: 'column',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  gridRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  operationButton: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 80,
    minHeight: 80,
    justifyContent: 'center',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: 200,
  },
  buttonText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: '600',
  },
  winButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '600',
  },
  buttonSubtext: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    opacity: 0.9,
  },
  buttonDisabled: {
    opacity: 0.3,
  },
  winContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    flex: 1,
  },
  winText: {
    fontSize: 48,
    textAlign: 'center',
    justifyContent: 'center',
    maxWidth: '100%',
    flex: 1,
  },
  winSubtext: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  operationRowWithSides: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginBottom: 20,
  },
  sideButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 999,
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#eee',
    width: 48,
    height: 48,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  menuButton: {
    padding: 8,
    marginLeft: 8,
  },
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.2)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  menuDropdown: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 60,
    marginRight: 16,
    paddingVertical: 8,
    minWidth: 120,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  menuItemSelected: {
    fontWeight: 'bold',
    color: '#007AFF',
  },
});
