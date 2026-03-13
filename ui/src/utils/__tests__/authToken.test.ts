import {
  clearDecodedCache,
  clearStoredToken,
  getActiveToken,
  getDecodedAuthDetails,
  isJwtBypassEnabled,
  setJwtBypassEnabled,
  storeToken,
  toggleJwtBypass,
} from "../authToken";

describe("utils/authToken", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it("returns null for disabled token storage/decode helpers", () => {
    storeToken("abc");
    expect(getActiveToken()).toBeNull();
    expect(getDecodedAuthDetails()).toBeNull();
    clearStoredToken();
    clearDecodedCache();
  });

  it("toggles jwt bypass flag", () => {
    expect(isJwtBypassEnabled()).toBe(false);
    setJwtBypassEnabled(true);
    expect(isJwtBypassEnabled()).toBe(true);
    expect(toggleJwtBypass()).toBe(false);
    expect(isJwtBypassEnabled()).toBe(false);
  });
});
