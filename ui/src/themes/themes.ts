import { createTheme } from '@mui/material/styles';
import colors from './colors';
import { color } from 'echarts';

type ButtonVariantDefinition = {
  background: string;
  color: string;
  border: string;
  hoverBackground: string;
  hoverColor: string;
  hoverBorder: string;
};

type ButtonsDefinition = {
  save: ButtonVariantDefinition;
  cancel: ButtonVariantDefinition;
  update: ButtonVariantDefinition;
  solidGreen: ButtonVariantDefinition;
  solidOrange: ButtonVariantDefinition;
  greenOutlined: ButtonVariantDefinition;
  orangeOutlined: ButtonVariantDefinition;
  neutral: ButtonVariantDefinition;
};

type FieldDefinition = {
  background: string;
  border: string;
  text: string;
  placeholder: string;
  focus: string;
  disabledBackground: string;
};

type TableDefinition = {
  border: string;
  headerBackground: string;
  headerText: string;
  rowHover: string;
  rowSelected: string;
  rowDivider: string;
  defaultTextColor: string;
};

type FieldsetDefinition = {
  header: {
    text: string;
  }
}

type GlobalComponentsDefinition = {
  pageTitle: {
    text: string;
  };
  icon: {
    color: string;
  };
  table: TableDefinition;
  buttons: ButtonsDefinition;
  input: FieldDefinition;
  dropdown: FieldDefinition;
  fieldset: FieldsetDefinition;
};

type LayoutDefinition = {
  sidebar: {
    background: string;
    border: string;
    text: string;
    accent?: string;
  };
  header: {
    background: string;
    border: string;
    text: string;
    accent?: string;
    icon: {
      color: string;
    }
  };
  global: GlobalComponentsDefinition;
};

const lightLayout: LayoutDefinition = {
  sidebar: {
    background: colors.green.default,
    border: 'none',
    text: '#ffffff',
    accent: '#99d5ae',
  },
  header: {
    background: '#00522B',
    border: 'none',
    text: colors.green.default,
    accent: '#73b579',
    icon: {
      color: '#ffffff',
    }
  },
  global: {
    pageTitle: {
      text: colors.green.default,
    },
    icon: {
      color: colors.green.default,
    },
    table: {
      border: '#ABD4C1',
      headerBackground: '#CAE9DC',
      headerText: colors.green.default,
      rowHover: '#f0f7f4',
      rowSelected: '#e0f2f1',
      rowDivider: '#d9e4dd',
      defaultTextColor: colors.green.default,
    },
    buttons: {
      save: {
        background: colors.green.default,
        color: '#ffffff',
        border: colors.green.default,
        hoverBackground: '#004d29',
        hoverColor: '#ffffff',
        hoverBorder: '#004d29',
      },
      cancel: {
        background: colors.orange.default,
        color: "#ffffff",
        border: colors.orange.default,
        hoverBackground: '#f5f5f5',
        hoverColor: '#004d29',
        hoverBorder: '#9e9e9e',
      },
      update: {
        background: '#ff9800',
        color: '#ffffff',
        border: '#ff9800',
        hoverBackground: '#e68600',
        hoverColor: '#ffffff',
        hoverBorder: '#e68600',
      },
      solidGreen: {
        background: colors.green.default,
        color: '#ffffff',
        border: colors.green.default,
        hoverBackground: '#144619',
        hoverColor: '#ffffff',
        hoverBorder: '#144619',
      },
      solidOrange: {
        background: '#ff671f',
        color: '#ffffff',
        border: '#ff671f',
        hoverBackground: '#e65c1c',
        hoverColor: '#ffffff',
        hoverBorder: '#e65c1c',
      },
      greenOutlined: {
        background: '#ffffff',
        color: colors.green.default,
        border: colors.green.default,
        hoverBackground: '#e0f2f1',
        hoverColor: '#004d29',
        hoverBorder: '#004d29',
      },
      orangeOutlined: {
        background: '#ffffff',
        color: '#ff671f',
        border: '#ff671f',
        hoverBackground: '#fff3e8',
        hoverColor: '#e65c1c',
        hoverBorder: '#e65c1c',
      },
      neutral: {
        background: '#f5f5f5',
        color: '#424242',
        border: '#e0e0e0',
        hoverBackground: '#e0e0e0',
        hoverColor: '#212121',
        hoverBorder: '#bdbdbd',
      },
    },
    input: {
      background: '#ffffff',
      border: '#c2c2c2',
      text: colors.green.default,
      placeholder: '#6f6f6f',
      focus: colors.green.default,
      disabledBackground: '#f5f5f5',
    },
    dropdown: {
      background: '#ffffff',
      border: '#c2c2c2',
      text: colors.green.default,
      placeholder: '#6f6f6f',
      focus: colors.green.default,
      disabledBackground: '#f5f5f5',
    },
    fieldset: {
      header: {
        text: colors.gray.dark,
      }
    },
  },
};

const darkLayout: LayoutDefinition = {
  sidebar: {
    background: '#262626ff',
    border: '1px solid #00cd6dff',
    text: '#f5f5f5',
    accent: '#7ccca1',
  },
  header: {
    background: '#232222',
    border: '1px solid #73b579',
    text: '#ffffff',
    accent: '#73b579',
    icon: {
      color: '#73b579',
    }
  },
  global: {
    pageTitle: {
      text: '#73b579',
    },
    icon: {
      color: '#73b579',
    },
    table: {
      border: '#3c3c3c',
      headerBackground: '#2f3a36',
      headerText: '#e0f2f1',
      rowHover: '#2a332f',
      rowSelected: '#224c3c',
      rowDivider: '#365148',
      defaultTextColor: '#e0f2f1',
    },
    buttons: {
      save: {
        background: '#73b579',
        color: '#1b2a24',
        border: '#73b579',
        hoverBackground: '#5ca165',
        hoverColor: '#101a16',
        hoverBorder: '#5ca165',
      },
      cancel: {
        background: '#303030',
        color: '#e0e0e0',
        border: '#555555',
        hoverBackground: '#3c3c3c',
        hoverColor: '#ffffff',
        hoverBorder: '#6d6d6d',
      },
      update: {
        background: '#ff9800',
        color: '#1b1b1b',
        border: '#ff9800',
        hoverBackground: '#e68600',
        hoverColor: '#000000',
        hoverBorder: '#e68600',
      },
      solidGreen: {
        background: colors.green.default,
        color: '#ffffff',
        border: colors.green.default,
        hoverBackground: '#144619',
        hoverColor: '#ffffff',
        hoverBorder: '#144619',
      },
      solidOrange: {
        background: '#ff671f',
        color: '#1b1b1b',
        border: '#ff671f',
        hoverBackground: '#e65c1c',
        hoverColor: '#000000',
        hoverBorder: '#e65c1c',
      },
      greenOutlined: {
        background: '#232222',
        color: '#73b579',
        border: '#73b579',
        hoverBackground: '#2a332f',
        hoverColor: '#a4d8b1',
        hoverBorder: '#a4d8b1',
      },
      orangeOutlined: {
        background: '#232222',
        color: '#ffb74d',
        border: '#ff9800',
        hoverBackground: '#2f3a36',
        hoverColor: '#ffd180',
        hoverBorder: '#ffd180',
      },
      neutral: {
        background: '#424242',
        color: '#f5f5f5',
        border: '#616161',
        hoverBackground: '#4f4f4f',
        hoverColor: '#ffffff',
        hoverBorder: '#757575',
      },
    },
    input: {
      background: '#2c2c2c',
      border: '#555555',
      text: '#f5f5f5',
      placeholder: '#b0b0b0',
      focus: '#73b579',
      disabledBackground: '#1f1f1f',
    },
    dropdown: {
      background: '#2c2c2c',
      border: '#555555',
      text: '#f5f5f5',
      placeholder: '#b0b0b0',
      focus: '#73b579',
      disabledBackground: '#1f1f1f',
    },
    fieldset: {
      header: {
        text: colors.gray.light,
      }
    },
  },
};

const fciLayout: LayoutDefinition = {
  sidebar: {
    background: colors.green.default,
    border: '#004d29',
    text: '#ffffff',
    accent: '#8fd2a8',
  },
  header: {
    background: '#fafafa',
    border: '#dddddd',
    text: '#2e7d32',
    accent: '#ffb74d',
    icon: {
      color: colors.green.default,
    }
  },
  global: {
    pageTitle: {
      text: colors.green.default,
    },
    icon: {
      color: colors.green.default,
    },
    table: {
      border: '#e5e5e5',
      headerBackground: '#fff3e8',
      headerText: '#ff9800',
      rowHover: '#fff8ef',
      rowSelected: '#fdeacc',
      rowDivider: '#f0dfc5',
      defaultTextColor: '#2e7d32',
    },
    buttons: {
      save: {
        background: '#2e7d32',
        color: '#ffffff',
        border: '#2e7d32',
        hoverBackground: '#256528',
        hoverColor: '#ffffff',
        hoverBorder: '#256528',
      },
      cancel: {
        background: '#ffffff',
        color: '#2e7d32',
        border: '#c2c2c2',
        hoverBackground: '#f5f5f5',
        hoverColor: '#1b5e20',
        hoverBorder: '#9e9e9e',
      },
      update: {
        background: '#ff9800',
        color: '#ffffff',
        border: '#ff9800',
        hoverBackground: '#e68600',
        hoverColor: '#ffffff',
        hoverBorder: '#e68600',
      },
      solidGreen: {
        background: '#1b5e20',
        color: '#ffffff',
        border: '#1b5e20',
        hoverBackground: '#144619',
        hoverColor: '#ffffff',
        hoverBorder: '#144619',
      },
      solidOrange: {
        background: '#ff671f',
        color: '#ffffff',
        border: '#ff671f',
        hoverBackground: '#e65c1c',
        hoverColor: '#ffffff',
        hoverBorder: '#e65c1c',
      },
      greenOutlined: {
        background: '#ffffff',
        color: '#2e7d32',
        border: '#2e7d32',
        hoverBackground: '#e8f5e9',
        hoverColor: '#1b5e20',
        hoverBorder: '#1b5e20',
      },
      orangeOutlined: {
        background: '#ffffff',
        color: '#ff9800',
        border: '#ff9800',
        hoverBackground: '#fff3e8',
        hoverColor: '#e68600',
        hoverBorder: '#e68600',
      },
      neutral: {
        background: '#f5f5f5',
        color: '#424242',
        border: '#e0e0e0',
        hoverBackground: '#e0e0e0',
        hoverColor: '#212121',
        hoverBorder: '#bdbdbd',
      },
    },
    input: {
      background: '#ffffff',
      border: '#c2c2c2',
      text: '#2e7d32',
      placeholder: '#7a7a7a',
      focus: '#ff9800',
      disabledBackground: '#f5f5f5',
    },
    dropdown: {
      background: '#ffffff',
      border: '#c2c2c2',
      text: '#2e7d32',
      placeholder: '#7a7a7a',
      focus: '#ff9800',
      disabledBackground: '#f5f5f5',
    },
    fieldset: {
      header: {
        text: colors.gray.dark,
      }
    },
  },
};

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: colors.green.default },
    secondary: { main: '#ff671f' },
    success: { main: colors.green.default },
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    sidebar: lightLayout.sidebar,
    header: lightLayout.header,
    global: lightLayout.global,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#73b579' },
    secondary: { main: '#232222' },
    success: { main: '#73b579' },
    background: {
      default: '#303030',
      paper: '#424242',
    },
    action: {
      disabledBackground: '#555555',
    },
    sidebar: darkLayout.sidebar,
    header: darkLayout.header,
    global: darkLayout.global,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

const fciTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#2e7d32' },
    secondary: { main: '#ff9800' },
    success: { main: '#1b5e20' },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    sidebar: fciLayout.sidebar,
    header: fciLayout.header,
    global: fciLayout.global,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});

export const allThemes = {
  light: lightTheme,
  dark: darkTheme,
  fci: fciTheme,
};

export type ThemeName = keyof typeof allThemes;
