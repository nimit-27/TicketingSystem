import { ConfigProvider, Table, TableProps, ThemeConfig } from 'antd';
import { useTheme } from '@mui/material';
import { CSSProperties } from 'react';

const GenericTable = <T extends object = any>({ className, style, ...props }: TableProps<T>) => {
    const theme = useTheme();

    const isDark = theme.palette.mode === 'dark';

    const classes = `${isDark ? 'table-dark-theme' : ''} ${className ?? ''}`.trim();

    const tableTheme: ThemeConfig = {
        components: {
            Table: {
                borderColor: theme.palette.global.table.border,
                headerBg: theme.palette.global.table.headerBackground,
                headerColor: theme.palette.global.table.headerText,
            },
        },
        token: {
            colorText: theme.palette.global.table.defaultTextColor,
        },
    }
    const headerTextColor = theme.palette.global.table.headerText;
    const inlineStyle = {
        ...style,
    } as (CSSProperties & Record<string, string | number>);
    // inlineStyle['--table-header-color'] = headerTextColor;
    return <ConfigProvider theme={tableTheme}>
        <Table className={classes} style={inlineStyle} {...props} bordered />
    </ConfigProvider>
};

export default GenericTable;
