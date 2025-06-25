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

function sendMessage<T>(action: string, key?: string, value?: any): Promise<T> {
  const requestId = generateRequestId();
  return new Promise((resolve) => {
    const handler = (event: MessageEvent) => {
      if (event.data?.requestId === requestId && event.data.api === 'LocalStorage:Response') {
        window.removeEventListener('message', handler);

        resolve(event.data.result);
      }
    };
    window.addEventListener('message', handler);

    window.postMessage({
      api: 'LocalStorage',
      action,
      key,
      value,
      requestId
    });
  });
}
const prefix = 'havenStorage:Ext';
// eslint-disable-next-line no-unused-vars
export const havenStorageExt: HavenStorage = {
  getItem: function (key: string): Promise<string | null> {
    console.log(`${prefix}:getItem:key`, key);
    return sendMessage('getItem', key);
  },

  setItem: function (key: string, value: any): Promise<void> {
    console.log(`${prefix}:setItem:key`, key);
    return sendMessage('setItem', key, value);
  },

  delete: function (key: string): Promise<void> {
    console.log(`${prefix}:delete:key`, key);
    return sendMessage('removeItem', key);
  },

  clear: function (): Promise<void> {
    console.log(`${prefix}:clear`);
    return sendMessage('clear');
  },

  keys: function (): Promise<string[]> {
    console.log(`${prefix}:keys`);
    return sendMessage('keys');
  },

  key: function (index: number): Promise<string | null> {
    console.log(`${prefix}:key`, index);
    // This string is used in go to compare the error
    return Promise.reject(new Error('not implemented'));
  }
};
