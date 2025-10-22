import '@mui/material/styles';

declare module '@mui/material/styles' {
  interface SidebarPalette {
    background: string;
    border: string;
    text: string;
    accent?: string;
  }

  interface HeaderPalette {
    background: string;
    border: string;
    text: string;
    accent?: string;
  }

  interface TablePalette {
    border: string;
    headerBackground: string;
    headerText: string;
    rowHover: string;
    rowSelected: string;
    rowDivider: string;
    defaultTextColor: string;
  }

  interface ButtonVariantPalette {
    background: string;
    color: string;
    border: string;
    hoverBackground: string;
    hoverColor: string;
    hoverBorder: string;
  }

  interface ButtonsPalette {
    save: ButtonVariantPalette;
    cancel: ButtonVariantPalette;
    update: ButtonVariantPalette;
    solidGreen: ButtonVariantPalette;
    solidOrange: ButtonVariantPalette;
    greenOutlined: ButtonVariantPalette;
    orangeOutlined: ButtonVariantPalette;
    neutral: ButtonVariantPalette;
    [key: string]: ButtonVariantPalette;
  }

  interface FieldPalette {
    background: string;
    border: string;
    text: string;
    placeholder: string;
    focus: string;
    disabledBackground: string;
  }

  interface GlobalComponentsPalette {
    pageTitle: {
      text: string;
    }
    table: TablePalette;
    buttons: ButtonsPalette;
    input: FieldPalette;
    dropdown: FieldPalette;
  }

  interface ButtonsPaletteOptions {
    save?: Partial<ButtonVariantPalette>;
    cancel?: Partial<ButtonVariantPalette>;
    update?: Partial<ButtonVariantPalette>;
    solidGreen?: Partial<ButtonVariantPalette>;
    solidOrange?: Partial<ButtonVariantPalette>;
    greenOutlined?: Partial<ButtonVariantPalette>;
    orangeOutlined?: Partial<ButtonVariantPalette>;
    neutral?: Partial<ButtonVariantPalette>;
    [key: string]: Partial<ButtonVariantPalette> | undefined;
  }

  interface GlobalComponentsPaletteOptions {
    table?: Partial<TablePalette>;
    buttons?: ButtonsPaletteOptions;
    input?: Partial<FieldPalette>;
    dropdown?: Partial<FieldPalette>;
  }

  interface Palette {
    sidebar: SidebarPalette;
    header: HeaderPalette;
    global: GlobalComponentsPalette;
  }

  interface PaletteOptions {
    sidebar?: Partial<SidebarPalette>;
    header?: Partial<HeaderPalette>;
    global?: GlobalComponentsPaletteOptions;
  }
}
