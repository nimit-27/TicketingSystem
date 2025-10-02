import React from "react";
import { Box } from "@mui/material";
import DropdownController from "../UI/Dropdown/DropdownController";
import GenericInput from "../UI/Input/GenericInput";
import { useTranslation } from "react-i18next";
import { buildApiDateParams, DATE_RANGE_OPTIONS, DateRangePreset, DateRangeState, ensureCustomPreset, getPresetDateRange } from 
    "../../utils/dateUtils";

type DateRangeFilterProps = {
    value: DateRangeState;
    onChange: (value: DateRangeState) => void;
    style?: React.CSSProperties;
    className?: string;
};

export const getDateRangeApiParams = buildApiDateParams;

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ value, onChange, style, className }) => {
    const { t } = useTranslation();

    const handlePresetChange = (selected: string) => {
        const preset = selected as DateRangePreset;
        if (preset === "ALL") {
            onChange({ preset: "ALL" });
            return;
        }
        if (preset === "CUSTOM") {
            onChange({ ...value, preset: "CUSTOM" });
            return;
        }
        const range = getPresetDateRange(preset);
        onChange({ preset, ...(range ?? {}) });
    };

    const handleFromDateChange = (newDate: string) => {
        onChange(ensureCustomPreset(value, { fromDate: newDate }));
    };

    const handleToDateChange = (newDate: string) => {
        onChange(ensureCustomPreset(value, { toDate: newDate }));
    };

    return (
        <Box display="flex" alignItems="center" className={className} style={style}>
            <DropdownController
                label={t("Date Range")}
                value={value.preset}
                onChange={handlePresetChange}
                options={DATE_RANGE_OPTIONS.map(option => ({
                    ...option,
                    label: t(option.label),
                }))}
                style={{ width: 200, marginRight: 8 }}
            />
            {value.preset === "CUSTOM" && (
                <Box display="flex" alignItems="center" gap={1}>
                    <GenericInput
                        type="date"
                        label={t("From")}
                        value={value.fromDate ?? ""}
                        onChange={(event) => handleFromDateChange(event.target.value)}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                    />
                    <GenericInput
                        type="date"
                        label={t("To")}
                        value={value.toDate ?? ""}
                        onChange={(event) => handleToDateChange(event.target.value)}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                    />
                </Box>
            )}
        </Box>
    );
};

export default DateRangeFilter;
