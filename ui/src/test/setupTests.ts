import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

if (typeof global.TextEncoder === 'undefined') {
  // @ts-ignore
  global.TextEncoder = TextEncoder;
}
if (typeof global.TextDecoder === 'undefined') {
  // @ts-ignore
  global.TextDecoder = TextDecoder as typeof global.TextDecoder;
}

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { TransformStream, ReadableStream, WritableStream } = require('stream/web');
if (typeof global.TransformStream === 'undefined') {
  // @ts-ignore
  global.TransformStream = TransformStream;
}
if (typeof global.ReadableStream === 'undefined') {
  // @ts-ignore
  global.ReadableStream = ReadableStream;
}
if (typeof global.WritableStream === 'undefined') {
  // @ts-ignore
  global.WritableStream = WritableStream;
}

jest.mock('msw', () => ({
  http: {
    get: (...args: unknown[]) => ({ method: 'GET', args }),
    post: (...args: unknown[]) => ({ method: 'POST', args }),
  },
  HttpResponse: {
    json: (body: unknown) => body,
  },
}), { virtual: true });

jest.mock('msw/node', () => {
  const listeners = {
    listen: jest.fn(),
    resetHandlers: jest.fn(),
    close: jest.fn(),
  };
  return {
    setupServer: () => listeners,
  };
}, { virtual: true });

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { setupServer } = require('msw/node');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { handlers } = require('./msw/handlers');

export const server = setupServer(...handlers);

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
