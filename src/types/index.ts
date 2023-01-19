import { MessageType } from '@contexts/network-client-context';
import type { ReactNode } from 'react';

export interface Message {
  id: string;
  body: string;
  timestamp: string;
  repliedTo: string | null;
  type: MessageType;
  color?: string;
  codename: string;
  nickname?: string;
  replyToMessage?: Message;
  channelId: string;
  status?: number;
  uuid: number;
  round: number;
  pubkey: string;
  pinned: boolean;
  hidden: boolean;
}

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