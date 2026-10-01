export const SHARE_PAGE_BASE_URL = 'https://ethanco81.github.io/reduxion/share.html';
export const APP_STORE_URL = 'https://apps.apple.com/app/id6759681524';
export const APP_DEEP_LINK_SCHEME = 'reduxion';

const DIGIT_EMOJIS = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣'] as const;

export type Difficulty = 'easy' | 'medium' | 'hard';

export type SharedPuzzle = {
  numbers: number[];
  target: number;
  difficulty: Difficulty;
};

export function toEmojiNumber(value: number): string {
  return String(value)
    .split('')
    .map((digit) => DIGIT_EMOJIS[Number(digit)] ?? digit)
    .join('');
}

export function buildShareMessage(target: number, moves: number, shareUrl: string): string {
  return `I solved ${toEmojiNumber(target)} in ${toEmojiNumber(moves)} moves! Can you beat me?\n${shareUrl}`;
}

export function buildShareUrl(puzzle: SharedPuzzle): string {
  const params = new URLSearchParams({
    numbers: puzzle.numbers.join(','),
    target: String(puzzle.target),
    difficulty: puzzle.difficulty,
  });
  return `${SHARE_PAGE_BASE_URL}?${params.toString()}`;
}

export function buildAppDeepLink(puzzle: SharedPuzzle): string {
  const params = new URLSearchParams({
    numbers: puzzle.numbers.join(','),
    target: String(puzzle.target),
    difficulty: puzzle.difficulty,
  });
  return `${APP_DEEP_LINK_SCHEME}://puzzle?${params.toString()}`;
}

function parseDifficulty(value: string | null | undefined): Difficulty | null {
  if (value === 'easy' || value === 'medium' || value === 'hard') {
    return value;
  }
  return null;
}

function parseNumbers(value: string | null | undefined): number[] | null {
  if (!value) return null;
  const numbers = value
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => Number(part));

  if (numbers.length === 0 || numbers.some((n) => !Number.isFinite(n) || n <= 0 || !Number.isInteger(n))) {
    return null;
  }

  return numbers;
}

export function parseSharedPuzzleFromParams(
  params: Record<string, string | string[] | undefined | null> | URLSearchParams
): SharedPuzzle | null {
  const get = (key: string): string | null => {
    if (params instanceof URLSearchParams) {
      return params.get(key);
    }
    const value = params[key];
    if (Array.isArray(value)) return value[0] ?? null;
    return value ?? null;
  };

  const numbers = parseNumbers(get('numbers'));
  const targetRaw = get('target');
  const target = targetRaw == null ? NaN : Number(targetRaw);
  const difficulty = parseDifficulty(get('difficulty'));

  if (!numbers || !difficulty || !Number.isFinite(target) || !Number.isInteger(target) || target <= 0) {
    return null;
  }

  return { numbers, target, difficulty };
}
