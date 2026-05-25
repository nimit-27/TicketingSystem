import { DropdownOption } from "../components/UI/Dropdown/GenericDropdown";

export type DateRangePreset =
    | "ALL"
    | "LAST_1_DAY"
    | "LAST_1_WEEK"
    | "LAST_1_MONTH"
    | "LAST_1_YEAR"
    | "CUSTOM";

export interface DateRangeState {
    preset: DateRangePreset;
    fromDate?: string;
    toDate?: string;
}

export const DATE_RANGE_OPTIONS: DropdownOption[] = [
    { label: "All Time", value: "ALL" },
    { label: "Last 1 Day", value: "LAST_1_DAY" },
    { label: "Last 1 Week", value: "LAST_1_WEEK" },
    { label: "Last 1 Month", value: "LAST_1_MONTH" },
    { label: "Last 1 Year", value: "LAST_1_YEAR" },
    { label: "Custom", value: "CUSTOM" },
];

const formatDateInput = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

const cloneDate = (date: Date): Date => new Date(date.getTime());

export const getPresetDateRange = (preset: DateRangePreset, now: Date = new Date()): Partial<DateRangeState> | undefined => {
    if (preset === "ALL" || preset === "CUSTOM") {
        return undefined;
    }

    const end = cloneDate(now);
    const start = cloneDate(now);

    switch (preset) {
        case "LAST_1_DAY":
            start.setDate(start.getDate() - 1);
            break;
        case "LAST_1_WEEK":
            start.setDate(start.getDate() - 7);
            break;
        case "LAST_1_MONTH":
            start.setMonth(start.getMonth() - 1);
            break;
        case "LAST_1_YEAR":
            start.setFullYear(start.getFullYear() - 1);
            break;
        default:
            return undefined;
    }

    return {
        fromDate: formatDateInput(start),
        toDate: formatDateInput(end),
    };
};

export const buildApiDateParams = (state: DateRangeState | undefined): { fromDate?: string; toDate?: string } => {
    if (!state || state.preset === "ALL") {
        return {};
    }

    const from = state.fromDate ? `${state.fromDate}T00:00:00` : undefined;
    const to = state.toDate ? `${state.toDate}T23:59:59` : undefined;

    return {
        fromDate: from,
        toDate: to,
    };
};

export const ensureCustomPreset = (state: DateRangeState, updated: Partial<DateRangeState>): DateRangeState => ({
    preset: "CUSTOM",
    fromDate: updated.fromDate ?? state.fromDate,
    toDate: updated.toDate ?? state.toDate,
});
