import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  APP_STORE_URL,
  buildAppDeepLink,
  buildShareMessage,
  buildShareUrl,
  parseSharedPuzzleFromParams,
  toEmojiNumber,
  type SharedPuzzle,
} from '../constants/share.ts';
import {
  consumePendingSharedPuzzle,
  setPendingSharedPuzzle,
  subscribeSharedPuzzle,
} from '../constants/shared-puzzle-store.ts';

describe('toEmojiNumber', () => {
  it('converts multi-digit values to emoji digits', () => {
    assert.equal(toEmojiNumber(58), '5️⃣8️⃣');
    assert.equal(toEmojiNumber(9), '9️⃣');
    assert.equal(toEmojiNumber(10), '1️⃣0️⃣');
    assert.equal(toEmojiNumber(0), '0️⃣');
    assert.equal(toEmojiNumber(123), '1️⃣2️⃣3️⃣');
  });
});

describe('buildShareMessage', () => {
  it('formats the challenge text with emoji numbers and a link', () => {
    assert.equal(
      buildShareMessage(58, 9, 'https://example.com/share'),
      'I solved 5️⃣8️⃣ in 9️⃣ moves! Can you beat me?\nhttps://example.com/share'
    );
  });
});

describe('share and deep links', () => {
  const puzzle = {
    numbers: [4, 7, 2],
    target: 58,
    difficulty: 'easy' as const,
  };

  it('builds a GitHub Pages share URL with puzzle params', () => {
    assert.equal(
      buildShareUrl(puzzle),
      'https://ethanco81.github.io/reduxion/share.html?numbers=4%2C7%2C2&target=58&difficulty=easy'
    );
  });

  it('builds an app deep link for the same puzzle', () => {
    assert.equal(
      buildAppDeepLink(puzzle),
      'reduxion://puzzle?numbers=4%2C7%2C2&target=58&difficulty=easy'
    );
  });

  it('points App Store fallback at the Reduxion app id', () => {
    assert.equal(APP_STORE_URL, 'https://apps.apple.com/app/id6759681524');
  });
});

describe('parseSharedPuzzleFromParams', () => {
  it('parses object and URLSearchParams puzzle payloads', () => {
    assert.deepEqual(
      parseSharedPuzzleFromParams({
        numbers: '4,7,2',
        target: '58',
        difficulty: 'easy',
      }),
      { numbers: [4, 7, 2], target: 58, difficulty: 'easy' }
    );

    assert.deepEqual(
      parseSharedPuzzleFromParams(
        new URLSearchParams('numbers=10,20,30&target=201&difficulty=medium')
      ),
      { numbers: [10, 20, 30], target: 201, difficulty: 'medium' }
    );
  });

  it('rejects incomplete or invalid puzzle params', () => {
    assert.equal(parseSharedPuzzleFromParams({ numbers: '4,7,2', target: '58' }), null);
    assert.equal(
      parseSharedPuzzleFromParams({ numbers: 'a,b', target: '58', difficulty: 'easy' }),
      null
    );
    assert.equal(
      parseSharedPuzzleFromParams({ numbers: '4,7,2', target: '58', difficulty: 'insane' }),
      null
    );
    assert.equal(
      parseSharedPuzzleFromParams({ numbers: '', target: '58', difficulty: 'easy' }),
      null
    );
    assert.equal(
      parseSharedPuzzleFromParams({ numbers: '4,-1,2', target: '58', difficulty: 'easy' }),
      null
    );
  });
});

describe('shared puzzle store', () => {
  it('notifies subscribers and consumes pending puzzles once', () => {
    consumePendingSharedPuzzle();

    const puzzle = {
      numbers: [8, 3, 5],
      target: 40,
      difficulty: 'hard' as const,
    };

    let notified: SharedPuzzle | null = null;
    const unsubscribe = subscribeSharedPuzzle((next) => {
      notified = next;
    });

    setPendingSharedPuzzle(puzzle);
    assert.deepEqual(notified, puzzle);
    assert.deepEqual(consumePendingSharedPuzzle(), puzzle);
    assert.equal(consumePendingSharedPuzzle(), null);

    unsubscribe();
    setPendingSharedPuzzle({
      numbers: [1, 2, 3],
      target: 6,
      difficulty: 'easy',
    });
    assert.deepEqual(notified, puzzle);
    assert.equal(consumePendingSharedPuzzle()?.target, 6);
  });
});
