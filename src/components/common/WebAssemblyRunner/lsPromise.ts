export type HavenStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: any) => Promise<void>;
  delete: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  keys: () => Promise<string[]>;
  key: (index: number) => Promise<string | null>;
};

const prefixLS = 'havenStorage:LS';

export const havenStorageLS: HavenStorage = {
  getItem: function (key: string): Promise<string | null> {
    console.log(`${prefixLS}:getItem:key`, key);
    return Promise.resolve(localStorage.getItem(key) ?? null);
  },

  setItem: function (key: string, value: any): Promise<void> {
    console.log(`${prefixLS}:setItem:key`, key);
    localStorage.setItem(key, value);
    return Promise.resolve();
  },

  delete: function (key: string): Promise<void> {
    console.log(`${prefixLS}:delete:key`, key);
    localStorage.removeItem(key);
    return Promise.resolve();
  },

  clear: function (): Promise<void> {
    console.log(`${prefixLS}:clear`);
    localStorage.clear();
    return Promise.resolve();
  },

  keys: function (): Promise<string[]> {
    console.log(`${prefixLS}:keys`);
    return Promise.resolve(Object.keys(localStorage));
  },

  key: function (index: number): Promise<string | null> {
    console.log(`${prefixLS}:key:index`, index);
    return Promise.resolve(Object.keys(localStorage)[index] || null);
  }
};
