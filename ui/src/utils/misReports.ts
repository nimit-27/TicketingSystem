import * as XLSX from "xlsx";
import { SupportDashboardTimeRange, SupportDashboardTimeScale } from "../types/reports";

export const ADMIN_ROLES = new Set(["Team Lead", "System Administrator", "Regional Nodal Officer"]);

export const formatDateInput = (date: Date) => date.toISOString().split("T")[0];

export const timeScaleOptions: { value: SupportDashboardTimeScale; label: string }[] = [
    { value: "DAILY", label: "Interval" },
    { value: "WEEKLY", label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
    { value: "YEARLY", label: "Yearly" },
    { value: "CUSTOM", label: "Custom" },
];

export const timeRangeOptions: Record<SupportDashboardTimeScale, { value: SupportDashboardTimeRange; label: string }[]> = {
    DAILY: [
        { value: "LAST_7_DAYS", label: "Last 7 Days" },
        { value: "LAST_30_DAYS", label: "Last 30 Days" },
    ],
    WEEKLY: [
        { value: "LAST_4_WEEKS", label: "Last 4 Weeks" },
    ],
    MONTHLY: [
        { value: "LAST_6_MONTHS", label: "Last 6 Months" },
        { value: "CURRENT_YEAR", label: "Current Year" },
        { value: "LAST_YEAR", label: "Previous Year" },
        { value: "LAST_5_YEARS", label: "Last 5 Years" },
        { value: "CUSTOM_MONTH_RANGE", label: "Custom Range" },
        { value: "ALL_TIME", label: "All Time" },
    ],
    YEARLY: [
        { value: "YEAR_TO_DATE", label: "Year To Date" },
        { value: "LAST_YEAR", label: "Previous Year" },
        { value: "LAST_5_YEARS", label: "Last 5 Years" },
    ],
    CUSTOM: [{ value: "CUSTOM_DATE_RANGE", label: "Custom Dates" }],
};

const startOfWeek = (date: Date) => {
    const clone = new Date(date);
    const day = clone.getDay();
    const diff = (day + 6) % 7;
    clone.setDate(clone.getDate() - diff);
    return clone;
};

const endOfWeek = (date: Date) => {
    const start = startOfWeek(date);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    return end;
};

const startOfYear = (year: number) => new Date(year, 0, 1);
const endOfYear = (year: number) => new Date(year, 11, 31);
const endOfMonth = (year: number, monthIndex: number) => new Date(year, monthIndex + 1, 0);

export const calculateDateRange = (
    timeScale: SupportDashboardTimeScale,
    timeRange: SupportDashboardTimeRange,
    customMonthRange: { start: number | null; end: number | null },
) => {
    const today = new Date();

    const buildRange = (from: Date | null, to: Date | null) => ({
        from: from ? formatDateInput(from) : "",
        to: to ? formatDateInput(to) : "",
    });

    if (timeScale === "CUSTOM" || timeRange === "CUSTOM_DATE_RANGE") {
        return buildRange(null, null);
    }

    switch (timeScale) {
        case "DAILY": {
            if (timeRange === "LAST_DAY") {
                const from = new Date(today);
                from.setDate(from.getDate() - 1);
                return buildRange(from, today);
            }

            if (timeRange === "LAST_7_DAYS") {
                const from = new Date(today);
                from.setDate(from.getDate() - 6);
                return buildRange(from, today);
            }

            const from = new Date(today);
            from.setDate(from.getDate() - 29);
            return buildRange(from, today);
        }
        case "WEEKLY": {
            if (timeRange === "THIS_WEEK") {
                return buildRange(startOfWeek(today), endOfWeek(today));
            }

            if (timeRange === "LAST_WEEK") {
                const start = startOfWeek(today);
                start.setDate(start.getDate() - 7);
                const end = endOfWeek(start);
                return buildRange(start, end);
            }

            const start = startOfWeek(today);
            start.setDate(start.getDate() - 21);
            const end = endOfWeek(today);
            return buildRange(start, end);
        }
        case "MONTHLY": {
            const currentYear = today.getFullYear();
            const currentMonth = today.getMonth();

            if (timeRange === "LAST_6_MONTHS") {
                const startMonth = new Date(today);
                startMonth.setMonth(startMonth.getMonth() - 5, 1);
                return buildRange(startMonth, endOfMonth(currentYear, currentMonth));
            }

            if (timeRange === "CURRENT_YEAR") {
                return buildRange(startOfYear(currentYear), today);
            }

            if (timeRange === "LAST_YEAR") {
                return buildRange(startOfYear(currentYear - 1), endOfYear(currentYear - 1));
            }

            if (timeRange === "LAST_5_YEARS") {
                return buildRange(startOfYear(currentYear - 4), endOfYear(currentYear));
            }

            if (timeRange === "CUSTOM_MONTH_RANGE") {
                const startYear = customMonthRange.start ?? currentYear;
                const endYear = customMonthRange.end ?? currentYear;
                return buildRange(startOfYear(startYear), endOfYear(endYear));
            }

            return buildRange(startOfYear(1970), endOfYear(currentYear));
        }
        case "YEARLY": {
            const currentYear = today.getFullYear();

            if (timeRange === "YEAR_TO_DATE") {
                return buildRange(startOfYear(currentYear), today);
            }

            if (timeRange === "LAST_YEAR") {
                return buildRange(startOfYear(currentYear - 1), endOfYear(currentYear - 1));
            }

            return buildRange(startOfYear(currentYear - 4), endOfYear(currentYear));
        }
        default:
            return buildRange(null, null);
    }
};

export const extractApiPayload = <T,>(response: any): T | null => {
    const rawPayload = response?.data ?? response;
    const resp = rawPayload?.body ?? rawPayload;

    if (resp && typeof resp === "object" && "success" in resp && resp.success === false) {
        const message = resp?.error?.message ?? "Unable to fetch report data.";
        throw new Error(message);
    }

    if (resp && typeof resp === "object" && "data" in resp) {
        return (resp.data ?? null) as T | null;
    }

    return (resp ?? null) as T | null;
};

export const calculateColumnWidths = (rows: (string | number)[][]) => {
    const widths: { wch: number }[] = [];

    rows.forEach((row) => {
        row.forEach((cell, columnIndex) => {
            const value = cell == null ? "" : String(cell);
            const maxLineLength = Math.max(...value.split("\n").map((line) => line.length));
            const paddedWidth = maxLineLength + 2;

            widths[columnIndex] = {
                wch: Math.max(widths[columnIndex]?.wch ?? 0, paddedWidth, 12),
            };
        });
    });

    return widths;
};

export const applyThinBorders = (worksheet: XLSX.WorkSheet) => {
    const range = worksheet["!ref"] ? XLSX.utils.decode_range(worksheet["!ref"] as string) : null;
    if (!range) return;

    const borderStyle = { style: "thin", color: { auto: 1 } } as any;

    for (let row = range.s.r; row <= range.e.r; row += 1) {
        for (let col = range.s.c; col <= range.e.c; col += 1) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            const cell = (worksheet[cellAddress] || { t: "s", v: "" }) as XLSX.CellObject;
            cell.s = {
                ...(cell.s || {}),
                border: {
                    top: borderStyle,
                    bottom: borderStyle,
                    left: borderStyle,
                    right: borderStyle,
                },
            } as any;
            worksheet[cellAddress] = cell;
        }
    }
};
