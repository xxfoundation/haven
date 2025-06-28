export type HavenStorage = {
  getItem: (key: string, callback: (value: string | null) => void) => void;
  setItem: (key: string, value: any, callback: () => void) => void;
  delete: (key: string) => void;
  clear: () => void;
  keys: (callback: (keys: string[]) => void) => void;
  key: (index: number, callback: (key: string | null) => void) => void;
};

function generateRequestId(): string {
  return Math.random().toString(36).slice(2, 11);
}

const handlers: Record<string, (result: any) => void> = {};

// 1️⃣ establish a long-lived Port to your extension and auto-reconnect on disconnect
const EXT_ID = 'knjemccepbogcmlhnhffagneinknidic';
let port: chrome.runtime.Port;

function setupPort() {
  port = chrome.runtime.connect(EXT_ID, { name: 'LocalStorageChannel' });

  // incoming responses on that port
  port.onMessage.addListener((msg: any) => {
    if (msg?.requestId && msg.api === 'LocalStorage:Response') {
      const cb = handlers[msg.requestId];
      if (cb) cb(msg.result);
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
  action: string,
  callback?: (result: T) => void,
  key?: string,
  value?: any
): void {
  const requestId = generateRequestId();
  if (callback) handlers[requestId] = callback;

  try {
    port.postMessage({ api: 'LocalStorage', action, key, value, requestId });
  } catch (err) {
    console.error('postMessage failed, reconnecting port', err);
    setupPort();
    // retry once after reconnect
    port.postMessage({ api: 'LocalStorage', action, key, value, requestId });
  }
}

export const havenStorageExt: HavenStorage = {
  getItem(key, callback) {
    sendViaPort<string | null>('getItem', callback, key);
  },
  setItem(key, value, callback) {
    sendViaPort<void>('setItem', callback, key, value);
  },
  delete(key) {
    sendViaPort<void>('removeItem', undefined, key);
  },
  clear() {
    sendViaPort<void>('clear');
  },
  keys(callback) {
    sendViaPort<string[]>('keys', callback);
  },
  key(_idx, callback) {
    // not implemented on SW side
    callback(null);
  }
};
