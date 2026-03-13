import { buildApiDateParams, ensureCustomPreset, getPresetDateRange } from "../dateUtils";

describe("utils/dateUtils", () => {
  const now = new Date("2024-06-15T12:00:00Z");

  it("returns undefined for ALL and CUSTOM presets", () => {
    expect(getPresetDateRange("ALL", now)).toBeUndefined();
    expect(getPresetDateRange("CUSTOM", now)).toBeUndefined();
  });

  it("calculates date ranges for supported presets", () => {
    expect(getPresetDateRange("LAST_1_DAY", now)).toEqual({ fromDate: "2024-06-14", toDate: "2024-06-15" });
    expect(getPresetDateRange("LAST_1_WEEK", now)).toEqual({ fromDate: "2024-06-08", toDate: "2024-06-15" });
    expect(getPresetDateRange("LAST_1_MONTH", now)).toEqual({ fromDate: "2024-05-15", toDate: "2024-06-15" });
    expect(getPresetDateRange("LAST_1_YEAR", now)).toEqual({ fromDate: "2023-06-15", toDate: "2024-06-15" });
  });

  it("builds api params from state", () => {
    expect(buildApiDateParams(undefined)).toEqual({});
    expect(buildApiDateParams({ preset: "ALL" })).toEqual({});
    expect(buildApiDateParams({ preset: "CUSTOM", fromDate: "2024-01-01", toDate: "2024-01-02" })).toEqual({
      fromDate: "2024-01-01T00:00:00",
      toDate: "2024-01-02T23:59:59",
    });
  });

  it("forces preset to custom and merges date values", () => {
    const state = { preset: "LAST_1_DAY" as const, fromDate: "2024-01-01", toDate: "2024-01-02" };
    expect(ensureCustomPreset(state, { fromDate: "2024-02-01" })).toEqual({
      preset: "CUSTOM",
      fromDate: "2024-02-01",
      toDate: "2024-01-02",
    });
  });
});
