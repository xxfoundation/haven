import type { ReactNode } from 'react';

export interface IEmojiReaction {
  emoji: string;
  userName: string;
}

export interface IMessage {
  id?: string;
  body: string;
  timestamp: number;
  color?: string;
  codeName: string;
  nickName?: string;
  emojisMap?: Map<IEmojiReaction['emoji'], IEmojiReaction['userName'][]>;
  replyToMessage?: IMessage;
  channelId: string;
  status?: number;
  uuid: number;
  round: number;
}

export type WithChildren = {
  children?: ReactNode;
}
