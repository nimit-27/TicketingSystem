import { Table, TableProps } from 'antd';
import { useTheme } from '@mui/material';
import { CSSProperties } from 'react';

const GenericTable = <T extends object = any>({ className, style, ...props }: TableProps<T>) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const classes = `${isDark ? 'table-dark-theme' : ''} ${className ?? ''}`.trim();
    const headerBackground = theme.palette.global.table.headerBackground;
    const headerTextColor = theme.palette.global.table.headerText;
    const tableBorderColor = theme.palette.global.table.border;
    const headerBorderColor = theme.palette.success?.dark ?? headerBackground;
    const inlineStyle = {
        ...style,
    } as (CSSProperties & Record<string, string | number>);
    inlineStyle['--table-header-bg'] = headerBackground;
    inlineStyle['--table-header-color'] = headerTextColor;
    inlineStyle['--table-border-color'] = tableBorderColor;
    // inlineStyle['--table-header-border-color'] = headerBorderColor;
    return <Table className={classes} style={inlineStyle} {...props} />;
};

export default GenericTable;
