const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const defaultMatchPath = (
  options: { path: string; end?: boolean },
  pathname: string
): Record<string, unknown> | null => {
  const { path, end = true } = options;
  const pattern = path
    .split('/')
    .map(segment => (segment.startsWith(':') ? '[^/]+' : escapeRegex(segment)))
    .join('/');
  const regex = new RegExp(`^${pattern}${end ? '$' : ''}`);
  return regex.test(pathname) ? { params: {} } : null;
};

export const useNavigate = jest.fn();
export const useLocation = jest.fn();
export const matchPath = jest.fn(defaultMatchPath);

export default {
  useNavigate,
  useLocation,
  matchPath,
};
