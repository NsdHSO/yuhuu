/**
 * Cross-platform storage adapter
 * Uses SecureStore on native (iOS/Android) and localStorage on web
 */

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/**
 * Get item from storage
 * - Native: SecureStore
 * - Web: localStorage
 */
export async function getItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.warn('localStorage.getItem failed:', error);
      return null;
    }
  }

  try {
    return await SecureStore.getItemAsync(key);
  } catch (error) {
    console.warn('SecureStore.getItemAsync failed:', error);
    return null;
  }
}

/**
 * Set item in storage
 * - Native: SecureStore
 * - Web: localStorage
 */
export async function setItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn('localStorage.setItem failed:', error);
    }
    return;
  }

  try {
    await SecureStore.setItemAsync(key, value);
  } catch (error) {
    console.warn('SecureStore.setItemAsync failed:', error);
  }
}

/**
 * Remove item from storage
 * - Native: SecureStore
 * - Web: localStorage
 */
export async function removeItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('localStorage.removeItem failed:', error);
    }
    return;
  }

  try {
    await SecureStore.deleteItemAsync(key);
  } catch (error) {
    console.warn('SecureStore.deleteItemAsync failed:', error);
  }
}
