import type { MessageStatus, MessageType, WithChildren } from 'src/types';
import { FC, useContext, useEffect, useMemo } from 'react';

import { Dexie } from 'dexie';
import { createContext, useCallback, useState } from 'react';

import useLocalStorage from 'src/hooks/useLocalStorage';
import { ELIXXIR_USERS_TAGS } from 'src/constants';

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
  initDb: (storageTag: string) => void;
}

export const DBContext = createContext<DBContextType>({ initDb: () => {} } as unknown as DBContextType);

export const DBProvider: FC<WithChildren> = ({ children }) => {
  const [db, setDb] = useState<Dexie>();
  const [dmDb, setDmDb] = useState<Dexie>();
  const [storageTags] = useLocalStorage<string[]>(ELIXXIR_USERS_TAGS, []);
  const storageTag = useMemo(() => storageTags?.[0], [storageTags]);
  
  const initDb = useCallback((tag: string) => {
    const instance = new Dexie(`${tag}_speakeasy`);
    instance.version(0.1).stores({
      channels: '++id',
      messages:
        '++id,channel_id,&message_id,parent_message_id,pinned,timestamp'
    });
  
    setDb(instance);

    const dmInstance = new Dexie(`${tag}_speakeasy_dm`);
    dmInstance.version(0.1).stores({
      conversations: '++id',
      messages: '++id,conversation_pub_key,&message_id,parent_message_id,timestamp'
    });
    setDmDb(dmInstance);
  }, []);

  useEffect(() => {
    if (storageTag) {
      initDb(storageTag);
    }
  }, [initDb, storageTag]);

  return (
    <DBContext.Provider value={{ db, dmDb, initDb }}>
      {children}
    </DBContext.Provider>
  )
}

export const useDb = (type: 'dm' | 'channels' = 'channels') => useContext(DBContext)[type === 'channels' ? 'db' : 'dmDb'];

