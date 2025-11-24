'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextType {
  hideUI: boolean;
  setHideUI: (hide: boolean) => void;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [hideUI, setHideUI] = useState(false);

  return <UIContext.Provider value={{ hideUI, setHideUI }}>{children}</UIContext.Provider>;
}

export function useUI() {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
}
