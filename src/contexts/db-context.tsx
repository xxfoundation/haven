import type { MessageStatus, MessageType, WithChildren } from 'src/types';
import { FC, useContext, useEffect } from 'react';

import { Dexie } from 'dexie';
import { createContext, useCallback, useState } from 'react';

import useLocalStorage from 'src/hooks/useLocalStorage';
import { DMS_DATABASE_NAME } from 'src/constants';
import useStorageTag from 'src/hooks/useChannelsStorageTag';

export type DBMessage = {
  id: number;
  nickname: string;
  message_id: string;
  channel_id: string;
  parent_message_id: null | string;
  timestamp: string;
  lease: number;
  status: MessageStatus;
  hidden: boolean,
  pinned: boolean;
  text: string;
  type: MessageType;
  round: number;
  pubkey: string;
  codeset_version: number;
}

export type DBChannel = {
  id: string;
  name: string;
  description: string;
}

type DBContextType = {
  db?: Dexie | undefined;
  dmDb?: Dexie | undefined;
  initDb: (storageTag: string) => Promise<void>;
  initDmsDb: (storageTag: string) => Promise<void>;
}

export const DBContext = createContext<DBContextType>({ initDb: () => {} } as unknown as DBContextType);

export const DBProvider: FC<WithChildren> = ({ children }) => {
  const [db, setDb] = useState<Dexie>();
  const [dmDb, setDmDb] = useState<Dexie>();
  const { value: storageTag } = useStorageTag();
  const [dmsDatabaseName] = useLocalStorage<string | null>(DMS_DATABASE_NAME, null);
  
  const initDb = useCallback((tag: string) => {
    const instance = new Dexie(`${tag}_speakeasy`);
    return instance.open().then(setDb);
  }, []);

  const initDmsDb = useCallback((dbName: string) => {
    const dmInstance = new Dexie(dbName);
    return dmInstance.open().then(setDmDb);
  }, [])

  useEffect(() => {
    if (storageTag) {
      initDb(storageTag);
    }

    if (dmsDatabaseName) {
      initDmsDb(dmsDatabaseName);
    }
  }, [dmsDatabaseName, initDb, initDmsDb, storageTag]);

  return (
    <DBContext.Provider value={{ db, dmDb, initDb, initDmsDb }}>
      {children}
    </DBContext.Provider>
  )
}

export const useDb = (type: 'dm' | 'channels' = 'channels') => useContext(DBContext)[type === 'channels' ? 'db' : 'dmDb'];

