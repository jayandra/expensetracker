type ErrorHandler = (error: any) => void;

let handlers: Set<ErrorHandler> = new Set();

export const onError = (handler: ErrorHandler) => {
  handlers.add(handler);
};

export const offError = (handler: ErrorHandler) => {
  handlers.delete(handler);
};

export const emitError = (error: any) => {
  handlers.forEach((h) => {
    try {
      h(error);
    } catch (_) {
      // no-op to isolate consumer errors
    }
  });
};

export default { onError, offError, emitError };
