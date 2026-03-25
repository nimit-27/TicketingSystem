import * as XLSX from "xlsx";
import { SupportDashboardTimeRange, SupportDashboardTimeScale } from "../types/reports";

export const ADMIN_ROLES = new Set(["Team Lead", "System Administrator", "Regional Nodal Officer"]);

export const formatDateInput = (date: Date) => date.toISOString().split("T")[0];

export const timeScaleOptions: { value: SupportDashboardTimeScale; label: string }[] = [
    { value: "DAILY", label: "Daily" },
    { value: "WEEKLY", label: "Weekly" },
    { value: "MONTHLY", label: "Monthly" },
    { value: "YEARLY", label: "Yearly" },
];

export const timeRangeOptions: Record<SupportDashboardTimeScale, { value: SupportDashboardTimeRange; label: string }[]> = {
    DAILY: [
        { value: "ALL_TIME", label: "All" },
        { value: "LAST_DAY", label: "Last 1 Day" },
        { value: "LAST_7_DAYS", label: "Last 1 Week" },
        { value: "LAST_30_DAYS", label: "Last 1 Month" },
        { value: "LAST_YEAR", label: "Last 1 Year" },
        { value: "CUSTOM_DATE_RANGE", label: "Custom" },
    ],
    WEEKLY: [
        { value: "ALL_TIME", label: "All" },
        { value: "LAST_WEEK", label: "Last Week" },
        { value: "LAST_30_DAYS", label: "Last Month" },
        { value: "LAST_YEAR", label: "Last Year" },
        { value: "CUSTOM_DATE_RANGE", label: "Custom" },
    ],
    MONTHLY: [
        { value: "ALL_TIME", label: "All" },
        { value: "LAST_30_DAYS", label: "Last Month" },
        { value: "LAST_YEAR", label: "Last Year" },
        { value: "LAST_5_YEARS", label: "Last 2 Years" },
        { value: "CUSTOM_DATE_RANGE", label: "Custom" },
    ],
    YEARLY: [
        { value: "ALL_TIME", label: "All" },
        { value: "LAST_YEAR", label: "Last Year" },
        { value: "LAST_5_YEARS", label: "Last 5 Years" },
        { value: "CUSTOM_DATE_RANGE", label: "Custom" },
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
export const calculateDateRange = (
    timeScale: SupportDashboardTimeScale,
    timeRange: SupportDashboardTimeRange,
    _customMonthRange: { start: number | null; end: number | null },
) => {
    const today = new Date();

    const buildRange = (from: Date | null, to: Date | null) => ({
        from: from ? formatDateInput(from) : "",
        to: to ? formatDateInput(to) : "",
    });

    if (timeScale === "CUSTOM" || timeRange === "CUSTOM_DATE_RANGE") {
        return buildRange(null, null);
    }

    if (timeRange === "ALL_TIME") {
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

            if (timeRange === "LAST_30_DAYS") {
                const from = new Date(today);
                from.setDate(from.getDate() - 29);
                return buildRange(from, today);
            }

            if (timeRange === "LAST_YEAR") {
                const from = new Date(today);
                from.setFullYear(from.getFullYear() - 1);
                return buildRange(from, today);
            }

            return buildRange(null, null);
        }
        case "WEEKLY": {
            if (timeRange === "LAST_WEEK") {
                const start = startOfWeek(today);
                start.setDate(start.getDate() - 7);
                const end = endOfWeek(start);
                return buildRange(start, end);
            }

            if (timeRange === "LAST_30_DAYS") {
                const end = endOfWeek(today);
                const start = new Date(end);
                start.setDate(start.getDate() - 27);
                return buildRange(start, end);
            }

            const end = endOfWeek(today);
            const start = new Date(end);
            start.setDate(start.getDate() - 364);
            return buildRange(start, end);
        }
        case "MONTHLY": {
            const currentYear = today.getFullYear();

            if (timeRange === "LAST_30_DAYS") {
                const start = new Date(today);
                start.setMonth(start.getMonth() - 1);
                return buildRange(start, today);
            }

            if (timeRange === "LAST_YEAR") {
                const start = new Date(today);
                start.setFullYear(start.getFullYear() - 1);
                return buildRange(start, today);
            }

            if (timeRange === "LAST_5_YEARS") {
                const start = new Date(today);
                start.setFullYear(start.getFullYear() - 2);
                return buildRange(start, today);
            }

            return buildRange(startOfYear(currentYear), today);
        }
        case "YEARLY": {
            const currentYear = today.getFullYear();

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
