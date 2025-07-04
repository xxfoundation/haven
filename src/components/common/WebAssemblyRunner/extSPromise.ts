export type HavenStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: any) => Promise<void>;
  delete: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  keys: () => Promise<string[]>;
  key: (index: number) => Promise<string | null>;
};

// type from Extension
type Message<T extends string> = {
  api: T;
  requestId: string;
};

type BaseLocalStorageRequest = Message<'LocalStorage:Request'>;

export type TRequest =
  | (BaseLocalStorageRequest & {
      action: 'clear' | 'keys';
    })
  | (BaseLocalStorageRequest & {
      action: 'getItem' | 'removeItem';
      key: string;
    })
  | (BaseLocalStorageRequest & {
      action: 'setItem';
      key: string;
      value: string;
    });

type BaseLocalStorageResponse = Message<'LocalStorage:Response'>;

export type TResponse =
  | (BaseLocalStorageResponse & {
      action: 'getItem';
      result: unknown;
    })
  | (BaseLocalStorageResponse & {
      action: 'keys';
      result: string[];
    })
  | (BaseLocalStorageResponse & {
      action: 'removeItem' | 'clear' | 'setItem';
    });

function generateRequestId(): string {
  return Math.random().toString(36).slice(2, 11);
}

const promiseHandlers: Record<
  string,
  { resolve: (result: any) => void; reject: (error: any) => void }
> = {};

// 1️⃣ establish a long-lived Port to your extension and auto-reconnect on disconnect
const EXT_ID = 'knjemccepbogcmlhnhffagneinknidic';
let port: chrome.runtime.Port;

function isValidResponse(msg: any): msg is TResponse {
  return msg?.requestId && msg.api === 'LocalStorage:Response';
}

function setupPort() {
  port = chrome.runtime.connect(EXT_ID, { name: 'LocalStorageChannel' });

  // incoming responses on that port
  port.onMessage.addListener((msg: any) => {
    if (msg?.requestId && msg.api === 'LocalStorage:Response') {
      const handler = promiseHandlers[msg.requestId];

      if (handler && isValidResponse(msg)) {
        handler.resolve('result' in msg ? msg.result : undefined);
        delete promiseHandlers[msg.requestId];
      }
    }
  });

  // reconnect on disconnect
  port.onDisconnect.addListener(() => {
    console.warn('Port disconnected, reconnecting…');
    setTimeout(setupPort, 1000);
  });
}

// initialize the port
setupPort();

function sendViaPort<T>(action: 'clear' | 'keys'): Promise<T>;
function sendViaPort<T>(action: 'getItem' | 'removeItem', key: string): Promise<T>;
function sendViaPort<T>(action: 'setItem', key: string, value: any): Promise<T>;
function sendViaPort<T>(
  action: 'getItem' | 'setItem' | 'removeItem' | 'clear' | 'keys',
  key?: string,
  value?: any
): Promise<T> {
  const requestId = generateRequestId();

  return new Promise<T>((resolve, reject) => {
    promiseHandlers[requestId] = { resolve, reject };
    let request: TRequest;

    if (action === 'clear' || action === 'keys') {
      // no key/value
      request = { api: 'LocalStorage:Request', action, requestId };
    } else if (action === 'getItem' || action === 'removeItem') {
      // key is required here
      request = { api: 'LocalStorage:Request', action, key: key!, requestId };
    } else if (action === 'setItem') {
      // setItem: both key and value are required
      request = { api: 'LocalStorage:Request', action, key: key!, value: value!, requestId };
    } else {
      throw new Error(`Unknown action: ${action}`);
    }
    try {
      port.postMessage(request);
    } catch (err) {
      console.error('postMessage failed, reconnecting port', err);
      setupPort();
      // retry once after reconnect
      try {
        port.postMessage({ api: 'LocalStorage:Request', action, key, value, requestId });
      } catch (retryErr) {
        delete promiseHandlers[requestId];
        reject(retryErr);
      }
    }
  });
}

export const havenStorageExt: HavenStorage = {
  getItem(key) {
    return sendViaPort<string | null>('getItem', key);
  },
  setItem(key, value) {
    return sendViaPort<void>('setItem', key, value);
  },
  delete(key) {
    return sendViaPort<void>('removeItem', key);
  },
  clear() {
    return sendViaPort<void>('clear');
  },
  keys() {
    return sendViaPort<string[]>('keys');
  },
  key(_idx) {
    // not implemented on SW side
    return Promise.reject('not implemented');
  }
};
