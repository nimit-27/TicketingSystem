import React, { useEffect, useMemo, useState } from "react";
import { Box } from "@mui/material";
import DropdownController from "../UI/Dropdown/DropdownController";
import GenericInput from "../UI/Input/GenericInput";
import { useTranslation } from "react-i18next";
import { buildApiDateParams, DATE_RANGE_OPTIONS, DateRangePreset, DateRangeState, ensureCustomPreset, getPresetDateRange } from
    "../../utils/dateUtils";
import CustomIconButton from "../UI/IconButton/CustomIconButton";

type DateRangeFilterProps = {
    value: DateRangeState;
    onChange: (value: DateRangeState) => void;
    style?: React.CSSProperties;
    className?: string;
};

export const getDateRangeApiParams = buildApiDateParams;

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({ value, onChange, style, className }) => {
    const { t } = useTranslation();

    const [customRange, setCustomRange] = useState<{ fromDate: string; toDate: string }>({
        fromDate: value.fromDate ?? "",
        toDate: value.toDate ?? "",
    });

    const isCustomPresetSelected = useMemo(() => value.preset === "CUSTOM", [value.preset]);

    useEffect(() => {
        if (isCustomPresetSelected) {
            setCustomRange((prev) => ({
                fromDate: value.fromDate ?? prev.fromDate,
                toDate: value.toDate ?? prev.toDate,
            }));
        } else {
            setCustomRange({ fromDate: "", toDate: "" });
        }
    }, [isCustomPresetSelected, value.fromDate, value.toDate]);

    const handlePresetChange = (selected: string) => {
        const preset = selected as DateRangePreset;
        if (preset === "ALL") {
            onChange({ preset: "ALL" });
            return;
        }
        if (preset === "CUSTOM") {
            setCustomRange({
                fromDate: value.fromDate ?? "",
                toDate: value.toDate ?? "",
            });
            onChange({ ...value, preset: "CUSTOM" });
            return;
        }
        const range = getPresetDateRange(preset);
        onChange({ preset, ...(range ?? {}) });
    };

    const handleFromDateChange = (newDate: string) => {
        setCustomRange((prev) => ({ ...prev, fromDate: newDate }));
    };

    const handleToDateChange = (newDate: string) => {
        setCustomRange((prev) => ({ ...prev, toDate: newDate }));
    };

    const handleSubmit = () => {
        if (!isCustomPresetSelected) {
            return;
        }

        onChange(ensureCustomPreset(value, {
            fromDate: customRange.fromDate || undefined,
            toDate: customRange.toDate || undefined,
        }));
    };

    return (
        <Box
            display="flex"
            flexDirection={"row"}
            alignItems={isCustomPresetSelected ? "flex-start" : "center"}
            className={className}
            style={style}
        >
            <DropdownController
                label={t("Date Range")}
                value={value.preset}
                className="mt-2"
                onChange={handlePresetChange}
                options={DATE_RANGE_OPTIONS.map(option => ({
                    ...option,
                    label: t(option.label),
                }))}
                style={{ width: 200, marginRight: 8 }}
            />
            {isCustomPresetSelected && (
                <Box display="flex" alignItems="center" gap={1} mt={1}>
                    <GenericInput
                        type="date"
                        label={t("From")}
                        value={customRange.fromDate}
                        onChange={(event) => handleFromDateChange(event.target.value)}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                    />
                    <GenericInput
                        type="date"
                        label={t("To")}
                        value={customRange.toDate}
                        onChange={(event) => handleToDateChange(event.target.value)}
                        size="small"
                        InputLabelProps={{ shrink: true }}
                    />
                    <CustomIconButton icon="check" size="small" onClick={handleSubmit} />
                </Box>
            )}
        </Box>
    );
};

export default DateRangeFilter;
