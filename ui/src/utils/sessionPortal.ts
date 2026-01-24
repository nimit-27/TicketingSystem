const PORTAL_KEY = "loginPortal";

export const setLastLoginPortal = (portal: string) => {
  if (!portal) {
    return;
  }
  sessionStorage.setItem(PORTAL_KEY, portal);
};

export const getLastLoginPortal = () => sessionStorage.getItem(PORTAL_KEY) || "requestor";
