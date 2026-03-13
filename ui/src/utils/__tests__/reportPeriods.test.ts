import { REPORT_PERIODS, calculatePeriodRange, getPeriodLabel } from "../reportPeriods";

describe("utils/reportPeriods", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-08-15T12:00:00Z"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("has configured periods and labels", () => {
    expect(REPORT_PERIODS).toHaveLength(5);
    expect(getPeriodLabel("weekly")).toBe("Weekly");
    expect(getPeriodLabel("half-yearly")).toBe("Half-Yearly");
  });

  it("falls back to the raw value for unknown labels", () => {
    expect(getPeriodLabel("custom" as any)).toBe("custom");
  });

  it("calculates period ranges", () => {
    expect(calculatePeriodRange("daily").startDate.toISOString()).toContain("2024-08-15T00:00:00.000Z");
    expect(calculatePeriodRange("weekly").startDate.toISOString()).toContain("2024-08-09T00:00:00.000Z");
    expect(calculatePeriodRange("monthly").startDate.toISOString()).toContain("2024-07-15T00:00:00.000Z");
    expect(calculatePeriodRange("quarterly").startDate.toISOString()).toContain("2024-05-15T00:00:00.000Z");
    expect(calculatePeriodRange("half-yearly").startDate.toISOString()).toContain("2024-02-15T00:00:00.000Z");

    const dailyRange = calculatePeriodRange("daily");
    expect(dailyRange.endDate.toISOString()).toContain("2024-08-15T12:00:00.000Z");
    expect(dailyRange.startDate.getHours()).toBe(0);
    expect(dailyRange.startDate.getMinutes()).toBe(0);
    expect(dailyRange.startDate.getSeconds()).toBe(0);
    expect(dailyRange.startDate.getMilliseconds()).toBe(0);
  });
});
