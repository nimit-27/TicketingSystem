import { Table, TableProps } from 'antd';
import { useTheme } from '@mui/material';
import { CSSProperties } from 'react';

const GenericTable = <T extends object = any>({ className, style, ...props }: TableProps<T>) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const classes = `${isDark ? 'table-dark-theme' : ''} ${className ?? ''}`.trim();
    const headerBackground = theme.palette.success?.main ?? theme.palette.primary.main;
    const headerBorderColor = theme.palette.success?.dark ?? headerBackground;
    const inlineStyle = {
        ...style,
    } as (CSSProperties & Record<string, string | number>);
    inlineStyle['--table-header-bg'] = headerBackground;
    inlineStyle['--table-header-color'] = theme.palette.common.white;
    inlineStyle['--table-header-border-color'] = headerBorderColor;
    return <Table className={classes} style={inlineStyle} {...props} />;
};

export default GenericTable;
