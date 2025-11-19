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
    };

    const inlineStyle = {
        ...style,
        ['--table-header-bg' as string]: theme.palette.global.table.headerBackground,
        ['--table-header-color' as string]: theme.palette.global.table.headerText,
        ['--table-border-color' as string]: theme.palette.global.table.border,
    } as CSSProperties & Record<string, string | number>;
    return <ConfigProvider theme={tableTheme}>
        <Table className={classes} style={inlineStyle} {...props} size='small' bordered />
    </ConfigProvider>
};

export default GenericTable;
