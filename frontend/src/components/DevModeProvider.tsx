import { useEffect, useMemo, useState, type ReactNode } from "react";
import { DevModeContext, STORAGE_KEY, type DevModeValue } from "@/hooks/useDevMode";

export function DevModeProvider({ children }: { children: ReactNode }) {
  const [devMode, setDevModeState] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    try {
      return localStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, devMode ? "1" : "0");
    } catch {
      // ignore storage failures (private mode, quota, etc.)
    }
  }, [devMode]);

  const value = useMemo<DevModeValue>(
    () => ({
      devMode,
      toggle: () => setDevModeState((v) => !v),
      setDevMode: setDevModeState,
    }),
    [devMode],
  );

  return <DevModeContext.Provider value={value}>{children}</DevModeContext.Provider>;
}
