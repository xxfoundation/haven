import type { ReactNode } from 'react';

export interface EmojiReaction {
  emoji: string;
  userName: string;
}

export interface Message {
  id: string;
  body: string;
  timestamp: number;
  color?: string;
  codeName: string;
  nickName?: string;
  emojisMap?: Map<EmojiReaction['emoji'], EmojiReaction['userName'][]>;
  replyToMessage?: Message;
  channelId: string;
  status?: number;
  uuid: number;
  round: number;
}

export type WithChildren = {
  children?: ReactNode;
}
