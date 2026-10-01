const DIGIT_EMOJIS = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'];

function toEmojiNumber(value) {
  return String(value)
    .split('')
    .map((digit) => DIGIT_EMOJIS[Number(digit)] ?? digit)
    .join('');
}

function buildShareMessage(target, moves, shareUrl) {
  return `I solved ${toEmojiNumber(target)} in ${toEmojiNumber(moves)} moves! Can you beat me?\n${shareUrl}`;
}

function parseSharedPuzzleFromParams(params) {
  const numbers = String(params.numbers || '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map(Number);
  const target = Number(params.target);
  const difficulty = params.difficulty;
  if (
    numbers.length === 0 ||
    numbers.some((n) => !Number.isFinite(n) || n <= 0 || !Number.isInteger(n)) ||
    !['easy', 'medium', 'hard'].includes(difficulty) ||
    !Number.isFinite(target) ||
    !Number.isInteger(target) ||
    target <= 0
  ) {
    return null;
  }
  return { numbers, target, difficulty };
}

function assertEqual(actual, expected) {
  if (actual !== expected) {
    throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
  }
}

function assertDeepEqual(actual, expected) {
  assertEqual(JSON.stringify(actual), JSON.stringify(expected));
}

assertEqual(toEmojiNumber(58), '5️⃣8️⃣');
assertEqual(toEmojiNumber(9), '9️⃣');
assertEqual(toEmojiNumber(10), '1️⃣0️⃣');
assertEqual(
  buildShareMessage(58, 9, 'https://example.com/share'),
  'I solved 5️⃣8️⃣ in 9️⃣ moves! Can you beat me?\nhttps://example.com/share'
);
assertDeepEqual(
  parseSharedPuzzleFromParams({ numbers: '4,7,2', target: '58', difficulty: 'easy' }),
  { numbers: [4, 7, 2], target: 58, difficulty: 'easy' }
);
assertEqual(parseSharedPuzzleFromParams({ numbers: '4,7,2', target: '58' }), null);

console.log('share helpers ok');
