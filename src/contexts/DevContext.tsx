import { createContext, useContext, useState, ReactNode } from "react";

type ViewMode = "internal" | "client";

interface DevContextType {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
}

const DevContext = createContext<DevContextType | undefined>(undefined);

export function DevProvider({ children }: { children: ReactNode }) {
  const [viewMode, setViewMode] = useState<ViewMode>(
    () => (localStorage.getItem("dev_view_mode") as ViewMode) || "internal"
  );

  const handleSet = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("dev_view_mode", mode);
  };

  return (
    <DevContext.Provider value={{ viewMode, setViewMode: handleSet }}>
      {children}
    </DevContext.Provider>
  );
}

export function useDevMode() {
  const ctx = useContext(DevContext);
  if (!ctx) throw new Error("useDevMode must be used within DevProvider");
  return ctx;
}
