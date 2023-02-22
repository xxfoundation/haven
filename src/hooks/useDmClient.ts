import type { DMClient } from 'src/types';

import { useUtils } from '@contexts/utils-context';
import { useCallback, useState } from 'react';
import { MAXIMUM_PAYLOAD_BLOCK_SIZE, WASM_JS_PATH } from 'src/constants';
import { decoder } from '@utils/index';
import { onDmReceived } from 'src/events';

type DatabaseCipher = {
  id: number;
  decrypt: (encrypted: string) => string;
};

const useDmClient = (cmixId?: number, storageTag?: string) => {
  const [client, setClient] = useState<DMClient | undefined>();
  const [databaseCipher, setDatabaseCipher] = useState<DatabaseCipher>();
  const { utils } = useUtils();

  const createDatabaseCipher = useCallback(
    (decryptedInternalPassword: Uint8Array) => {
      if (!cmixId) { return }
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
    },
    [utils, cmixId]
  );

  const createDmClient = useCallback(async (privateIdentity: Uint8Array) => {
    if (!databaseCipher || !cmixId || !storageTag) { return; }
    try {
      const createdClient = await utils.NewDMClientWithIndexedDb(cmixId, WASM_JS_PATH, privateIdentity, onDmReceived, databaseCipher.id)
      setClient(createdClient);
    } catch (e) {
      console.error('Failed to create DM client:', e);
    }
  }, [cmixId, databaseCipher, storageTag, utils]);

  return client;
}

export default useDmClient;
