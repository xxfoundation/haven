import type { ReactNode } from 'react';

export type WithChildren = {
  children?: ReactNode;
}

type HealthCallback = { Callback: (healthy: boolean) => void }

export type CMix = {
  AddHealthCallback: (callback: HealthCallback) => number;
  GetID: () => number;
  IsReady: (threshold: number) => Uint8Array;
  ReadyToSend: () => boolean;
  StartNetworkFollower: (timeoutMilliseconds: number) => void;
  StopNetworkFollower: () => void;
  WaitForNetwork: (timeoutMilliseconds: number) => Promise<void>;
}

export type DMClient = {
  SendText: (pubkey: Uint8Array, dmToken: number, message: string, leaseTimeMs: number, cmixParams: Uint8Array) => Promise<void>;
  SendReply: (pubkey: Uint8Array, dmToken: number, replyToId: Uint8Array, message: string, leaseTimeMs: number, cmixParams: Uint8Array) => Promise<void>;
  SendReaction: (pubkey: Uint8Array, dmToken: number, reactToId: Uint8Array, message: string, cmixParams: Uint8Array) => Promise<void>;
  GetIdentity: () => Uint8Array;
  SetNickname: (nickname: string) => void;
  GetNickname: () => string;
  GetDatabaseName: () => string;
}

export type DummyTraffic = {
  GetStatus: () => boolean;
  Pause: () => void;
  Start: () => void;
}

export * from './db';
export * from 'src/store/channels/types';
export * from 'src/store/identity/types';
export * from 'src/store/messages/types';