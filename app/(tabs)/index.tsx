import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import {
  buildShareMessage,
  buildShareUrl,
  type Difficulty,
  type SharedPuzzle,
} from '@/constants/share';
import {
  consumePendingSharedPuzzle,
  subscribeSharedPuzzle,
} from '@/constants/shared-puzzle-store';
import { useStats } from '@/hooks/use-stats';
import { useThemeColor } from '@/hooks/use-theme-color';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import { Modal, Platform, Pressable, Share, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Pick a font size that keeps every digit on one line inside the tile. */
function getNumberFontSize(num: number, difficulty: Difficulty): number {
  const digits = String(Math.abs(num)).length;
  const base = difficulty === 'hard' ? 18 : difficulty === 'medium' ? 24 : 40;
  if (digits <= 2) return base;
  if (digits === 3) return Math.round(base * 0.72);
  if (digits === 4) return Math.round(base * 0.55);
  return Math.max(Math.round(base * 0.42), 10);
}

const TOOLTIP_STEPS = [
  {
    title: 'Welcome to Reduxion!',
    message: 'Your goal is to reach the Target number using math operations on the numbers shown.',
  },
  {
    title: 'Select Numbers',
    message: 'Tap one or two number tiles to select them. Selected tiles will be highlighted.',
  },
  {
    title: 'Split',
    message: 'Select one even number (greater than 2), then tap Split to divide it into two equal halves.',
  },
  {
    title: 'Add, Subtract, Multiply',
    message: 'Select two numbers, then tap an operation to combine them into a single new number.',
  },
  {
    title: 'Undo & Reset',
    message: 'Use the undo button (left arrow) to reverse your last move, or the reset button (circular arrow) to start over.',
  },
  {
    title: 'Difficulty',
    message: 'Tap the lightbulb icon to change difficulty. Harder levels use bigger numbers!',
  },
  {
    title: 'Winning',
    message: 'If any number on screen matches the Target, you win! Try to solve it in as few moves as possible.',
  },
];

const TUTORIAL_KEY = 'reduxion_tutorial_shown_v1';

export default function GameScreen() {
  const [currentNumbers, setCurrentNumbers] = useState<number[]>([]);
  const [initialNumbers, setInitialNumbers] = useState<number[]>([]);
  const [targetNumber, setTargetNumber] = useState<number>(0);
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [gameWon, setGameWon] = useState<boolean>(false);
  const [history, setHistory] = useState<number[][]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [menuVisible, setMenuVisible] = useState(false);
  const [tooltipStep, setTooltipStep] = useState<number | null>(null);
  const skipDifficultyRegen = useRef(false);

  const primaryColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const iconColor = useThemeColor({}, 'icon');
  const operationButtonBg = useThemeColor({ light: '#0a7ea4', dark: '#555' }, 'tint');
  const selectedNumberBg = operationButtonBg;
  const { recordSolve } = useStats();

  useEffect(() => {
    AsyncStorage.getItem(TUTORIAL_KEY).then(value => {
      if (!value) {
        setTooltipStep(0);
        AsyncStorage.setItem(TUTORIAL_KEY, 'true');
      }
    });
  }, []);

  useEffect(() => {
    if (skipDifficultyRegen.current) {
      skipDifficultyRegen.current = false;
      return;
    }

    const pendingPuzzle = consumePendingSharedPuzzle();
    if (pendingPuzzle) {
      loadSharedPuzzle(pendingPuzzle);
      return;
    }

    startNewGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  useEffect(() => {
    return subscribeSharedPuzzle((puzzle) => {
      consumePendingSharedPuzzle();
      loadSharedPuzzle(puzzle);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty]);

  useEffect(() => {
    checkWinCondition();
  }, [currentNumbers]);

  const handleWin = () => {
    if (!gameWon) {
      recordSolve(difficulty, moves);
      setGameWon(true);
    }
  };

  const checkWinCondition = () => {
    if (currentNumbers.some(num => num === targetNumber) && !gameWon) {
      handleWin();
    }
  };

  const applyPuzzle = (nums: number[], target: number) => {
    setInitialNumbers(nums);
    setCurrentNumbers(nums);
    setTargetNumber(target);
    setSelectedNumbers([]);
    setMoves(0);
    setGameWon(false);
    setHistory([]);
  };

  const loadSharedPuzzle = (puzzle: SharedPuzzle) => {
    if (puzzle.difficulty !== difficulty) {
      skipDifficultyRegen.current = true;
      setDifficulty(puzzle.difficulty);
    }
    applyPuzzle(puzzle.numbers, puzzle.target);
  };

  const startNewGame = () => {
    let nums: number[] = [];
    let target: number;
    if (difficulty === 'easy') {
      let even = Math.ceil(Math.random() * 3) * 2 + 2;
      let odd = (Math.ceil(Math.random() * 3) + 2) * 2 - 1;
      let third = Math.floor(Math.random() * 9) + 1;
      nums = [even, odd, third];
      target = Math.floor(Math.random() * 90) + 10;
    } else if (difficulty === 'medium') {
      let n1 = Math.floor(Math.random() * 18) * 2 + 26; // 26-60 even
      let n2 = Math.floor(Math.random() * 18) * 2 + 25; // 25-59 odd
      let n3 = Math.floor(Math.random() * 8) * 2 + 10;  // 10-24 even
      let n4 = Math.floor(Math.random() * 8) * 2 + 11;  // 11-25 odd
      let n5 = Math.floor(Math.random() * 4) * 2 + 2;   // 2-8 even
      let n6 = Math.floor(Math.random() * 4) * 2 + 3;   // 3-9 odd
      nums = [n1, n2, n3, n4, n5, n6];
      target = Math.floor(Math.random() * 299) + 201; // 201-499
    } else {
      let n1 = Math.floor(Math.random() * 4) * 2 + 2;    // 2-8 even
      let n2 = Math.floor(Math.random() * 4) * 2 + 3;    // 3-9 odd
      let n3 = Math.floor(Math.random() * 21) * 2 + 10;  // 10-50 even
      let n4 = Math.floor(Math.random() * 20) * 2 + 11;  // 11-49 odd
      let n5 = Math.floor(Math.random() * 25) * 2 + 52;  // 52-100 even -> clamp to 98
      if (n5 > 98) n5 = 98;
      let n6 = Math.floor(Math.random() * 24) * 2 + 51;  // 51-97 odd
      let n7 = Math.floor(Math.random() * 49) + 51;      // 51-99 either
      let n8 = Math.floor(Math.random() * 50) * 2 + 100; // 100-198 even
      let n9 = Math.floor(Math.random() * 50) * 2 + 101; // 101-199 odd
      let n10 = Math.floor(Math.random() * 100) + 100;   // 100-199 either
      nums = [n1, n2, n3, n4, n5, n6, n7, n8, n9, n10];
      target = Math.floor(Math.random() * 9000) + 1000;
    }
    applyPuzzle(nums, target);
  };

  const handleShare = async () => {
    const puzzle: SharedPuzzle = {
      numbers: initialNumbers,
      target: targetNumber,
      difficulty,
    };
    const shareUrl = buildShareUrl(puzzle);
    try {
      await Share.share({
        message: buildShareMessage(targetNumber, moves, shareUrl),
      });
    } catch {
      // User dismissed the share sheet or sharing is unavailable.
    }
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

  const maxNumbers = difficulty === 'easy' ? 4 : difficulty === 'medium' ? 9 : 16;

  const handleSplit = () => {
    if (selectedNumbers.length !== 1) return;
    const num = currentNumbers[selectedNumbers[0]];
    if (num <= 2 || num % 2 !== 0) return;
    if (currentNumbers.length >= maxNumbers) return;
    const newNumbers = [...currentNumbers];
    newNumbers.splice(selectedNumbers[0], 1);
    const half = num / 2;
    newNumbers.push(half, half);
    setHistory([...history, currentNumbers]);
    setCurrentNumbers(newNumbers.filter(n => n !== 0));
    setSelectedNumbers([]);
    setMoves(moves + 1);
  };

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

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setDifficulty(newDifficulty);
    setMenuVisible(false);
  };

  const advanceTooltip = () => {
    if (tooltipStep !== null && tooltipStep < TOOLTIP_STEPS.length - 1) {
      setTooltipStep(tooltipStep + 1);
    } else {
      setTooltipStep(null);
    }
  };

  const singleNumberSelected = selectedNumbers.length === 1;
  const twoNumbersSelected = selectedNumbers.length === 2;
  const selectedNum = singleNumberSelected ? currentNumbers[selectedNumbers[0]] : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: backgroundColor }}>
    <ThemedView style={[styles.container, gameWon && styles.winContainerPadding]}>
      <ThemedView style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => setMenuVisible(true)}>
            <IconSymbol name="lightbulb" size={28} color={primaryColor} />
        </TouchableOpacity>
        <ThemedView style={styles.gameInfo}>
          <ThemedView style={styles.infoBox}>
            <ThemedText style={styles.label}>Target:</ThemedText>
            <ThemedText
              type="defaultSemiBold"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.5}
              style={styles.infoNumber}>
              {targetNumber}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.infoBox}>
            <ThemedText style={styles.label}>Moves:</ThemedText>
            <ThemedText
              type="defaultSemiBold"
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.5}
              style={styles.infoNumber}>
              {moves}
            </ThemedText>
          </ThemedView>
        </ThemedView>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={startNewGame}>
          <IconSymbol name="arrow.trianglehead.2.clockwise" size={28} color={primaryColor} />
        </TouchableOpacity>
      </ThemedView>

      {/* Tooltip Overlay */}
      <Modal
        visible={tooltipStep !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setTooltipStep(null)}>
        <Pressable style={styles.tooltipOverlay} onPress={advanceTooltip}>
          <View style={[styles.tooltipCard, { backgroundColor }]}>
            <ThemedText type="subtitle" style={styles.tooltipTitle}>
              {tooltipStep !== null ? TOOLTIP_STEPS[tooltipStep].title : ''}
            </ThemedText>
            <ThemedText style={styles.tooltipMessage}>
              {tooltipStep !== null ? TOOLTIP_STEPS[tooltipStep].message : ''}
            </ThemedText>
            <ThemedView style={styles.tooltipFooter}>
              <ThemedText style={styles.tooltipProgress}>
                {tooltipStep !== null ? `${tooltipStep + 1} / ${TOOLTIP_STEPS.length}` : ''}
              </ThemedText>
              <Pressable onPress={advanceTooltip} style={[styles.tooltipButton, { backgroundColor: operationButtonBg }]}>
                <Text style={styles.tooltipButtonText}>
                  {tooltipStep !== null && tooltipStep < TOOLTIP_STEPS.length - 1 ? 'Next' : 'Got it!'}
                </Text>
              </Pressable>
            </ThemedView>
            <Pressable onPress={() => setTooltipStep(null)}>
              <ThemedText style={styles.tooltipSkip}>Skip</ThemedText>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {/* Menu Modal */}
      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}>
        <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPressOut={() => setMenuVisible(false)}>
          <View style={[styles.menuDropdown, { backgroundColor }]}>
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
            style={[styles.button, { backgroundColor: operationButtonBg }]}
            onPress={handleShare}>
            <Text style={styles.winButtonText}>Share</Text>
          </Pressable>
          <Pressable
            style={[styles.button, styles.secondaryButton, { borderColor: primaryColor }]}
            onPress={startNewGame}>
            <Text style={[styles.winButtonText, { color: primaryColor }]}>Play Again</Text>
          </Pressable>
        </ThemedView>
      ) : (
        <>
          <ThemedView style={styles.numbersContainer}>
            <ThemedView style={[
              styles.numbersGrid,
              difficulty === 'medium' && styles.numbersGrid3x3,
              difficulty === 'hard' && styles.numbersGrid4x4,
            ]}>
              {currentNumbers.map((num, index) => (
                <Pressable
                  key={index}
                  style={[
                    styles.numberBox,
                    difficulty === 'medium' && styles.numberBox3x3,
                    difficulty === 'hard' && styles.numberBox4x4,
                    { borderColor: primaryColor },
                    selectedNumbers.includes(index) && { backgroundColor: selectedNumberBg }
                  ]}
                  onPress={() => toggleNumberSelection(index)}>
                  <Text
                    adjustsFontSizeToFit
                    minimumFontScale={0.35}
                    numberOfLines={1}
                    style={[
                      styles.numberText,
                      { color: textColor, fontSize: getNumberFontSize(num, difficulty) },
                      selectedNumbers.includes(index) && styles.selectedNumberText,
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
                style={[styles.sideButton, { backgroundColor, borderColor: iconColor }]}
                onPress={resetGame}>
                <IconSymbol name="restart.circle" size={28} color={primaryColor} />
              </Pressable>
              <ThemedView style={styles.operationGrid}>
                <ThemedView style={styles.gridRow}>
                  <Pressable
                    style={[
                      styles.operationButton,
                      { backgroundColor: operationButtonBg },
                      (!singleNumberSelected || selectedNum <= 2 || selectedNum % 2 !== 0 || currentNumbers.length >= maxNumbers) && styles.buttonDisabled
                    ]}
                    onPress={handleSplit}
                    disabled={!singleNumberSelected || selectedNum <= 2 || selectedNum % 2 !== 0 || currentNumbers.length >= maxNumbers}>
                    <IconSymbol name="rectangle.fill.on.rectangle.fill" size={32} color="#fff" />
                  </Pressable>
                  <Pressable
                    style={[styles.operationButton, { backgroundColor: operationButtonBg }, !twoNumbersSelected && styles.buttonDisabled]}
                    onPress={handleAdd} disabled={!twoNumbersSelected}>
                    <ThemedText style={styles.buttonText}>+</ThemedText>
                  </Pressable>
                </ThemedView>
                <ThemedView style={styles.gridRow}>
                  <Pressable
                    style={[styles.operationButton, { backgroundColor: operationButtonBg }, !twoNumbersSelected && styles.buttonDisabled]}
                    onPress={handleSubtract} disabled={!twoNumbersSelected}>
                    <ThemedText style={styles.buttonText}>−</ThemedText>
                  </Pressable>
                  <Pressable
                    style={[styles.operationButton, { backgroundColor: operationButtonBg }, !twoNumbersSelected && styles.buttonDisabled]}
                    onPress={handleMultiply} disabled={!twoNumbersSelected}>
                    <ThemedText style={styles.buttonText}>×</ThemedText>
                  </Pressable>
                </ThemedView>
              </ThemedView>
              <Pressable
                style={[styles.sideButton, { backgroundColor, borderColor: iconColor }, history.length === 0 && styles.disabledButton]}
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
  container: { flex: 1, padding: 20 },
  winContainerPadding: { padding: 0 },
  centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 20 },
  title: { textAlign: 'center', marginBottom: 10 },
  instructions: { textAlign: 'center', paddingHorizontal: 20, marginBottom: 20, fontSize: 16, lineHeight: 24 },
  header: { marginBottom: 20, flexDirection: 'row', alignItems: 'center', gap: 15, justifyContent: 'space-between', paddingHorizontal: 20 },
  resetIconButton: { padding: 8 },
  undoText: { fontSize: 24, fontWeight: 'bold' },
  disabledButton: { opacity: 0.3 },
  disabledText: { opacity: 0.3 },
  gameInfo: { flex: 1, flexDirection: 'row', justifyContent: 'space-around', gap: 10 },
  infoBox: { flex: 1, alignItems: 'center', padding: 12, borderRadius: 8, backgroundColor: 'rgba(128, 128, 128, 0.1)', overflow: 'hidden' },
  label: { fontSize: 12, opacity: 0.7, marginBottom: 4 },
  infoNumber: {
    fontSize: 20,
    width: '100%',
    textAlign: 'center',
    ...Platform.select({
      web: { whiteSpace: 'nowrap' as const },
      default: {},
    }),
  },
  numbersContainer: { marginBottom: 20, minHeight: 240, justifyContent: 'center' },
  numbersGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'center', alignItems: 'center', maxWidth: 250, alignSelf: 'center' },
  numbersGrid3x3: { maxWidth: 320, gap: 6 },
  numbersGrid4x4: { maxWidth: 340, gap: 4 },
  numberBox: {
    borderWidth: 3,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 15,
    width: '45%',
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  numberBox3x3: { width: '30%', minHeight: 70, paddingHorizontal: 4, paddingVertical: 8, borderWidth: 2, borderRadius: 10 },
  numberBox4x4: { width: '22%', minHeight: 55, paddingHorizontal: 2, paddingVertical: 4, borderWidth: 2, borderRadius: 8 },
  numberText: {
    fontWeight: 'bold',
    width: '100%',
    textAlign: 'center',
    // Keep digits on a single line on every platform/screen size.
    ...Platform.select({
      web: { whiteSpace: 'nowrap' as const },
      default: {},
    }),
  },
  selectedNumberText: { color: '#fff' },
  operationsContainer: { marginBottom: 20 },
  operationGrid: { flexDirection: 'column', gap: 12, justifyContent: 'center', alignItems: 'center' },
  gridRow: { flexDirection: 'row', gap: 12, justifyContent: 'center', alignItems: 'center' },
  operationButton: { padding: 20, borderRadius: 12, alignItems: 'center', minWidth: 80, minHeight: 80, justifyContent: 'center' },
  button: { padding: 15, borderRadius: 8, alignItems: 'center', minWidth: 200 },
  secondaryButton: { backgroundColor: 'transparent', borderWidth: 2 },
  buttonText: { color: '#fff', fontSize: 32, fontWeight: '600' },
  winButtonText: { color: '#fff', fontSize: 24, fontWeight: '600' },
  buttonSubtext: { color: '#fff', fontSize: 12, marginTop: 4, opacity: 0.9 },
  buttonDisabled: { opacity: 0.3 },
  winContainer: { alignItems: 'center', justifyContent: 'center', gap: 20, flex: 1 },
  winText: { fontSize: 48, textAlign: 'center', maxWidth: '100%' },
  winSubtext: { fontSize: 18, textAlign: 'center', marginBottom: 20 },
  operationRowWithSides: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 18, marginBottom: 20 },
  sideButton: { padding: 8, alignItems: 'center', justifyContent: 'center', borderRadius: 999, borderWidth: 2, width: 48, height: 48, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  menuButton: { padding: 8, marginLeft: 8 },
  menuOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'flex-start', alignItems: 'flex-start' },
  menuDropdown: { borderRadius: 8, marginTop: 60, marginLeft: 16, paddingVertical: 8, minWidth: 120, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 4 },
  menuItem: { paddingVertical: 12, paddingHorizontal: 20 },
  menuItemSelected: { fontWeight: 'bold', color: '#007AFF' },
  // Tooltip styles
  tooltipOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 30 },
  tooltipCard: { borderRadius: 16, padding: 24, width: '100%', maxWidth: 340, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8, alignItems: 'center', gap: 12 },
  tooltipTitle: { textAlign: 'center', marginBottom: 4 },
  tooltipMessage: { textAlign: 'center', fontSize: 16, lineHeight: 24, opacity: 0.85 },
  tooltipFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginTop: 8 },
  tooltipProgress: { fontSize: 14, opacity: 0.5 },
  tooltipButton: { paddingVertical: 10, paddingHorizontal: 24, borderRadius: 8 },
  tooltipButtonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  tooltipSkip: { fontSize: 14, opacity: 0.5, marginTop: 4 },
});
