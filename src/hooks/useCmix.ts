import type { CMix, DummyTraffic } from 'src/types';

import { useUtils } from '@contexts/utils-context';
import { encoder, decoder } from '@utils/index';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DUMMY_TRAFFIC_ARGS, MAXIMUM_PAYLOAD_BLOCK_SIZE, STATE_PATH } from 'src/constants';
import { ndf } from 'src/sdk-utils/ndf';

const cmixPreviouslyInitialized = () => {
  return localStorage && localStorage.getItem(STATE_PATH) !== null;
};

type DatabaseCipher = {
  id: number;
  decrypt: (encrypted: string) => string;
};

export enum NetworkStatus {
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  FAILED = 'failed'
}

const useCmix = () => {
  const [status, setStatus] = useState<NetworkStatus>();
  const [dummyTraffic, setDummyTrafficManager] = useState<DummyTraffic>();
  const [cmix, setCmix] = useState<CMix | undefined>();
  const { utils } = useUtils();
  const cmixId = useMemo(() => cmix?.GetID(), [cmix]);
  const [databaseCipher, setDatabaseCipher] = useState<DatabaseCipher>();
  const [decryptedPassword, setDecryptedPasword] = useState<Uint8Array>();

  const createDatabaseCipher = useCallback(
    (id: number, decryptedInternalPassword: Uint8Array) => {
      const cipher = utils.NewChannelsDatabaseCipher(
        id,
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
    [utils]
  );

  const loadCmix = useCallback(async (decryptedInternalPassword: Uint8Array) => {
    try {
      const params = JSON.parse(decoder.decode(utils.GetDefaultCMixParams()))
      params.Network.Pickup.BatchMessageRetrieval = true
      await utils.LoadCmix(
        STATE_PATH,
        decryptedInternalPassword,
        encoder.encode(JSON.stringify(params))
      ).then((loadedCmix) => {
        createDatabaseCipher(loadedCmix.GetID(), decryptedInternalPassword);
        setCmix(loadedCmix);
      });
    } catch (e) {
      console.error('Failed to load Cmix:', e);
      setStatus(NetworkStatus.FAILED);
    }
  }, [createDatabaseCipher, utils]);

  const initializeCmix = useCallback(async (decryptedInternalPassword: Uint8Array) => {
    setDecryptedPasword(decryptedInternalPassword);
    try {
      if (!cmixPreviouslyInitialized()) {
        await utils.NewCmix(ndf, STATE_PATH, decryptedInternalPassword, '');
      }

      await loadCmix(decryptedInternalPassword);
    } catch (e) {
      console.error('Failed to initiate Cmix: ' + e);
      setStatus(NetworkStatus.FAILED);
    }
  }, [utils, loadCmix]);


  const connect = useCallback(async () => {
    if (!cmix) { 
      throw Error('Cmix required') 
    }

    setStatus(NetworkStatus.CONNECTING);
    try {
      cmix.StartNetworkFollower(50000);
    } catch (error) {
      console.error('Error while StartNetworkFollower:', error);
      setStatus(NetworkStatus.FAILED);
    }

    try {
      await cmix.WaitForNetwork(10 * 60 * 1000);
      setStatus(NetworkStatus.CONNECTED)
    } catch (e) {
      console.error('Timed out. Network is not healthy.');
      setStatus(NetworkStatus.FAILED);
    }
  }, [cmix]);

  const disconnect = useCallback(() => {
    dummyTraffic?.Pause();
    setDummyTrafficManager(undefined);
    cmix?.StopNetworkFollower();
    setStatus(NetworkStatus.DISCONNECTED);
    setCmix(undefined);
  }, [cmix, dummyTraffic])

  useEffect(() => {
    if (cmix) {
      cmix.AddHealthCallback({
        Callback: (isHealthy: boolean) => {
          if (isHealthy) {
            setStatus(NetworkStatus.CONNECTED);
          } else {
            setStatus(NetworkStatus.DISCONNECTED);
          }
        }
      });
    }
  }, [cmix]);


  useEffect(() => {
    if (cmix) {
      connect();
    }
  }, [connect, cmix])
  

  useEffect(() => {
    if (status === NetworkStatus.CONNECTED && dummyTraffic && !dummyTraffic.GetStatus()) {
      dummyTraffic.Start();
    }
  }, [dummyTraffic, status])


  useEffect(() => {
    if (cmixId !== undefined) {
      try {
        setDummyTrafficManager(utils.NewDummyTrafficManager(
          cmixId,
          ...DUMMY_TRAFFIC_ARGS
        ));
      } catch (error) {
        console.error('error while creating the Dummy Traffic Object:', error);
      }
    }
  }, [cmixId, utils]);
  
  return {
    connect,
    cmix,
    cipher: databaseCipher,
    decryptedPassword,
    disconnect,
    id: cmixId,
    initializeCmix,
    status
  };
}

export default useCmix;
