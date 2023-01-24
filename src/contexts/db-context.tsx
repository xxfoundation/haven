import type { WithChildren } from '@types';
import { FC, useContext, useEffect, useMemo } from 'react';

import { Dexie } from 'dexie';
import { createContext, useCallback, useState } from 'react';

import useLocalStorage from 'src/hooks/useLocalStorage';
import { ELIXXIR_USERS_TAGS } from 'src/constants';

enum DBMessageType {
  Normal = 1,
  Reply = 2,
  Reaction = 3
}

enum DBMessageStatus {
  Sending = 1,
  Sent = 2,
  Delivered = 3
}

export type DBMessage = {
  id: number;
  nickname: string;
  message_id: string;
  channel_id: string;
  parent_message_id: null | string;
  timestamp: string;
  lease: number;
  status: DBMessageStatus;
  hidden: boolean,
  pinned: boolean;
  text: string;
  type: DBMessageType;
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
  initDb: (storageTag: string) => void;
}

export const DBContext = createContext<DBContextType>({ initDb: () => {} } as unknown as DBContextType);

export const DBProvider: FC<WithChildren> = ({ children }) => {
  const [db, setDb] = useState<Dexie>();
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
  }, [])

  useEffect(() => {
    if (storageTag) {
      initDb(storageTag);
    }
  }, [initDb, storageTag]);

  return (
    <DBContext.Provider value={{ db, initDb }}>
      {children}
    </DBContext.Provider>
  )
}

export const useDb = () => useContext(DBContext).db;

