export enum OperationType {
  Created = 0,
  Updated = 1,
  Deleted = 2 
}

export interface RemoteStore {
  Read: (path: string) => Promise<Uint8Array>;
  Write: (path: string, data: Uint8Array) => Promise<void>;
  GetLastModified: (path: string) => Promise<string>;
  ReadDir: (path: string) => Promise<string[]>;
}

export class RemoteStoreClass {
  store: RemoteStore;

  lastWrite: string | null = null;

  constructor(store: RemoteStore) {
    this.store = store;
  }

  Read(path: string) {
    return this.store.Read(path);
  }

  Write(path: string, data: Uint8Array) {
    this.lastWrite = new Date().toISOString();
    return this.store.Write(path, data);
  }

  GetLastWrite() {
    return this.lastWrite;
  }

  GetLastModified(path: string) {
    return this.store.GetLastModified(path);
  }

  ReadDir(path: string) {
    return this.store.ReadDir(path);
  }
}