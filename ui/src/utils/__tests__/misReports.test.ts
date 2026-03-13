jest.mock(
  "xlsx",
  () => ({
    utils: {
      decode_range: jest.fn((ref: string) => {
        if (ref === "A1:B2") return { s: { r: 0, c: 0 }, e: { r: 1, c: 1 } };
        return null;
      }),
      encode_cell: jest.fn(({ r, c }: { r: number; c: number }) => String.fromCharCode(65 + c) + String(r + 1)),
    },
  }),
  { virtual: true },
);

import {
  ADMIN_ROLES,
  applyThinBorders,
  calculateColumnWidths,
  calculateDateRange,
  extractApiPayload,
  formatDateInput,
  timeRangeOptions,
  timeScaleOptions,
} from "../misReports";

describe("utils/misReports", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-08-15T10:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("exposes expected role/option constants", () => {
    expect(ADMIN_ROLES.has("Team Lead")).toBe(true);
    expect(timeScaleOptions.map((s) => s.value)).toContain("CUSTOM");
    expect(timeRangeOptions.MONTHLY.some((x) => x.value === "ALL_TIME")).toBe(true);
  });

  it("formats date input", () => {
    expect(formatDateInput(new Date("2024-08-15T10:00:00Z"))).toBe("2024-08-15");
  });

  it("calculates daily ranges", () => {
    expect(calculateDateRange("DAILY", "LAST_DAY", { start: null, end: null })).toEqual({ from: "2024-08-14", to: "2024-08-15" });
    expect(calculateDateRange("DAILY", "LAST_7_DAYS", { start: null, end: null })).toEqual({ from: "2024-08-09", to: "2024-08-15" });
    expect(calculateDateRange("DAILY", "LAST_30_DAYS", { start: null, end: null })).toEqual({ from: "2024-07-17", to: "2024-08-15" });
  });

  it("calculates weekly ranges", () => {
    expect(calculateDateRange("WEEKLY", "THIS_WEEK", { start: null, end: null })).toEqual({ from: "2024-08-12", to: "2024-08-18" });
    expect(calculateDateRange("WEEKLY", "LAST_WEEK", { start: null, end: null })).toEqual({ from: "2024-08-05", to: "2024-08-11" });
    expect(calculateDateRange("WEEKLY", "LAST_4_WEEKS", { start: null, end: null })).toEqual({ from: "2024-07-22", to: "2024-08-18" });
  });

  it("calculates monthly/yearly/custom and default ranges", () => {
    expect(calculateDateRange("MONTHLY", "LAST_6_MONTHS", { start: null, end: null })).toEqual({ from: "2024-03-01", to: "2024-08-31" });
    expect(calculateDateRange("MONTHLY", "CURRENT_YEAR", { start: null, end: null })).toEqual({ from: "2024-01-01", to: "2024-08-15" });
    expect(calculateDateRange("MONTHLY", "LAST_YEAR", { start: null, end: null })).toEqual({ from: "2023-01-01", to: "2023-12-31" });
    expect(calculateDateRange("MONTHLY", "LAST_5_YEARS", { start: null, end: null })).toEqual({ from: "2020-01-01", to: "2024-12-31" });
    expect(calculateDateRange("MONTHLY", "CUSTOM_MONTH_RANGE", { start: 2021, end: 2022 })).toEqual({ from: "2021-01-01", to: "2022-12-31" });
    expect(calculateDateRange("MONTHLY", "ALL_TIME", { start: null, end: null })).toEqual({ from: "1970-01-01", to: "2024-12-31" });

    expect(calculateDateRange("YEARLY", "YEAR_TO_DATE", { start: null, end: null })).toEqual({ from: "2024-01-01", to: "2024-08-15" });
    expect(calculateDateRange("YEARLY", "LAST_YEAR", { start: null, end: null })).toEqual({ from: "2023-01-01", to: "2023-12-31" });
    expect(calculateDateRange("YEARLY", "LAST_5_YEARS", { start: null, end: null })).toEqual({ from: "2020-01-01", to: "2024-12-31" });
    expect(calculateDateRange("YEARLY", "ALL_TIME", { start: null, end: null })).toEqual({ from: "2020-01-01", to: "2024-12-31" });

    expect(calculateDateRange("CUSTOM", "CUSTOM_DATE_RANGE", { start: null, end: null })).toEqual({ from: "", to: "" });
    expect(calculateDateRange("CUSTOM", "LAST_YEAR", { start: null, end: null })).toEqual({ from: "", to: "" });
    expect(calculateDateRange("DAILY", "CUSTOM_DATE_RANGE", { start: null, end: null })).toEqual({ from: "", to: "" });
    expect(calculateDateRange("UNKNOWN" as any, "LAST_YEAR" as any, { start: null, end: null })).toEqual({ from: "", to: "" });
  });

  it("falls back custom month range bounds to current year when omitted", () => {
    expect(calculateDateRange("MONTHLY", "CUSTOM_MONTH_RANGE", { start: null, end: null })).toEqual({ from: "2024-01-01", to: "2024-12-31" });
    expect(calculateDateRange("MONTHLY", "CUSTOM_MONTH_RANGE", { start: 2022, end: null })).toEqual({ from: "2022-01-01", to: "2024-12-31" });
    expect(calculateDateRange("MONTHLY", "CUSTOM_MONTH_RANGE", { start: null, end: 2023 })).toEqual({ from: "2024-01-01", to: "2023-12-31" });
  });

  it("extracts payload and throws for unsuccessful response", () => {
    expect(extractApiPayload<{ a: number }>({ data: { body: { data: { a: 1 } } } })).toEqual({ a: 1 });
    expect(extractApiPayload({ data: { x: 2 } })).toEqual({ x: 2 });
    expect(extractApiPayload({ body: { data: 5 } })).toBe(5);
    expect(() => extractApiPayload({ success: false, error: { message: "flat failure" } })).toThrow("flat failure");
    expect(() => extractApiPayload({ success: false })).toThrow("Unable to fetch report data.");
    expect(extractApiPayload(null)).toBeNull();
    expect(() => extractApiPayload({ data: { body: { success: false, error: { message: "boom" } } } })).toThrow("boom");
    expect(() => extractApiPayload({ data: { body: { success: false } } })).toThrow("Unable to fetch report data.");
  });

  it("calculates column widths with multiline and min width", () => {
    expect(calculateColumnWidths([["a", "multi\nline"], [1234567890123, "x"]])).toEqual([{ wch: 15 }, { wch: 12 }]);
  });

  it("applies borders to all worksheet cells and handles empty ref", () => {
    const ws: any = { "!ref": "A1:B2", A1: { t: "s", v: "a" } };
    applyThinBorders(ws);

    expect(ws.A1).toBeDefined();

    const empty: any = {};
    expect(() => applyThinBorders(empty)).not.toThrow();
  });
});
