import { createMonthOptions, createQuarterOptions, getPeriodDateRange } from "../detailedSlaReportDates";

describe("detailed SLA report date filters", () => {
    it("formats month and quarter dropdown options", () => {
        const now = new Date(2026, 8, 30);
        expect(createMonthOptions(now).slice(0, 2)).toEqual([
            { value: "2026-09", label: "Sep 2026" },
            { value: "2026-08", label: "Aug 2026" },
        ]);
        expect(createQuarterOptions(now).slice(0, 2)).toEqual([
            { value: "2026-Q3", label: "Q3 2026" },
            { value: "2026-Q2", label: "Q2 2026" },
        ]);
    });

    it("uses one month when no to month is provided", () => {
        expect(getPeriodDateRange("MONTHLY", "2024-02")).toEqual({ fromDate: "2024-02-01", toDate: "2024-02-29" });
    });

    it("converts a quarter range to its boundary dates", () => {
        expect(getPeriodDateRange("QUARTERLY", "2025-Q2", "2025-Q4")).toEqual({ fromDate: "2025-04-01", toDate: "2025-12-31" });
    });
});
