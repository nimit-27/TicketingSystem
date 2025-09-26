import React, { createContext, useState, useEffect } from 'react';
import { isJwtBypassEnabled, setJwtBypassEnabled } from '../utils/authToken';

interface DevModeContextProps {
  devMode: boolean;
  toggleDevMode: () => void;
  jwtBypass: boolean;
  toggleJwtBypass: () => void;
  setJwtBypass: (value: boolean) => void;
}

export const DevModeContext = createContext<DevModeContextProps>({
  devMode: false,
  toggleDevMode: () => {},
  jwtBypass: false,
  toggleJwtBypass: () => {},
  setJwtBypass: () => {},
});

const DevModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [devMode, setDevMode] = useState<boolean>(() => {
    const stored = sessionStorage.getItem('dev');
    return stored === 'true';
  });
  const [jwtBypass, setJwtBypassState] = useState<boolean>(() => isJwtBypassEnabled());

  useEffect(() => {
    sessionStorage.setItem('dev', devMode ? 'true' : 'false');
  }, [devMode]);

  useEffect(() => {
    setJwtBypassEnabled(jwtBypass);
  }, [jwtBypass]);

  const toggleDevMode = () => setDevMode((prev) => !prev);
  const toggleJwtBypass = () => setJwtBypassState((prev) => !prev);
  const setJwtBypass = (value: boolean) => setJwtBypassState(value);

  return (
    <DevModeContext.Provider value={{ devMode, toggleDevMode, jwtBypass, toggleJwtBypass, setJwtBypass }}>
      {children}
    </DevModeContext.Provider>
  );
};

export default DevModeProvider;
