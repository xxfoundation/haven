import type { CMix, CMixParams, DummyTraffic, RemoteStore } from 'src/types';

import { useUtils } from '@contexts/utils-context';
import { encoder, decoder } from '@utils/index';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { DUMMY_TRAFFIC_ARGS, FOLLOWER_TIMEOUT_PERIOD, MAXIMUM_PAYLOAD_BLOCK_SIZE, STATE_PATH } from 'src/constants';
import { ndf } from 'src/sdk-utils/ndf';
import useTrackNetworkPeriod from './useNetworkTrackPeriod';
import useRemoteStore from './useRemoteStore';
import { useAuthentication } from '@contexts/authentication-context';
import useAccountSync, { AccountSyncStatus } from './useAccountSync';
import { AppEvents, bus } from 'src/events';
import { RemoteKVWrapper } from '@contexts/remote-kv-context';

type DatabaseCipher = {
  id: number;
  decrypt: (encrypted: string) => string;
};

export enum NetworkStatus {
  UNINITIALIZED = 'uninitialized',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  FAILED = 'failed'
}

const useCmix = () => {
  const { cmixPreviouslyInitialized, encryptedPassword } = useAuthentication();
  const [status, setStatus] = useState<NetworkStatus>(NetworkStatus.UNINITIALIZED);
  const [dummyTraffic, setDummyTrafficManager] = useState<DummyTraffic>();
  const [cmix, setCmix] = useState<CMix | undefined>();
  const { utils } = useUtils();
  const cmixId = useMemo(() => cmix?.GetID(), [cmix]);
  const [databaseCipher, setDatabaseCipher] = useState<DatabaseCipher>();
  const { trackingMs } = useTrackNetworkPeriod();
  const accountSync = useAccountSync();
  const remoteStore = useRemoteStore();

  const encodedCmixParams = useMemo(() => {
    const params = JSON.parse(decoder.decode(utils.GetDefaultCMixParams())) as CMixParams;
    params.Network.EnableImmediateSending = true;
    return encoder.encode(JSON.stringify(params));
  }, [utils]);

  const createDatabaseCipher = useCallback(
    (id: number, password: Uint8Array) => {
      const cipher = utils.NewDatabaseCipher(
        id,
        password,
        MAXIMUM_PAYLOAD_BLOCK_SIZE
      );

      setDatabaseCipher({
        id: cipher.GetID(),
        decrypt: (encrypted: string) => decoder.decode(
          cipher.Decrypt(encrypted)
        ),
      })
    },
    [utils]
  );

  const loadSynchronizedCmix = useCallback(async (password: Uint8Array, store: RemoteStore) => {
    const loadedCmix = await utils.LoadSynchronizedCmix(
      STATE_PATH,
      password,
      store,
      encodedCmixParams
    );

    setCmix(loadedCmix);
  }, [encodedCmixParams, utils]);

  const initializeSynchronizedCmix = useCallback(async (password: Uint8Array, store: RemoteStore) => {
    if (!cmixPreviouslyInitialized) {
      await utils.NewSynchronizedCmix(
        ndf,
        STATE_PATH,
        password,
        store,
      ).catch((e) => {
        if ((e as Error).message.indexOf('file does not exist') !== -1) {
          bus.emit(AppEvents.NO_ACCOUNT_FOUND);
        } else {
          throw e;
        }
      });
    }
  }, [cmixPreviouslyInitialized, utils])

  const initializeCmix = useCallback(async (password: Uint8Array) => {
    if (!cmixPreviouslyInitialized) {
      await utils.NewCmix(ndf, STATE_PATH, password, '');
    }
  }, [cmixPreviouslyInitialized, utils]);

  const loadCmix = useCallback(async (password: Uint8Array) => {
    const loadedCmix = await utils.LoadCmix(
      STATE_PATH,
      password,
      encodedCmixParams
    );
    setCmix(loadedCmix)
  }, [encodedCmixParams, utils]);

  const connect = useCallback(async () => {
    if (!cmix) { 
      throw Error('Cmix required') 
    }

    setStatus(NetworkStatus.CONNECTING);
    try {
      cmix.StartNetworkFollower(FOLLOWER_TIMEOUT_PERIOD);
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
  }, [cmix, dummyTraffic]);

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
    const listener = () => {
      try {
        cmix?.StopNetworkFollower();
      } catch (e) {
        console.error('Stop follower failed:', e);
      }
    };

    bus.addListener(AppEvents.REMOTE_STORE_INITIALIZED, listener);

    return () => {
      bus.removeListener(AppEvents.REMOTE_STORE_INITIALIZED, listener);
    }
  }, [cmix])

  useEffect(() => {
    if (cmix) {
      connect();
    }
  }, [connect, cmix]);
  

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

  useEffect(() => {
    if (cmix && status === NetworkStatus.CONNECTED) {
      cmix.SetTrackNetworkPeriod(trackingMs);
    }
  }, [cmix, status, trackingMs]);

  useEffect(() => {
    if (encryptedPassword && cmix) {
      createDatabaseCipher(cmix.GetID(), encryptedPassword);
    }
  }, [cmix, createDatabaseCipher, encryptedPassword]);

  useEffect(() => {
    if (accountSync.status === AccountSyncStatus.Synced && encryptedPassword && remoteStore) {
      initializeSynchronizedCmix(encryptedPassword, remoteStore)
        .then(() => { bus.emit(AppEvents.CMIX_INITALIZED)})
        .then(() => loadSynchronizedCmix(encryptedPassword, remoteStore))
        .then(() => {
          bus.emit(AppEvents.CMIX_SYNCED, remoteStore.service)
        })
        .catch((e) => {
          setStatus(NetworkStatus.FAILED);
          console.error('Cmix Initialization Failed', e);
        })
    }
  }, [
    accountSync.status,
    encryptedPassword,
    initializeSynchronizedCmix,
    loadSynchronizedCmix,
    remoteStore
  ]);
  
  useEffect(() => {
    if (!cmix && accountSync.status !== AccountSyncStatus.Synced && encryptedPassword) {
      initializeCmix(encryptedPassword)
        .then(() => loadCmix(encryptedPassword))
        .catch((e) => {
          setStatus(NetworkStatus.FAILED);
          throw e;
        })
    }
  }, [
    accountSync.status,
    cmix,
    encryptedPassword,
    initializeCmix,
    initializeSynchronizedCmix,
    loadCmix,
    loadSynchronizedCmix,
    remoteStore
  ]);

  useEffect(() => {
    if (cmix) {
      cmix.GetRemoteKV().then((rawKv) => {
        const wrappedKv = new RemoteKVWrapper(rawKv);
        bus.emit(AppEvents.REMOTE_KV_INITIALIZED, wrappedKv);
      })
    }
  }, [cmix])
  
  
  return {
    connect,
    cmix,
    cipher: databaseCipher,
    disconnect,
    id: cmixId,
    remoteStore,
    status,
  };
}

export default useCmix;
