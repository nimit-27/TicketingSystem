import React, { createContext, useMemo, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { allThemes, ThemeName } from "../themes";

export const ThemeModeContext = createContext<{
  mode: ThemeName;
  toggle: () => void;
}>({ mode: "light", toggle: () => {} });

const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<ThemeName>("light");
  const toggle = () => setMode((prev) => (prev === "light" ? "dark" : "light"));
  const theme = useMemo(() => allThemes[mode], [mode]);
  return (
    <ThemeModeContext.Provider value={{ mode, toggle }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export default CustomThemeProvider;
