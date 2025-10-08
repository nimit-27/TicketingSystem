const requestHandlers: Array<(config: any) => any> = [];
const responseHandlers: Array<{ fulfilled?: (value: any) => any; rejected?: (error: any) => any }> = [];

const createDefaultMock = () => jest.fn(() => Promise.resolve({}));

const axiosMock: any = {
  get: createDefaultMock(),
  post: createDefaultMock(),
  put: createDefaultMock(),
  delete: createDefaultMock(),
  defaults: {
    baseURL: "",
    withCredentials: false,
  },
  interceptors: {
    request: {
      use: jest.fn((handler: (config: any) => any) => {
        requestHandlers.push(handler);
        return handler;
      }),
    },
    response: {
      use: jest.fn((fulfilled?: (value: any) => any, rejected?: (error: any) => any) => {
        responseHandlers.push({ fulfilled, rejected });
        return { fulfilled, rejected };
      }),
    },
  },
  create: jest.fn(() => axiosMock),
  __runRequestInterceptors: async (config: any) => {
    let updated = config;
    for (const handler of requestHandlers) {
      updated = await handler(updated);
    }
    return updated;
  },
  __runResponseFulfilled: async (response: any) => {
    let updated = response;
    for (const { fulfilled } of responseHandlers) {
      if (fulfilled) {
        updated = await fulfilled(updated);
      }
    }
    return updated;
  },
  __runResponseRejected: async (error: any) => {
    let current = error;
    for (const { rejected } of responseHandlers) {
      if (rejected) {
        try {
          current = await rejected(current);
        } catch (err) {
          current = err;
        }
      }
    }
    return current;
  },
  __resetHandlers: () => {
    requestHandlers.splice(0, requestHandlers.length);
    responseHandlers.splice(0, responseHandlers.length);
  },
};

export default axiosMock;
