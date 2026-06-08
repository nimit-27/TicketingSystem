import {
  checkAccessMaster,
  checkFieldAccess,
  checkFormAccess,
  checkMyTicketsAccess,
  checkMyTicketsColumnAccess,
  checkSidebarAccess,
  checkHeaderAccess,
  getFieldChildren,
  setPermissions,
} from "../permissions";
import * as Utils from "../Utils";

jest.mock("../Utils", () => ({
  getUserPermissions: jest.fn(),
  setUserPermissions: jest.fn(),
}));

describe("utils/permissions", () => {
  const getUserPermissions = Utils.getUserPermissions as jest.Mock;
  const setUserPermissions = Utils.setUserPermissions as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("sets permissions", () => {
    setPermissions({ any: true } as any);
    expect(setUserPermissions).toHaveBeenCalledWith({ any: true });
  });

  it("checks sidebar access from config and default", () => {
    getUserPermissions.mockReturnValue({ sidebar: { children: { reports: { show: true } } } });
    expect(checkSidebarAccess("reports")).toBe(true);
    expect(checkSidebarAccess("fileManagement")).toBe(true);
    expect(checkSidebarAccess("missing")).toBe(false);
  });

  it("checks header access from top-level and nested permission flags", () => {
    getUserPermissions.mockReturnValue({
      header: {
        show: true,
        children: {
          lightDarkModeIcon: { show: true },
          translateIcon: { show: false },
          notifications: {
            show: true,
            children: { icon: { show: true }, dropdown: { show: false } },
          },
        },
      },
    });

    expect(checkHeaderAccess("lightDarkModeIcon")).toBe(true);
    expect(checkHeaderAccess("translateIcon")).toBe(false);
    expect(checkHeaderAccess(["notifications", "icon"])).toBe(true);
    expect(checkHeaderAccess("notifications.dropdown")).toBe(false);
    expect(checkHeaderAccess("missing")).toBe(false);

    getUserPermissions.mockReturnValue({
      header: {
        show: false,
        children: { lightDarkModeIcon: { show: true } },
      },
    });

    expect(checkHeaderAccess("lightDarkModeIcon")).toBe(false);
  });

  it("checks form/field and nested children access", () => {
    getUserPermissions.mockReturnValue({
      pages: {
        children: {
          users: { view: true, create: false },
          ticketForm: {
            children: {
              details: {
                children: {
                  status: { show: true, children: { opt: true } },
                },
              },
            },
          },
          myTickets: {
            children: {
              reopen: { show: true },
              table: {
                children: {
                  columns: {
                    children: { id: { show: false }, subject: {} },
                  },
                },
              },
            },
          },
          admin: { children: { tools: { show: true } } },
        },
      },
    });

    expect(checkFormAccess("users", "view")).toBe(true);
    expect(checkFormAccess("users", "create")).toBe(false);
    expect(checkFieldAccess("details", "status")).toBe(true);
    expect(checkFieldAccess("details", "missing")).toBe(false);
    expect(getFieldChildren("details", "status")).toEqual({ opt: true });

    expect(checkMyTicketsAccess("reopen")).toBe(true);
    expect(checkMyTicketsAccess("nope")).toBe(false);
    expect(checkMyTicketsColumnAccess("id")).toBe(false);
    expect(checkMyTicketsColumnAccess("subject")).toBe(true);

    expect(checkAccessMaster(["admin", "tools"])).toBe(true);
    expect(checkAccessMaster(["admin", "unknown"])).toBe(false);
  });
});
