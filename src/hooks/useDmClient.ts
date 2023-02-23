import type { DMClient } from 'src/types';

import { useUtils } from '@contexts/utils-context';
import { useEffect, useState } from 'react';
import { MAXIMUM_PAYLOAD_BLOCK_SIZE, WASM_JS_PATH } from 'src/constants';
import { decoder } from '@utils/index';
import { onDmReceived } from 'src/events';

type DatabaseCipher = {
  id: number;
  decrypt: (encrypted: string) => string;
};

const useDmClient = (cmixId?: number, privateIdentity?: Uint8Array, decryptedInternalPassword?: Uint8Array) => {
  const [client, setClient] = useState<DMClient | undefined>();
  const [databaseCipher, setDatabaseCipher] = useState<DatabaseCipher>();
  const { utils } = useUtils();
  const { NewDMClientWithIndexedDb } = utils;

  useEffect(() => {
    if (cmixId !== undefined && decryptedInternalPassword) {
      const cipher = utils.NewDMsDatabaseCipher(
        cmixId,
        decryptedInternalPassword,
        MAXIMUM_PAYLOAD_BLOCK_SIZE
      );
  
      setDatabaseCipher({
        id: cipher.GetID(),
        decrypt: (encrypted: string) => decoder.decode(
          cipher.Decrypt(utils.Base64ToUint8Array(encrypted))
        ),
      })
    }
  }, [cmixId, decryptedInternalPassword, utils]);

  useEffect(() => {
    if (!databaseCipher || cmixId === undefined || !privateIdentity || client) { return; }
    try {
      NewDMClientWithIndexedDb(
        cmixId,
        WASM_JS_PATH,
        privateIdentity,
        onDmReceived,
        databaseCipher.id
      ).then(setClient);
    } catch (e) {
      console.error('Failed to create DM client:', e);
    }
  }, [client, NewDMClientWithIndexedDb, cmixId, databaseCipher, privateIdentity])

  return client;
}

export default useDmClient;
