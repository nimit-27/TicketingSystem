import React, { createContext, useMemo, useState } from "react";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { allThemes, ThemeName } from "../themes/themes";

export const ThemeModeContext = createContext<{
  mode: ThemeName;
  toggle: () => void;
  layout: number;
  toggleLayout: () => void;
}>({ mode: "light", toggle: () => {}, layout: 1, toggleLayout: () => {} });

const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [mode, setMode] = useState<ThemeName>("light");
  const toggle = () => setMode((prev) => (prev === "light" ? "dark" : "light"));
  const theme = useMemo(() => allThemes[mode], [mode]);

  const [layout, setLayout] = useState<number>(1);
  const toggleLayout = () => {
    setLayout(layout === 3 ? 1 : layout + 1);
  }

  return (
    <ThemeModeContext.Provider value={{ mode, toggle, layout, toggleLayout }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export default CustomThemeProvider;
