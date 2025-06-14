import React, { createContext, useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';

export const ThemeModeContext = createContext<{ mode: 'light' | 'dark'; toggle: () => void }>({ mode: 'light', toggle: () => {} });

const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<'light' | 'dark'>('light');
    const toggle = () => setMode(prev => (prev === 'light' ? 'dark' : 'light'));
    const theme = useMemo(() => createTheme({ palette: { mode } }), [mode]);
    return (
        <ThemeModeContext.Provider value={{ mode, toggle }}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </ThemeModeContext.Provider>
    );
};

export default CustomThemeProvider;
