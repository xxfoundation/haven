export enum OperationType {
  Created = 0,
  Updated = 1,
  Deleted = 2 
}

export type KVEntry = {
  Version: number;
  Timestamp: string;
  Data: string;
}

type KeyChangedByRemoteCallback = (
  key: string,
  oldEntry: Uint8Array,
  newEntry: Uint8Array,
  operationType: OperationType
) => void;

export const KV_VERSION = 0;

export type RemoteKV = {
  Get: (key: string, version: number) => Promise<KVEntry>;
  Delete: (key: string, version: number) => Promise<void>;
  Set: (key: string, encodedKVMapEntry: Uint8Array) => Promise<void>;
  ListenOnRemoteKey: (key: string, version: number, onChange: KeyChangedByRemoteCallback) => Promise<void>
}

export interface RemoteStoreServiceWrapper {
  Read: (path: string) => Promise<Uint8Array>;
  Write: (path: string, data: Uint8Array) => Promise<void>;
  GetLastModified: (path: string) => Promise<string>;
  ReadDir: (path: string) => Promise<string[]>;
}

export class RemoteStore {
  store: RemoteStoreServiceWrapper;

  lastWrite: string | null = null;

  constructor(store: RemoteStoreServiceWrapper) {
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