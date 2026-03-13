/**
 * Test Utilities for React 19 Compatibility
 *
 * React 19 has stricter act() requirements for async state updates.
 * These utilities ensure all async operations are properly wrapped.
 */

import { act, render, RenderOptions } from '@testing-library/react-native';
import React, { ReactElement } from 'react';

/**
 * Custom render that properly handles async state updates in React 19
 *
 * Usage:
 * ```typescript
 * await renderAsync(<Component />);
 * await waitFor(() => expect(screen.getByText('...')).toBeTruthy());
 * ```
 */
export async function renderAsync(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  let result: ReturnType<typeof render>;

  await act(async () => {
    result = render(ui, options);
    // Allow microtasks and timers to flush
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  return result!;
}

/**
 * Wrapper for async operations that trigger state updates
 *
 * Usage:
 * ```typescript
 * await actAsync(async () => {
 *   fireEvent.press(button);
 * });
 * ```
 */
export async function actAsync(callback: () => Promise<void> | void) {
  await act(async () => {
    await callback();
    // Allow microtasks to flush
    await new Promise(resolve => setTimeout(resolve, 0));
  });
}

/**
 * Flushes all pending promises and timers
 * Use after triggering async operations to ensure state updates complete
 */
export async function flushPromises() {
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
}
