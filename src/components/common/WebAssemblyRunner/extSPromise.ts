export type HavenStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: any) => Promise<void>;
  delete: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  keys: () => Promise<string[]>;
  key: (index: number) => Promise<string | null>;
};

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

function setupPort() {
  port = chrome.runtime.connect(EXT_ID, { name: 'LocalStorageChannel' });

  // incoming responses on that port
  port.onMessage.addListener((msg: any) => {
    if (msg?.requestId && msg.api === 'LocalStorage:Response') {
      const handler = promiseHandlers[msg.requestId];

      if (handler) {
        handler.resolve(msg.result);
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

function sendViaPort<T>(
  action: 'getItem' | 'setItem' | 'removeItem' | 'clear' | 'keys',
  key?: string,
  value?: any
): Promise<T> {
  const requestId = generateRequestId();

  return new Promise<T>((resolve, reject) => {
    promiseHandlers[requestId] = { resolve, reject };

    try {
      port.postMessage({ api: 'LocalStorage', action, key, value, requestId });
    } catch (err) {
      console.error('postMessage failed, reconnecting port', err);
      setupPort();
      // retry once after reconnect
      try {
        port.postMessage({ api: 'LocalStorage', action, key, value, requestId });
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
