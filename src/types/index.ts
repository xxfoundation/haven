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
  SetTrackNetworkPeriod: (periodMs: number) => void;
}

export type DMClient = {
  SendText: (pubkey: Uint8Array, dmToken: number, message: string, leaseTimeMs: number, cmixParams: Uint8Array) => Promise<void>;
  SendReply: (pubkey: Uint8Array, dmToken: number, message: string, replyToId: Uint8Array, leaseTimeMs: number, cmixParams: Uint8Array) => Promise<void>;
  SendReaction: (pubkey: Uint8Array, dmToken: number, message: string, reactToId: Uint8Array, cmixParams: Uint8Array) => Promise<void>;
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

export type CMixParams = {
  Network: {
    TrackNetworkPeriod: number;
    MaxCheckedRounds: number;
    RegNodesBufferLen: number;
    NetworkHealthTimeout: number;
    ParallelNodeRegistrations: number;
    KnownRoundsThreshold: number;
    FastPolling: boolean;
    VerboseRoundTracking: boolean;
    RealtimeOnly: boolean;
    ReplayRequests: boolean;
    EnableImmediateSending: boolean;
    MaxParallelIdentityTracks: number;
    Rounds: {
      MaxHistoricalRounds: number;
      HistoricalRoundsPeriod: number;
      HistoricalRoundsBufferLen: number;
      MaxHistoricalRoundsRetries: number;
    },
  },
  Pickup: {
    NumMessageRetrievalWorkers: number;
    LookupRoundsBufferLen: number;
    MaxHistoricalRoundsRetries: number;
    UncheckRoundPeriod: number;
    ForceMessagePickupRetry: boolean;
    SendTimeout: number;
    RealtimeOnly: boolean;
    ForceHistoricalRounds: boolean;
  },
  Message: {
    MessageReceptionBuffLen: number;
    MessageReceptionWorkerPoolSize: number;
    MaxChecksInProcessMessage: number;
    InProcessMessageWait: number;
    RealtimeOnly: boolean;
  },
  Historical: {
    MaxHistoricalRounds: number;
    HistoricalRoundsPeriod: number;
    HistoricalRoundsBufferLen: number;
    MaxHistoricalRoundsRetries: number;
  },
  CMIX: {
    RoundTries: number;
    Timeout: number;
    RetryDelay: number;
    SendTimeout: number;
    DebugTag: string;
    BlacklistedNodes: Record<string, boolean>,
    Critical: boolean;
  }
}

export * from './db';
export * from './json';
export * from 'src/store/channels/types';
export * from 'src/store/identity/types';
export * from 'src/store/messages/types';