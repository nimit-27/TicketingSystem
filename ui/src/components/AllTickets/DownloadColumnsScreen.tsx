import React, { useMemo } from 'react';
import {
    Button,
    Checkbox,
    FormControlLabel,
    Paper,
    Stack,
    Typography,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import GenericTable from '../UI/GenericTable';

interface DownloadReportColumn {
    key: string;
    label: string;
}

interface DownloadColumnsScreenProps {
    columns: DownloadReportColumn[];
    selectedColumnKeys: string[];
    showPreview: boolean;
    onBack: () => void;
    onToggleColumn: (columnKey: string) => void;
    onSelectAll: () => void;
    onPreview: () => void;
}

const DownloadColumnsScreen: React.FC<DownloadColumnsScreenProps> = ({
    columns,
    selectedColumnKeys,
    showPreview,
    onBack,
    onToggleColumn,
    onSelectAll,
    onPreview,
}) => {
    const { t } = useTranslation();

    const previewColumns = useMemo(
        () => columns
            .filter((column) => selectedColumnKeys.includes(column.key))
            .map((column) => ({ title: column.label, dataIndex: column.key, key: column.key })),
        [columns, selectedColumnKeys],
    );

    const previewData = useMemo(() => {
        const row = columns.reduce((acc, column) => {
            if (selectedColumnKeys.includes(column.key)) {
                acc[column.key] = `${column.label} Value`;
            }
            return acc;
        }, {} as Record<string, string>);

        return [{ key: 'preview-row', ...row }];
    }, [columns, selectedColumnKeys]);

    return (
        <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Button variant="outlined" size="small" onClick={onBack}>{t('Back to Filters')}</Button>
                <Button variant="outlined" size="small" onClick={onSelectAll}>{t('Select All')}</Button>
            </Stack>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="stretch">
                <Paper variant="outlined" sx={{ width: { xs: '100%', md: '45%' }, maxHeight: 300, overflowY: 'auto', p: 1 }}>
                    <Stack>
                        {columns.map((column) => (
                            <FormControlLabel
                                key={column.key}
                                control={<Checkbox checked={selectedColumnKeys.includes(column.key)} onChange={() => onToggleColumn(column.key)} />}
                                label={column.label}
                            />
                        ))}
                    </Stack>
                </Paper>

                <Paper variant="outlined" sx={{ width: { xs: '100%', md: '55%' }, p: 1 }}>
                    <Stack spacing={1}>
                        <Typography variant="subtitle2">{t('Preview')}</Typography>
                        <Button variant="contained" size="small" onClick={onPreview} sx={{ width: 'fit-content' }}>{t('Preview')}</Button>
                        {showPreview && (
                            previewColumns.length ? (
                                <GenericTable
                                    columns={previewColumns as any}
                                    dataSource={previewData}
                                    pagination={false}
                                    scroll={{ x: true }}
                                />
                            ) : (
                                <Typography variant="body2">{t('Please select at least one column.')}</Typography>
                            )
                        )}
                    </Stack>
                </Paper>
            </Stack>
        </Stack>
    );
};

export type { DownloadReportColumn };
export default DownloadColumnsScreen;
