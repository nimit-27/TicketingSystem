import React, { useEffect, useMemo, useState } from 'react';
import {
    Button,
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
import { getDropdownOptions, getDropdownOptionsWithExtraOption } from '../../utils/Utils';

interface DownloadFilters {
    fromDate: string;
    toDate: string;
    zoneCode?: string;
    regionCode?: string;
    districtCode?: string;
    issueTypeId?: string;
}

interface DownloadDialogInitialFilters {
    zone: string;
    region: string;
    district: string;
    issueType: string;
}

interface DownloadTicketsDialogProps {
    open: boolean;
    loading?: boolean;
    zoneOptions: DropdownOption[];
    issueTypeOptions: DropdownOption[];
    initialFilters: DownloadDialogInitialFilters;
    onClose: () => void;
    onGenerate: (format: 'pdf' | 'excel', filters: DownloadFilters) => Promise<void> | void;
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

const extractLocationRecords = (response: any): any[] => {
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.data)) return response.data;
    if (Array.isArray(response?.data?.data)) return response.data.data;
    return [];
};

const mapRegionOptions = (response: any): Array<DropdownOption & { hrmsRegCode?: string }> => [
    { label: 'All', value: 'All' },
    ...extractLocationRecords(response).map((region: any) => ({
        label: region.regionName ?? '',
        value: String(region.regionCode ?? ''),
        hrmsRegCode: region.hrmsRegCode ?? '',
    })),
];

const mapDistrictOptions = (response: any): DropdownOption[] => [
    { label: 'All', value: 'All' },
    ...extractLocationRecords(response).map((district: any) => ({
        label: district.districtName ? `${district.districtName} (${district.districtCode})` : String(district.districtCode ?? ''),
        value: String(district.districtCode ?? ''),
    })),
];

const allOptionObject: DropdownOption = { label: 'All', value: 'All' }

const DownloadTicketsDialog: React.FC<DownloadTicketsDialogProps> = ({
    open,
    loading = false,
    zoneOptions,
    issueTypeOptions,
    initialFilters,
    onClose,
    onGenerate,
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
    const [regionOptions, setRegionOptions] = useState<Array<DropdownOption & { hrmsRegCode?: string }>>([{ label: 'All', value: 'All' }]);
    const [districtOptions, setDistrictOptions] = useState<DropdownOption[]>([{ label: 'All', value: 'All' }]);
    const [regionHrmsCode, setRegionHrmsCode] = useState<string>('All');
    const [generateMenuAnchor, setGenerateMenuAnchor] = useState<null | HTMLElement>(null);

    const { data: getRegionsApiData, pending: getRegionsApiPending, success: getRegionsApiSuccess, apiHandler: getRegionsApiHandler } = useApi()

    const getRegionsHandler = async (zone: any) => {
        return await getRegionsApiHandler(() => getRegions(zone))
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
        getDistricts(regionHrmsCode)
            .then((response) => {
                const nextDistrictOptions = mapDistrictOptions(response);
                setDistrictOptions(nextDistrictOptions);
                const shouldRetainDistrict = nextDistrictOptions.some((option) => option.value === district);
                setDistrict(shouldRetainDistrict ? district : 'All');
            })
            .catch(() => {
                setDistrict('All');
                setDistrictOptions([{ label: 'All', value: 'All' }]);
            });
    }, [district, open, regionHrmsCode]);

    const handleRegionChange = (nextRegion: string) => {
        setRegion(nextRegion);
        const selectedRegionOption = regionOptions.find((option) => option.value === nextRegion);
        setRegionHrmsCode(selectedRegionOption?.hrmsRegCode || 'All');
        setDistrict('All');
    };

    const handleGenerateSelection = async (format: 'pdf' | 'excel') => {
        await onGenerate(format, {
            fromDate,
            toDate,
            zoneCode: zone !== 'All' ? zone : undefined,
            regionCode: region !== 'All' ? region : undefined,
            districtCode: district !== 'All' ? district : undefined,
            issueTypeId: issueType !== 'All' ? issueType : undefined,
        });
        setGenerateMenuAnchor(null);
    };

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
