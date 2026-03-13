import { persistLoginData, startSessionDetection } from "../session";
import * as AuthService from "../../services/AuthService";
import * as RoleService from "../../services/RoleService";
import * as Utils from "../Utils";
import * as permissions from "../permissions";

jest.mock("../../services/AuthService", () => ({
  getActiveSession: jest.fn(),
}));

jest.mock("../../services/RoleService", () => ({
  getRoleSummaries: jest.fn(),
}));

jest.mock("../Utils", () => ({
  getUserDetails: jest.fn(),
  getUserPermissions: jest.fn(),
  setRoleLookup: jest.fn(),
  setUserDetails: jest.fn(),
}));

jest.mock("../permissions", () => ({
  setPermissions: jest.fn(),
}));


const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("utils/session", () => {
  const navigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("persists login details and role summaries then navigates", async () => {
    (RoleService.getRoleSummaries as jest.Mock).mockResolvedValue({
      data: { body: { data: [{ role_id: 9, roleName: "Manager" }, { id: null, role: "bad" }] } },
    });

    await persistLoginData(
      {
        permissions: { pages: {} } as any,
        roles: ["9"],
        levels: ["L1"],
        emailID: "e@example.com",
        mobileNo: "999",
        user: { office_code: "O1", officeTypeCode: "T1", zo_code: "Z1", hrmsRegCode: "R1", do_code: "D1" },
      } as any,
      { fallbackUserId: "  user-1  ", navigate, redirectPath: "/home" },
    );

    expect(permissions.setPermissions).toHaveBeenCalled();
    expect(Utils.setUserDetails).toHaveBeenCalledWith(expect.objectContaining({
      userId: "user-1",
      username: "user-1",
      email: "e@example.com",
      phone: "999",
      officeCode: "O1",
      officeType: "T1",
      zoneCode: "Z1",
      regionCode: "R1",
      districtCode: "D1",
    }));
    expect(Utils.setRoleLookup).toHaveBeenCalledWith([{ roleId: 9, role: "Manager" }]);
    expect(navigate).toHaveBeenCalledWith("/home");
  });

  it("returns early when data or permissions are missing", async () => {
    await persistLoginData(null as any, { navigate });
    await persistLoginData({ userId: "u" } as any, { navigate });

    expect(permissions.setPermissions).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("handles role summary fetch errors but still navigates", async () => {
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    (RoleService.getRoleSummaries as jest.Mock).mockRejectedValue(new Error("fail"));

    await persistLoginData({ permissions: { sidebar: {} } } as any, { navigate });

    expect(errorSpy).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith("/");
  });

  it("startSessionDetection redirects immediately from stored session and cleans up", async () => {
    (Utils.getUserDetails as jest.Mock).mockReturnValue({ userId: "u1" });
    (Utils.getUserPermissions as jest.Mock).mockReturnValue({ pages: {} });
    (AuthService.getActiveSession as jest.Mock).mockResolvedValue({ status: 204 });

    const stop = startSessionDetection({ navigate, onActiveSession: jest.fn().mockResolvedValue(undefined) });

    expect(navigate).toHaveBeenCalledWith("/", { replace: true });
    stop();
    jest.useRealTimers();
  });

  it("invokes active session callback when api has session", async () => {
    (Utils.getUserDetails as jest.Mock).mockReturnValue(null);
    (Utils.getUserPermissions as jest.Mock).mockReturnValue(null);
    (AuthService.getActiveSession as jest.Mock).mockResolvedValue({ status: 200, data: { userId: "x" } });
    const onActiveSession = jest.fn().mockResolvedValue(undefined);

    const stop = startSessionDetection({ navigate, onActiveSession, onSessionAbsent: jest.fn() });
    await flushPromises();

    expect(onActiveSession).toHaveBeenCalledWith({ userId: "x" });
    stop();
    jest.useRealTimers();
  });

  it("calls onSessionAbsent for missing/failed api if unresolved", async () => {
    const onSessionAbsent = jest.fn();
    const errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});

    (Utils.getUserDetails as jest.Mock).mockReturnValue(null);
    (Utils.getUserPermissions as jest.Mock).mockReturnValue(null);
    (AuthService.getActiveSession as jest.Mock).mockResolvedValueOnce({ status: 204, data: null });

    const stop1 = startSessionDetection({ navigate, onActiveSession: jest.fn(), onSessionAbsent });
    await flushPromises();
    expect(onSessionAbsent).toHaveBeenCalledTimes(1);
    stop1();

    (AuthService.getActiveSession as jest.Mock).mockRejectedValueOnce(new Error("boom"));
    const stop2 = startSessionDetection({ navigate, onActiveSession: jest.fn(), onSessionAbsent });
    await flushPromises();

    expect(errorSpy).toHaveBeenCalled();
    expect(onSessionAbsent).toHaveBeenCalledTimes(2);
    stop2();
  });

  it("reacts to interval/storage updates to resolve session", () => {
    jest.useFakeTimers();
    (Utils.getUserDetails as jest.Mock)
      .mockReturnValueOnce(null)
      .mockReturnValue({ userId: "later" });
    (Utils.getUserPermissions as jest.Mock)
      .mockReturnValueOnce(null)
      .mockReturnValue({ p: true });
    (AuthService.getActiveSession as jest.Mock).mockResolvedValue({ status: 204, data: null });

    const stop = startSessionDetection({ navigate, onActiveSession: jest.fn(), onSessionAbsent: jest.fn(), redirectPath: "/dash" });

    jest.advanceTimersByTime(1000);
    window.dispatchEvent(new StorageEvent("storage"));

    expect(navigate).toHaveBeenCalledWith("/dash", { replace: true });
    stop();
    jest.useRealTimers();
  });
});
