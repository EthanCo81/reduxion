---
name: unit-test-only
description: Never start or launch the app to test UI changes. Use only unit tests for verification. Apply whenever validating UI, layout, formatting, components, or any visual/behavior change in this repo.
---

# Unit-test-only verification

## When to use

Use this skill whenever you need to verify UI, layout, formatting, styling, components, screens, or user-visible behavior in this repository.

## Hard rules

1. **Do not start the app** to test changes. Never run or rely on:
   - `expo start`, `expo start --web`, `npx expo start`, `npm start`, `npm run web`, `npm run ios`, `npm run android`
   - Metro / Expo Go / browser previews of the running app
   - Emulators, simulators, or device installs for verification
2. **Do not use interactive UI testing tools** for verification:
   - computer-use / browser automation against a running app
   - screen recording or screenshots of a launched app as proof of correctness
3. **Verify only with unit tests** (and related automated tests that do not require launching the app), such as:
   - Jest / Vitest / Expo Jest unit and component tests
   - React Native Testing Library render/assertion tests
   - Pure function / style-helper / logic tests

## Workflow

1. Identify the behavior or formatting rule that must hold (e.g. numbers never wrap inside a tile).
2. Extract or keep the logic under test in a form unit tests can import (helpers, pure functions, style builders, or components).
3. Add or update unit/component tests that assert the required behavior.
4. Run the test suite with the project’s test script (create one if missing). Prefer:
   - `npm test` / `npx jest` / the script defined in `package.json`
5. Treat a green unit-test run as the verification evidence. Do **not** start the app afterward “just to double-check.”

## If no test setup exists

1. Add a minimal unit-test setup appropriate for this Expo/React Native project (e.g. Jest + React Native Testing Library).
2. Add a `test` script to `package.json`.
3. Write focused tests for the change.
4. Run those tests. Still do **not** start the app.

## Conflicts with other guidance

If another skill or instruction asks for walkthrough screenshots, screen recordings, or launching the app to prove UI changes, **this skill wins for this repository**. Report unit-test results instead of app demos.

## What to report

- Which tests were added or updated
- The test command run
- Pass/fail output summary
