import { getBreachIndicatorColor } from "../SlaManagementTable";

describe("getBreachIndicatorColor", () => {
  it("uses bright red for the range nearest to breach", () => {
    expect(getBreachIndicatorColor(-5, 100)).toBe("rgb(255, 0, 0)");
    expect(getBreachIndicatorColor(12, 100)).toBe("rgb(255, 0, 0)");
  });

  it("uses progressively lighter colors across ten ranges", () => {
    expect(getBreachIndicatorColor(-15, 100)).toBe("rgb(255, 28, 28)");
    expect(getBreachIndicatorColor(-55, 100)).toBe("rgb(255, 142, 142)");
    expect(getBreachIndicatorColor(-95, 100)).toBe("rgb(255, 255, 255)");
    expect(getBreachIndicatorColor(-100, 100)).toBe("rgb(255, 255, 255)");
  });

  it("falls back to white when no configured maximum is available", () => {
    expect(getBreachIndicatorColor(-5, 0)).toBe("rgb(255, 255, 255)");
  });
});
