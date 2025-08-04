import { HavenStorage } from './type';

// type from Extension
type BaseMessage<Api extends string> = {
  api: Api;
  requestId: string;
};

export type TRequest = BaseMessage<'LocalStorage:Request'> &
  (
    | {
        action: 'clear' | 'keys';
      }
    | {
        action: 'getItem' | 'removeItem';
        key: string;
      }
    | {
        action: 'setItem';
        key: string;
        value: string;
      }
  );

export type TResponse = BaseMessage<'LocalStorage:Response'> &
  (
    | {
        action: 'getItem';
        result: unknown;
      }
    | {
        action: 'keys';
        result: string[];
      }
    | {
        action: 'removeItem' | 'clear' | 'setItem';
      }
  );

function generateRequestId(): string {
  return Math.random().toString(36).slice(2, 11);
}

const promiseHandlers: Record<
  string,
  { resolve: (result: any) => void; reject: (error: any) => void }
> = {};

// establish a long-lived Port to extension
const EXT_ID = 'knjemccepbogcmlhnhffagneinknidic';
let port: chrome.runtime.Port;

function isValidResponse(msg: any): msg is TResponse {
  return msg?.requestId && msg.api === 'LocalStorage:Response';
}

let status: 'disconnected' | 'not-installed' | 'ok' = 'disconnected';
function setupPort(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    port = chrome.runtime.connect(EXT_ID, { name: 'LocalStorageChannel' });

    let settled = false;
    // incoming responses on that port
    port.onMessage.addListener((msg) => {
      // we want to settle only once
      if (!settled) {
        settled = true;
        resolve(true);
      }

      if (msg?.requestId && msg.api === 'LocalStorage:Response') {
        const handler = promiseHandlers[msg.requestId];

        if (handler && isValidResponse(msg)) {
          handler.resolve('result' in msg ? msg.result : undefined);
          delete promiseHandlers[msg.requestId];
        }
      }
    });

    port.onDisconnect.addListener(() => {
      if (chrome.runtime.lastError) {
        if (
          chrome.runtime.lastError.message ===
          'Could not establish connection. Receiving end does not exist.'
        ) {
          status = 'not-installed';
          resolve(false);
        } else {
          status = 'disconnected';
          reject(chrome.runtime.lastError);
        }
      }
    });

    // send message to check if extension is responding to request
    port.postMessage({
      api: 'LocalStorage:Request',
      action: 'getItem',
      key: 'hello',
      requestId: 'init'
    } satisfies TRequest);
  });
}

function sendViaPort<T>(action: 'clear' | 'keys'): Promise<T>;
function sendViaPort<T>(action: 'getItem' | 'removeItem', key: string): Promise<T>;
function sendViaPort<T>(action: 'setItem', key: string, value: any): Promise<T>;
function sendViaPort<T>(
  action: 'getItem' | 'setItem' | 'removeItem' | 'clear' | 'keys',
  key?: string,
  value?: any
): Promise<T> {
  const requestId = generateRequestId();

  return new Promise<T>(async (resolve, reject) => {
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

    // ports get disconnected after inactivity
    if (status === 'disconnected') {
      await setupPort();
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

export const havenStorageExtension = {
  getItem(key) {
    return sendViaPort('getItem', key);
  },
  setItem(key, value) {
    return sendViaPort('setItem', key, value);
  },
  delete(key) {
    return sendViaPort('removeItem', key);
  },
  clear() {
    return sendViaPort('clear');
  },
  keys() {
    return sendViaPort('keys');
  },
  key(_idx) {
    // not implemented on SW side
    return Promise.reject('not implemented');
  },
  isAvailable() {
    return true;
  },
  init() {
    return setupPort();
  }
} satisfies HavenStorage;
