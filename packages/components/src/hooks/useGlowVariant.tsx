import React, { createContext, useContext, useState, useEffect } from 'react';
import type { GlowVariant } from '../constants/glowColors';
import { getItem, setItem } from '@yuhuu/storage';

const STORAGE_KEY = 'glow-variant';

type GlowVariantContextType = {
  glowVariant: GlowVariant;
  setGlowVariant: (variant: GlowVariant) => void;
};

const defaultContext: GlowVariantContextType = {
  glowVariant: 'cool',
  setGlowVariant: () => {},
};

const GlowVariantContext = createContext<GlowVariantContextType>(defaultContext);

type GlowVariantProviderProps = {
  children: React.ReactNode;
  initialVariant?: GlowVariant;
};

export function GlowVariantProvider({
  children,
  initialVariant = 'cool',
}: GlowVariantProviderProps) {
  const [glowVariant, setGlowVariantState] = useState<GlowVariant>(initialVariant);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted variant on mount
  useEffect(() => {
    getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored && ['subtle', 'vibrant', 'warm', 'cool'].includes(stored)) {
          setGlowVariantState(stored as GlowVariant);
        }
      })
      .finally(() => setIsLoaded(true));
  }, []);

  // Persist variant changes
  const setGlowVariant = (variant: GlowVariant) => {
    setGlowVariantState(variant);
    setItem(STORAGE_KEY, variant);
  };

  // Don't render children until we've loaded the persisted value
  if (!isLoaded) {
    return null;
  }

  return (
    <GlowVariantContext.Provider value={{ glowVariant, setGlowVariant }}>
      {children}
    </GlowVariantContext.Provider>
  );
}

export function useGlowVariant(): GlowVariantContextType {
  return useContext(GlowVariantContext);
}
