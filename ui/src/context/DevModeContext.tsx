import React, { createContext, useState, useEffect } from 'react';

interface DevModeContextProps {
  devMode: boolean;
  toggleDevMode: () => void;
}

export const DevModeContext = createContext<DevModeContextProps>({
  devMode: false,
  toggleDevMode: () => {},
});

const DevModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [devMode, setDevMode] = useState<boolean>(() => {
    const stored = sessionStorage.getItem('dev');
    return stored === 'true';
  });

  useEffect(() => {
    sessionStorage.setItem('dev', devMode ? 'true' : 'false');
  }, [devMode]);

  const toggleDevMode = () => setDevMode((prev) => !prev);

  return (
    <DevModeContext.Provider value={{ devMode, toggleDevMode }}>
      {children}
    </DevModeContext.Provider>
  );
};

export default DevModeProvider;
