import * as Utils from "../Utils";
import * as AuthService from "../../services/AuthService";
import i18n from "../../i18n";

jest.mock("../../services/AuthService", () => ({
  logoutUser: jest.fn(),
}));

jest.mock("../../services/StatusService", () => ({
  getStatusListFromApi: jest.fn(),
}));

jest.mock("../../config/config", () => ({
  getCurrentUserDetails: jest.fn(),
}));

jest.mock("../authToken", () => ({
  clearStoredToken: jest.fn(),
  getDecodedAuthDetails: jest.fn(),
  isJwtBypassEnabled: jest.fn(),
}));

describe("utils/Utils", () => {
  const originalPublicUrl = process.env.PUBLIC_URL;
  const originalLocation = window.location;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();

    delete (window as any).location;
    (window as any).location = { assign: jest.fn() } as unknown as Location;
  });

  afterAll(() => {
    process.env.PUBLIC_URL = originalPublicUrl;
    window.location = originalLocation;
  });

  it("sets and gets user details with legacy region/zone/district fallback", () => {
    localStorage.setItem(
      "userDetails",
      JSON.stringify({ userId: "1", zo_code: "Z1", roCode: "R1", doCode: "D1" }),
    );

    expect(Utils.getUserDetails()).toEqual(expect.objectContaining({ zoneCode: "Z1", regionCode: "R1", districtCode: "D1" }));
  });

  it("returns null when user details/permissions/role lookup/status list are missing", () => {
    expect(Utils.getUserDetails()).toBeNull();
    expect(Utils.getUserPermissions()).toBeNull();
    expect(Utils.getRoleLookup()).toBeNull();
    expect(Utils.getStatusList()).toBeNull();
  });

  it("sets and clears session data", () => {
    Utils.setUserDetails({ userId: "u1", username: "u" } as any);
    Utils.setUserPermissions({ x: true });
    Utils.setRoleLookup([{ roleId: 1, role: "Admin" }]);
    Utils.setStatusList([{ statusId: "S1", statusName: "Open" }]);

    Utils.clearSession();

    expect(localStorage.getItem("userDetails")).toBeNull();
    expect(localStorage.getItem("userPermissions")).toBeNull();
    expect(localStorage.getItem("roleLookup")).toBeNull();
    expect(localStorage.getItem("statusList")).toBeNull();
  });

  it("returns display roles based on current user role ids", async () => {
    localStorage.setItem("roleLookup", JSON.stringify([{ roleId: 1, role: "Admin" }, { roleId: 2, role: "User" }]));

    jest.isolateModules(() => {
      const config = require("../../config/config");
      config.getCurrentUserDetails.mockReturnValue({ role: ["2"] });
      const isolatedUtils = require("../Utils");
      expect(isolatedUtils.getDisplayRoles()).toEqual([{ roleId: 2, role: "User" }]);
    });
  });

  it("returns empty display roles when user has no roles", () => {
    jest.isolateModules(() => {
      const config = require("../../config/config");
      config.getCurrentUserDetails.mockReturnValue({ role: [] });
      const isolatedUtils = require("../Utils");
      expect(isolatedUtils.getDisplayRoles()).toEqual([]);
    });
  });

  it("gets status name/color by id", () => {
    Utils.setStatusList([{ statusId: "S1", statusName: "Open", color: "green" }]);
    expect(Utils.getStatusNameById("S1")).toBe("Open");
    expect(Utils.getStatusNameById("S9")).toBeUndefined();
    expect(Utils.getStatusColorById("S1")).toBe("green");
    expect(Utils.getStatusColorById("S9")).toBeNull();
  });

  it("loads statuses from storage cache first", async () => {
    const api = require("../../services/StatusService");
    Utils.setStatusList([{ statusId: "S2" }]);
    const statuses = await Utils.getStatuses();
    expect(statuses).toEqual([{ statusId: "S2" }]);
    expect(api.getStatusListFromApi).not.toHaveBeenCalled();
  });

  it("loads statuses from api and memoizes list", async () => {
    const api = require("../../services/StatusService");
    api.getStatusListFromApi.mockResolvedValue({ data: { body: { data: [{ statusId: "S3" }] } } });

    Utils.clearSession();
    const first = await Utils.getStatuses();
    const second = await Utils.getStatuses();

    expect(first).toEqual([{ statusId: "S3" }]);
    expect(second).toEqual([{ statusId: "S3" }]);
    expect(api.getStatusListFromApi).toHaveBeenCalledTimes(1);
  });

  it("supports nested/non-array api payload fallback", async () => {
    const api = require("../../services/StatusService");
    api.getStatusListFromApi.mockResolvedValue({ data: { body: { data: "invalid" } } });

    Utils.clearSession();
    expect(await Utils.getStatuses()).toEqual([]);
  });

  it("truncates with and without ellipsis", () => {
    expect(Utils.truncateWithEllipsis("hello", 3)).toBe("hel...");
    expect(Utils.truncateWithEllipsis("hi", 3)).toBe("hi");
    expect(Utils.truncateWithEllipsis("", 3)).toBe("");
  });

  it("truncates with leading ellipsis and handles negative max", () => {
    expect(Utils.truncateWithLeadingEllipsis("abcdef", 3)).toBe("...def");
    expect(Utils.truncateWithLeadingEllipsis("ab", 5)).toBe("ab");
    expect(Utils.truncateWithLeadingEllipsis("abcdef", -1)).toBe("...abcdef");
  });

  it("formats date with hindi locale and english suffixes", () => {
    const originalLang = (i18n as any).language;
    (i18n as any).language = "hi";
    expect(Utils.formatDateWithSuffix(new Date("2024-01-01"))).toContain("2024");

    (i18n as any).language = "en";
    expect(Utils.formatDateWithSuffix(new Date("2024-01-01"))).toContain("1st");
    expect(Utils.formatDateWithSuffix(new Date("2024-01-02"))).toContain("2nd");
    expect(Utils.formatDateWithSuffix(new Date("2024-01-03"))).toContain("3rd");
    expect(Utils.formatDateWithSuffix(new Date("2024-01-11"))).toContain("11th");
    (i18n as any).language = originalLang;
  });

  it("formats date to day month year and handles invalid date", () => {
    expect(Utils.formatDateToDayMonthYear("2024-01-01")).toMatch(/01\s\w+\s2024/);
    expect(Utils.formatDateToDayMonthYear("bad-date")).toBe("");
  });

  it("logout redirects to login path on success", async () => {
    process.env.PUBLIC_URL = "/helpdesk";
    (AuthService.logoutUser as jest.Mock).mockResolvedValue({ data: { body: { success: true } } });

    Utils.logout();
    await Promise.resolve();

    expect(AuthService.logoutUser).toHaveBeenCalled();
    expect(window.location.assign).toHaveBeenCalledWith("/helpdesk/login");
  });

  it("logout handles unsuccessful response and rejected request", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    (AuthService.logoutUser as jest.Mock).mockResolvedValueOnce({ data: { body: { success: false } } });
    Utils.logout();
    await Promise.resolve();

    (AuthService.logoutUser as jest.Mock).mockRejectedValueOnce(new Error("network"));
    Utils.logout();
    await Promise.resolve();

    expect(warnSpy).toHaveBeenCalled();
  });

  it("builds dropdown options with and without extra option", () => {
    const items = [{ name: "A", id: 1 }];
    expect(Utils.getDropdownOptions(items, "name", "id")).toEqual([{ label: "A", value: 1 }]);
    expect(Utils.getDropdownOptions(null, "name", "id")).toEqual([]);

    const extra = { label: "All", value: "ALL" };
    expect(Utils.getDropdownOptionsWithExtraOption(items, "name", "id", extra as any)).toEqual([
      extra,
      { label: "A", value: 1 },
    ]);
    expect(Utils.getDropdownOptionsWithExtraOption(items, "name", "id", null as any)).toEqual([
      { label: "A", value: 1 },
    ]);
  });
});
