import React, { createContext, useContext, useState } from 'react';
import type { GlowVariant } from '../constants/glowColors';

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
  const [glowVariant, setGlowVariant] = useState<GlowVariant>(initialVariant);

  return (
    <GlowVariantContext.Provider value={{ glowVariant, setGlowVariant }}>
      {children}
    </GlowVariantContext.Provider>
  );
}

export function useGlowVariant(): GlowVariantContextType {
  return useContext(GlowVariantContext);
}
