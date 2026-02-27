import React from 'react';
import {
    Alert,
    Button,
    Chip,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Stack,
    TextField,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import { DropdownOption } from '../UI/Dropdown/GenericDropdown';
import AssigneeFilterDropdown from './AssigneeFilterDropdown';

interface DownloadFiltersScreenProps {
    year: number | '';
    month: number | '';
    fromDate: string;
    toDate: string;
    category: string;
    subCategory: string;
    zone: string;
    region: string;
    district: string;
    issueType: string;
    assignee: string;
    status: string;
    yearOptions: number[];
    monthOptions: Array<{ value: number; label: string }>;
    categoryOptions: DropdownOption[];
    subCategoryOptions: DropdownOption[];
    zoneOptions: DropdownOption[];
    regionOptions: DropdownOption[];
    districtOptions: DropdownOption[];
    issueTypeOptions: DropdownOption[];
    statusOptions: DropdownOption[];
    generationState: 'idle' | 'generating' | 'error';
    estimateLoading: boolean;
    estimateCountPending: boolean;
    estimatedCount: number | null;
    selectedRangeDays: number | null;
    isRangeInvalid: boolean;
    onCancelExport?: () => void;
    onRetryExport?: () => void;
    onYearChange: (year: number | '') => void;
    onMonthChange: (month: number | '') => void;
    onCategoryChange: (category: string) => void;
    onSubCategoryChange: (subCategory: string) => void;
    onZoneChange: (zone: string) => void;
    onRegionChange: (region: string) => void;
    onDistrictChange: (district: string) => void;
    onIssueTypeChange: (issueType: string) => void;
    onAssigneeChange: (assignee: string) => void;
    onStatusChange: (status: string) => void;
    onFromDateChange: (fromDate: string) => void;
    onToDateChange: (toDate: string) => void;
    onApplyPresetRange: (days: number) => void;
    onOpenColumns: () => void;
}

const DownloadFiltersScreen: React.FC<DownloadFiltersScreenProps> = ({
    year,
    month,
    fromDate,
    toDate,
    category,
    subCategory,
    zone,
    region,
    district,
    issueType,
    assignee,
    status,
    yearOptions,
    monthOptions,
    categoryOptions,
    subCategoryOptions,
    zoneOptions,
    regionOptions,
    districtOptions,
    issueTypeOptions,
    statusOptions,
    generationState,
    estimateLoading,
    estimateCountPending,
    estimatedCount,
    selectedRangeDays,
    isRangeInvalid,
    onCancelExport,
    onRetryExport,
    onYearChange,
    onMonthChange,
    onCategoryChange,
    onSubCategoryChange,
    onZoneChange,
    onRegionChange,
    onDistrictChange,
    onIssueTypeChange,
    onAssigneeChange,
    onStatusChange,
    onFromDateChange,
    onToDateChange,
    onApplyPresetRange,
    onOpenColumns,
}) => {
    const { t } = useTranslation();

    return (
        <Stack spacing={2} sx={{ mt: 1 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth size="small">
                    <InputLabel id="download-year-label">{t('Year')}</InputLabel>
                    <Select
                        labelId="download-year-label"
                        label={t('Year')}
                        value={year}
                        onChange={(event) => onYearChange(event.target.value === '' ? '' : Number(event.target.value))}
                    >
                        {yearOptions.map((optionYear) => (
                            <MenuItem key={optionYear} value={optionYear}>{optionYear}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                    <InputLabel id="download-month-label">{t('Month')}</InputLabel>
                    <Select
                        labelId="download-month-label"
                        label={t('Month')}
                        value={month}
                        onChange={(event) => onMonthChange(event.target.value === '' ? '' : Number(event.target.value))}
                    >
                        <MenuItem value="">{t('All')}</MenuItem>
                        {monthOptions.map((optionMonth) => (
                            <MenuItem key={optionMonth.value} value={optionMonth.value}>{optionMonth.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth size="small">
                    <InputLabel id="download-module-label">{t('Module')}</InputLabel>
                    <Select labelId="download-module-label" label={t('Module')} value={category} onChange={(e) => onCategoryChange(String(e.target.value))}>
                        {categoryOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                    </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                    <InputLabel id="download-sub-module-label">{t('Sub Module')}</InputLabel>
                    <Select labelId="download-sub-module-label" label={t('Sub Module')} value={subCategory} onChange={(e) => onSubCategoryChange(String(e.target.value))}>
                        {subCategoryOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                    </Select>
                </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth size="small">
                    <InputLabel id="download-zone-label">{t('Zone')}</InputLabel>
                    <Select labelId="download-zone-label" label={t('Zone')} value={zone} onChange={(e) => onZoneChange(String(e.target.value))}>
                        {zoneOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                    </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                    <InputLabel id="download-region-label">{t('Region')}</InputLabel>
                    <Select labelId="download-region-label" label={t('Region')} value={region} onChange={(e) => onRegionChange(String(e.target.value))}>
                        {regionOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                    </Select>
                </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <FormControl fullWidth size="small">
                    <InputLabel id="download-district-label">{t('District')}</InputLabel>
                    <Select labelId="download-district-label" label={t('District')} value={district} onChange={(e) => onDistrictChange(String(e.target.value))}>
                        {districtOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                    </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                    <InputLabel id="download-issue-type-label">{t('Issue Type')}</InputLabel>
                    <Select labelId="download-issue-type-label" label={t('Issue Type')} value={issueType} onChange={(e) => onIssueTypeChange(String(e.target.value))}>
                        {issueTypeOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                    </Select>
                </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <AssigneeFilterDropdown value={assignee} onChange={onAssigneeChange} />
                <FormControl fullWidth size="small">
                    <InputLabel id="download-status-label">{t('Status')}</InputLabel>
                    <Select labelId="download-status-label" label={t('Status')} value={status} onChange={(e) => onStatusChange(String(e.target.value))}>
                        {statusOptions.map((option) => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
                    </Select>
                </FormControl>
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField label={t('From Date')} type="date" size="small" fullWidth value={fromDate} InputLabelProps={{ shrink: true }} onChange={(e) => onFromDateChange(e.target.value)} />
                <TextField label={t('To Date')} type="date" size="small" fullWidth value={toDate} InputLabelProps={{ shrink: true }} onChange={(e) => onToDateChange(e.target.value)} />
            </Stack>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <Button variant="outlined" size="small" onClick={() => onApplyPresetRange(7)}>{t('Last 7 days')}</Button>
                <Button variant="outlined" size="small" onClick={() => onApplyPresetRange(30)}>{t('Last 30 days')}</Button>
                <Button variant="outlined" size="small" onClick={onOpenColumns}>{t('Select/Unselect Columns')}</Button>
                <Chip
                    size="small"
                    label={(estimateLoading || estimateCountPending)
                        ? t('Estimating records...')
                        : estimatedCount !== null
                            ? `${t('Estimated records')}: ~${estimatedCount.toLocaleString()}`
                            : t('Estimated records unavailable')}
                />
            </Stack>

            {generationState === 'generating' && (
                <Alert severity="info">
                    {t('Your report is being generated.')}
                    {onCancelExport && <Button size="small" sx={{ ml: 1 }} onClick={onCancelExport}>{t('Cancel export')}</Button>}
                </Alert>
            )}

            {generationState === 'error' && (
                <Alert severity="error">
                    {t('Export failed. Range may be too large; narrow filters or request async report.')}
                    {onRetryExport && <Button size="small" sx={{ ml: 1 }} onClick={onRetryExport}>{t('Retry')}</Button>}
                </Alert>
            )}

            {isRangeInvalid && <Alert severity="warning">{t('Please select a valid date range.')}</Alert>}
            {selectedRangeDays !== null && selectedRangeDays > 31 && (
                <Alert severity="info">{t('Large date range selected. It may take some time to download this data.')}</Alert>
            )}
        </Stack>
    );
};

export default DownloadFiltersScreen;
