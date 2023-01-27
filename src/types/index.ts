import type { ReactNode } from 'react';

export type WithChildren = {
  children?: ReactNode;
}

type HealthCallback = { Callback: (healthy: boolean) => void }

export type CMix = {
  AddHealthCallback: (callback: HealthCallback) => number;
  GetID: () => number;
  IsReady: (threshold: number) => Uint8Array;
  ReadyToSend: () => boolean,
  StartNetworkFollower: (timeoutMilliseconds: number) => void;
  StopNetworkFollower: () => void;
  WaitForNetwork: (timeoutMilliseconds: number) => Promise<void>;
}

export type DummyTraffic = {
  GetStatus: () => boolean;
  Pause: () => void;
  Start: () => void;
}

export * from 'src/store/channels/types';
export * from 'src/store/identity/types';
export * from 'src/store/messages/types';