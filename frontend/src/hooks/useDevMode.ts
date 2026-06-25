import { createContext, useContext } from "react";

export interface DevModeValue {
  devMode: boolean;
  toggle: () => void;
  setDevMode: (v: boolean) => void;
}

export const STORAGE_KEY = "airspace-pulse:dev-mode";

export const DevModeContext = createContext<DevModeValue>({
  devMode: false,
  toggle: () => {},
  setDevMode: () => {},
});

export function useDevMode(): DevModeValue {
  return useContext(DevModeContext);
}
