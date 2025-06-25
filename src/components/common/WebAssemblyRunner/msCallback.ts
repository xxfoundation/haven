export type HavenStorage = {
  getItem: (key: string, callback: (value: string | null) => void) => void;
  setItem: (key: string, value: any, callback: () => void) => void;
  delete: (key: string) => void;
  clear: () => void;
  keys: (callback: (keys: string[]) => void) => void;
  key: (index: number, callback: (key: string | null) => void) => void;
};

let memoryStorage: Record<string, string | undefined> = {};
const prefix = 'havenStorage:M';

export const havenStorageMemory: HavenStorage = {
  getItem: function (key: string, callback: (value: string | null) => void): void {
    // console.log(`${prefix}:getItem:key`, key);
    callback(memoryStorage[key] ?? null);
  },

  setItem: function (key: string, value: any, callback: () => void): void {
    // console.log(`${prefix}:setItem:key`, key);
    memoryStorage[key] = String(value);
    callback();
  },

  delete: function (key: string): void {
    // console.log(`${prefix}:delete:key`, key);
    delete memoryStorage[key];
  },

  clear: function (): void {
    // console.log(`${prefix}:clear`);
    memoryStorage = {};
  },

  keys: function (callback: (keys: string[]) => void): void {
    // console.log(`${prefix}:keys`);
    callback(Object.keys(memoryStorage));
  },

  key: function (index: number, callback: (key: string | null) => void): void {
    // console.log(`${prefix}:key:index`, index);
    callback(Object.keys(memoryStorage)[index] || null);
  }
};
