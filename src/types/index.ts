import type { ReactNode } from 'react';

export interface Message {
  id: string;
  body: string;
  timestamp: string;
  color?: string;
  codename: string;
  nickname?: string;
  emojisMap?: Map<string, string[]>;
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
