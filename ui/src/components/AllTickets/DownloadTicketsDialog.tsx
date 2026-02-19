import React, { useEffect, useMemo, useState } from 'react';
import {
    Alert,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    InputLabel,
    ListItemIcon,
    Menu,
    MenuItem,
    Select,
    Stack,
    TextField,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import GridOnIcon from '@mui/icons-material/GridOn';
import { useTranslation } from 'react-i18next';
import { DropdownOption } from '../UI/Dropdown/GenericDropdown';
import { getDistricts, getRegions } from '../../services/LocationService';
import { useApi } from '../../hooks/useApi';
import { getDropdownOptionsWithExtraOption } from '../../utils/Utils';
import AssigneeFilterDropdown from './AssigneeFilterDropdown';
import { searchTicketsPaginated } from '../../services/TicketService';

interface DownloadFilters {
    fromDate: string;
    toDate: string;
    zoneCode?: string;
    zoneLabel?: string;
    regionCode?: string;
    regionLabel?: string;
    districtCode?: string;
    districtLabel?: string;
    issueTypeId?: string;
    issueTypeLabel?: string;
    assignedTo?: string;
    assignedToLabel?: string;
}

interface DownloadDialogInitialFilters {
    zone: string;
    region: string;
    district: string;
    issueType: string;
    assignee: string;
}

interface DownloadTicketsDialogProps {
    open: boolean;
    loading?: boolean;
    generationState?: 'idle' | 'generating' | 'error';
    zoneOptions: DropdownOption[];
    issueTypeOptions: DropdownOption[];
    initialFilters: DownloadDialogInitialFilters;
    onClose: () => void;
    onGenerate: (format: 'pdf' | 'excel', filters: DownloadFilters) => Promise<void> | void;
    onCancelExport?: () => void;
    onRetryExport?: () => void;
}

const formatInputDate = (value: Date) => {
    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, '0');
    const day = String(value.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getDateRangeForSelection = (year: number, month?: number) => {
    if (month) {
        const from = new Date(year, month - 1, 1);
        const to = new Date(year, month, 0);
        return { from: formatInputDate(from), to: formatInputDate(to) };
    }

    const from = new Date(year, 0, 1);
    const to = new Date(year, 12, 0);
    return { from: formatInputDate(from), to: formatInputDate(to) };
};

const allOptionObject: DropdownOption = { label: 'All', value: 'All' }
const getDateRangeDays = (from: string, to: string): number | null => {
    if (!from || !to) return null;
    const start = new Date(from);
    const end = new Date(to);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
    const diffInMs = end.getTime() - start.getTime();
    if (diffInMs < 0) return null;
    return Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;
};

const DownloadTicketsDialog: React.FC<DownloadTicketsDialogProps> = ({
    open,
    loading = false,
    generationState = 'idle',
    zoneOptions,
    issueTypeOptions,
    initialFilters,
    onClose,
    onGenerate,
    onCancelExport,
    onRetryExport,
}) => {
    const { t } = useTranslation();

    const today = useMemo(() => new Date(), []);
    const [year, setYear] = useState<number | ''>(today.getFullYear());
    const [month, setMonth] = useState<number | ''>(today.getMonth() + 1);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [zone, setZone] = useState<string>('All');
    const [region, setRegion] = useState<string>('All');
    const [district, setDistrict] = useState<string>('All');
    const [issueType, setIssueType] = useState<string>('All');
    const [assignee, setAssignee] = useState<string>('All');
    const [regionOptions, setRegionOptions] = useState<Array<DropdownOption & { hrmsRegCode?: string }>>([{ label: 'All', value: 'All' }]);
    const [districtOptions, setDistrictOptions] = useState<DropdownOption[]>([{ label: 'All', value: 'All' }]);
    const [regionHrmsCode, setRegionHrmsCode] = useState<string>('All');
    const [generateMenuAnchor, setGenerateMenuAnchor] = useState<null | HTMLElement>(null);
    const [estimatedCount, setEstimatedCount] = useState<number | null>(null);
    const [estimateLoading, setEstimateLoading] = useState(false);


    const { data: getRegionsApiData, pending: getRegionsApiPending, success: getRegionsApiSuccess, apiHandler: getRegionsApiHandler } = useApi()
    const { data: getDistrictsApiData, pending: getDistrictsApiPending, success: getDistrictsApiSuccess, apiHandler: getDistrictsApiHandler } = useApi()
    const { apiHandler: estimateCountApiHandler, pending: estimateCountPending } = useApi<any>()

    const getRegionsHandler = async (zone: any) => {
        return await getRegionsApiHandler(() => getRegions(zone))
    }

    const getDistrictsHandler = async (regionHrmsCode: any) => {
        return await getDistrictsApiHandler(() => getDistricts(regionHrmsCode))
    }

    // Setting Region dropdown options post getRegions API success
    useEffect(() => {
        if (getRegionsApiSuccess && !getRegionsApiPending) {
            const nextRegionOptions = getDropdownOptionsWithExtraOption(getRegionsApiData, "regionName", "regionCode", allOptionObject)
            setRegionOptions(nextRegionOptions);
            const shouldRetainRegion = nextRegionOptions.some((option) => option.value === region);
            const nextRegion = shouldRetainRegion ? region : 'All';
            setRegion(nextRegion);
            const selectedRegionOption = nextRegionOptions.find((option) => option.value === nextRegion);
            setRegionHrmsCode(`${selectedRegionOption?.value}11` || 'All');
        }

    }, [getRegionsApiSuccess, getRegionsApiPending])

    // Setting District dropdown options post getDistricts API success
    useEffect(() => {
        if (getDistrictsApiSuccess && !getDistrictsApiPending) {
            const nextDistrictOptions = getDropdownOptionsWithExtraOption(getDistrictsApiData, 'districtName', 'districtCode', allOptionObject)
            setDistrictOptions(nextDistrictOptions);
            const shouldRetainDistrict = nextDistrictOptions.some((option) => option.value === district);
            setDistrict(shouldRetainDistrict ? district : 'All');
        }
    }, [getDistrictsApiSuccess, getDistrictsApiPending])

    const yearOptions = useMemo(() => {
        const currentYear = new Date().getFullYear() + 1;
        return Array.from({ length: 12 }, (_, index) => currentYear - index);
    }, []);

    const monthOptions = useMemo(
        () => ([
            { value: 1, label: t('January') },
            { value: 2, label: t('February') },
            { value: 3, label: t('March') },
            { value: 4, label: t('April') },
            { value: 5, label: t('May') },
            { value: 6, label: t('June') },
            { value: 7, label: t('July') },
            { value: 8, label: t('August') },
            { value: 9, label: t('September') },
            { value: 10, label: t('October') },
            { value: 11, label: t('November') },
            { value: 12, label: t('December') },
        ]),
        [t],
    );

    useEffect(() => {
        if (!year) {
            setFromDate('');
            setToDate('');
            return;
        }

        const range = getDateRangeForSelection(year, month || undefined);
        setFromDate(range.from);
        setToDate(range.to);
    }, [year, month]);


    useEffect(() => {
        if (!open) return;

        // Option 1 behavior:
        // initialize modal values from page filters once when dialog opens,
        // then keep modal state independent from the page while it is open.
        setZone(initialFilters.zone || 'All');
        setRegion(initialFilters.region || 'All');
        setDistrict(initialFilters.district || 'All');
        setIssueType(initialFilters.issueType || 'All');
        setAssignee(initialFilters.assignee || 'All');
        setRegionOptions([{ label: 'All', value: 'All' }]);
        setDistrictOptions([{ label: 'All', value: 'All' }]);
        setRegionHrmsCode('All');
        setGenerateMenuAnchor(null);
    }, [initialFilters, open]);

    useEffect(() => {
        if (!open) return;

        if (zone === 'All') {
            setRegion('All');
            setRegionHrmsCode('All');
            setDistrict('All');
            setRegionOptions([{ label: 'All', value: 'All' }]);
            setDistrictOptions([{ label: 'All', value: 'All' }]);
            return;
        }
        // Region list in modal is always loaded from modal's zone selection.
        getRegionsHandler(zone)
    }, [open, region, zone]);

    useEffect(() => {
        if (!open) return;

        if (regionHrmsCode === 'All') {
            setDistrict('All');
            setDistrictOptions([{ label: 'All', value: 'All' }]);
            return;
        }

        // District list in modal is always loaded from modal's region selection.
        getDistrictsHandler(regionHrmsCode)
    }, [district, open, regionHrmsCode]);

    const handleRegionChange = (nextRegion: string) => {
        setRegion(nextRegion);
        setRegionHrmsCode(nextRegion !== 'All' ? `${nextRegion}11` : 'All');
        setDistrict('All');
    };

    const applyPresetRange = (days: number) => {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - (days - 1));
        setFromDate(formatInputDate(start));
        setToDate(formatInputDate(end));
    };

    const handleGenerateSelection = async (format: 'pdf' | 'excel') => {
        const selectedZone = zoneOptions.find((option) => option.value === zone);
        const selectedRegion = regionOptions.find((option) => option.value === region);
        const selectedDistrict = districtOptions.find((option) => option.value === district);
        const selectedIssueType = issueTypeOptions.find((option) => option.value === issueType);
        await onGenerate(format, {
            fromDate,
            toDate,
            zoneCode: zone !== 'All' ? zone : undefined,
            zoneLabel: zone !== 'All' ? selectedZone?.label || zone : undefined,
            regionCode: region !== 'All' ? region : undefined,
            regionLabel: region !== 'All' ? selectedRegion?.label || region : undefined,
            districtCode: district !== 'All' ? district : undefined,
            districtLabel: district !== 'All' ? selectedDistrict?.label || district : undefined,
            issueTypeId: issueType !== 'All' ? issueType : undefined,
            issueTypeLabel: issueType !== 'All' ? selectedIssueType?.label || issueType : undefined,
            assignedTo: assignee !== 'All' ? assignee : undefined,
            assignedToLabel: assignee !== 'All' ? assignee : undefined,
        });
        setGenerateMenuAnchor(null);
    };

    const selectedRangeDays = useMemo(() => getDateRangeDays(fromDate, toDate), [fromDate, toDate]);
    const isRangeInvalid = selectedRangeDays === null;

    useEffect(() => {
        if (!open || !fromDate || !toDate || isRangeInvalid) {
            setEstimatedCount(null);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                setEstimateLoading(true);
                const response = await estimateCountApiHandler(() => searchTicketsPaginated(
                    '',
                    undefined,
                    undefined,
                    0,
                    1,
                    assignee !== 'All' ? assignee : undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    fromDate,
                    toDate,
                    undefined,
                    undefined,
                    zone !== 'All' ? zone : undefined,
                    region !== 'All' ? region : undefined,
                    district !== 'All' ? district : undefined,
                    issueType !== 'All' ? issueType : undefined,
                ));
                setEstimatedCount(response?.totalElements ?? null);
            } catch (_) {
                setEstimatedCount(null);
            } finally {
                setEstimateLoading(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [open, fromDate, toDate, zone, region, district, issueType, assignee, isRangeInvalid, estimateCountApiHandler]);

    return (
        <>
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
                <DialogTitle>{t('Download Tickets')}</DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="download-year-label">{t('Year')}</InputLabel>
                                <Select
                                    labelId="download-year-label"
                                    label={t('Year')}
                                    value={year}
                                    onChange={(event) => setYear(event.target.value === '' ? '' : Number(event.target.value))}
                                >
                                    {yearOptions.map((optionYear) => (
                                        <MenuItem key={optionYear} value={optionYear}>
                                            {optionYear}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth size="small">
                                <InputLabel id="download-month-label">{t('Month')}</InputLabel>
                                <Select
                                    labelId="download-month-label"
                                    label={t('Month')}
                                    value={month}
                                    onChange={(event) => setMonth(event.target.value === '' ? '' : Number(event.target.value))}
                                >
                                    <MenuItem value="">{t('All')}</MenuItem>
                                    {monthOptions.map((optionMonth) => (
                                        <MenuItem key={optionMonth.value} value={optionMonth.value}>
                                            {optionMonth.label}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="download-zone-label">{t('Zone')}</InputLabel>
                                <Select
                                    labelId="download-zone-label"
                                    label={t('Zone')}
                                    value={zone}
                                    onChange={(event) => setZone(String(event.target.value))}
                                >
                                    {zoneOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth size="small">
                                <InputLabel id="download-region-label">{t('Region')}</InputLabel>
                                <Select
                                    labelId="download-region-label"
                                    label={t('Region')}
                                    value={region}
                                    onChange={(event) => handleRegionChange(String(event.target.value))}
                                >
                                    {regionOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <FormControl fullWidth size="small">
                                <InputLabel id="download-district-label">{t('District')}</InputLabel>
                                <Select
                                    labelId="download-district-label"
                                    label={t('District')}
                                    value={district}
                                    onChange={(event) => setDistrict(String(event.target.value))}
                                >
                                    {districtOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth size="small">
                                <InputLabel id="download-issue-type-label">{t('Issue Type')}</InputLabel>
                                <Select
                                    labelId="download-issue-type-label"
                                    label={t('Issue Type')}
                                    value={issueType}
                                    onChange={(event) => setIssueType(String(event.target.value))}
                                >
                                    {issueTypeOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                            <AssigneeFilterDropdown
                                value={assignee}
                                onChange={setAssignee}
                            />
                            <TextField
                                label={t('From Date')}
                                type="date"
                                size="small"
                                fullWidth
                                value={fromDate}
                                InputLabelProps={{ shrink: true }}
                                onChange={(event) => setFromDate(event.target.value)}
                            />
                            <TextField
                                label={t('To Date')}
                                type="date"
                                size="small"
                                fullWidth
                                value={toDate}
                                InputLabelProps={{ shrink: true }}
                                onChange={(event) => setToDate(event.target.value)}
                            />
                        </Stack>

                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }}>
                            <Button variant="outlined" size="small" onClick={() => applyPresetRange(7)}>{t('Last 7 days')}</Button>
                            <Button variant="outlined" size="small" onClick={() => applyPresetRange(30)}>{t('Last 30 days')}</Button>
                            <Chip
                                size="small"
                                label={(estimateLoading || estimateCountPending) ? t('Estimating records...') : estimatedCount !== null ? `${t('Estimated records')}: ~${estimatedCount.toLocaleString()}` : t('Estimated records unavailable')}
                            />
                        </Stack>

                        {generationState === 'generating' && (
                            <Alert severity="info">
                                {t('Your report is being generated.')}
                                {onCancelExport && (
                                    <Button size="small" sx={{ ml: 1 }} onClick={onCancelExport}>{t('Cancel export')}</Button>
                                )}
                            </Alert>
                        )}

                        {generationState === 'error' && (
                            <Alert severity="error">
                                {t('Export failed. Range may be too large; narrow filters or request async report.')}
                                {onRetryExport && (
                                    <Button size="small" sx={{ ml: 1 }} onClick={onRetryExport}>{t('Retry')}</Button>
                                )}
                            </Alert>
                        )}

                        {isRangeInvalid && (
                            <Alert severity="warning">
                                {t('Please select a valid date range.')}
                            </Alert>
                        )}

                        {selectedRangeDays !== null && selectedRangeDays > 31 && (
                            <Alert severity="info">
                                {t('Large date range selected. It may take some time to download this data.')}
                            </Alert>
                        )}

                        <Button
                            variant="contained"
                            onClick={(event) => setGenerateMenuAnchor(event.currentTarget)}
                            disabled={loading}
                            startIcon={<DownloadIcon fontSize="small" />}
                        >
                            {t('Generate')}
                        </Button>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose}>{t('Cancel')}</Button>
                </DialogActions>
            </Dialog>

            <Menu anchorEl={generateMenuAnchor} open={Boolean(generateMenuAnchor)} onClose={() => setGenerateMenuAnchor(null)}>
                <MenuItem onClick={() => handleGenerateSelection('pdf')}>
                    <ListItemIcon>
                        <PictureAsPdfIcon fontSize="small" />
                    </ListItemIcon>
                    {t('As PDF')}
                </MenuItem>
                <MenuItem onClick={() => handleGenerateSelection('excel')}>
                    <ListItemIcon>
                        <GridOnIcon fontSize="small" />
                    </ListItemIcon>
                    {t('As Excel')}
                </MenuItem>
            </Menu>
        </>
    );
};

export type { DownloadFilters, DownloadDialogInitialFilters };
export default DownloadTicketsDialog;
