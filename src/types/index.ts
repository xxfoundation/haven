import type { ReactNode } from 'react';

export interface EmojiReaction {
  emoji: string;
  userName: string;
}

export interface Message {
  id: string;
  body: string;
  timestamp: string;
  color?: string;
  codename: string;
  nickname?: string;
  emojisMap?: Map<EmojiReaction['emoji'], EmojiReaction['userName'][]>;
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
