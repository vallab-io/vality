"use client";

import { createContext, useContext, useState, ReactNode } from "react";

interface TopbarActionContextType {
  action: ReactNode | null;
  setAction: (action: ReactNode | null) => void;
}

const TopbarActionContext = createContext<TopbarActionContextType | undefined>(undefined);

export function TopbarActionProvider({ children }: { children: ReactNode }) {
  const [action, setAction] = useState<ReactNode | null>(null);

  return (
    <TopbarActionContext.Provider value={{ action, setAction }}>
      {children}
    </TopbarActionContext.Provider>
  );
}

export function useTopbarAction() {
  const context = useContext(TopbarActionContext);
  if (!context) {
    throw new Error("useTopbarAction must be used within TopbarActionProvider");
  }
  return context;
}

