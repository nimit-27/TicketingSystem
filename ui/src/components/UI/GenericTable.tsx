import React from 'react';
import { Table, TableProps } from 'antd';
import { useTheme } from '@mui/material';

const GenericTable = <T extends object = any>({ className, ...props }: TableProps<T>) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const classes = `${isDark ? 'table-dark-theme' : ''} ${className ?? ''}`.trim();
    return <Table className={classes} {...props} />;
};

export default GenericTable;
