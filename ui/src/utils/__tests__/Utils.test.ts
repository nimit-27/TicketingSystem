import { logout } from "../Utils";
import { logoutUser } from "../../services/AuthService";
import { clearStoredToken } from "../authToken";

jest.mock("../../services/AuthService", () => ({
  logoutUser: jest.fn().mockResolvedValue(undefined),
}));

jest.mock("../authToken", () => ({
  clearStoredToken: jest.fn(),
}));

describe("logout", () => {
  const originalPublicUrl = process.env.PUBLIC_URL;
  const originalLocation = window.location;

  beforeEach(() => {
    jest.clearAllMocks();

    delete (window as any).location;
    (window as any).location = {
      assign: jest.fn(),
    } as unknown as Location;
  });

  afterAll(() => {
    process.env.PUBLIC_URL = originalPublicUrl;
    window.location = originalLocation;
  });

  it("redirects to login within the app base path", async () => {
    process.env.PUBLIC_URL = "/helpdesk";

    await logout();

    expect(logoutUser).toHaveBeenCalled();
    expect(clearStoredToken).toHaveBeenCalled();
    expect(window.location.assign).toHaveBeenCalledWith("/helpdesk/login");
  });
});
