export type ReportPeriod = "daily" | "weekly" | "monthly" | "quarterly" | "half-yearly";

export interface ReportRange {
    startDate: Date;
    endDate: Date;
}

export interface ReportPeriodOption {
    value: ReportPeriod;
    label: string;
}

const setToStartOfDay = (date: Date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
};

export const calculatePeriodRange = (period: ReportPeriod): ReportRange => {
    const endDate = new Date();
    const startDate = setToStartOfDay(endDate);

    switch (period) {
        case "weekly":
            startDate.setDate(endDate.getDate() - 6);
            break;
        case "monthly":
            startDate.setMonth(endDate.getMonth() - 1);
            break;
        case "quarterly":
            startDate.setMonth(endDate.getMonth() - 3);
            break;
        case "half-yearly":
            startDate.setMonth(endDate.getMonth() - 6);
            break;
        case "daily":
        default:
            break;
    }

    return { startDate, endDate };
};

export const REPORT_PERIODS: ReportPeriodOption[] = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
    { value: "quarterly", label: "Quarterly" },
    { value: "half-yearly", label: "Half-Yearly" },
];

export const getPeriodLabel = (period: ReportPeriod): string =>
    REPORT_PERIODS.find((option) => option.value === period)?.label ?? period;
