import { HavenStorage } from './type';

export const havenStorageLocal: HavenStorage = {
  async getItem(key) {
    return localStorage.getItem(key);
  },

  async setItem(key, value) {
    localStorage.setItem(key, value);
  },

  async delete(key) {
    localStorage.removeItem(key);
  },

  async clear() {
    localStorage.clear();
  },

  async keys() {
    const keys: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key !== null) {
        keys.push(key);
      }
    }

    return keys;
  },

  key(index) {
    return new Promise((resolve, reject) => {
      try {
        const key = localStorage.key(index);
        resolve(key);
      } catch (err) {
        reject(err);
      }
    });
  }
};
