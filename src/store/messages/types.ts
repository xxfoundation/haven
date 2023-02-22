import { MessageStatus, MessageType } from 'src/types';

export interface Message {
  id: string;
  body: string;
  timestamp: string;
  repliedTo: string | null;
  type: MessageType;
  color?: string;
  codename: string;
  nickname?: string;
  channelId: string;
  status?: MessageStatus;
  uuid: number;
  round: number;
  pubkey: string;
  pinned: boolean;
  hidden: boolean;
  dmToken?: number;
}

export type MessageUuid = Message['uuid'];
export type MessageId = Message['id'];

export type MessagesState = {
  byId: Record<MessageUuid, Message>;
};

// { [messageId]: { [emoji]: codename[] } }
export type EmojiReactions =  Record<string, Record<string, string[]>>;

declare module 'src/store/types' {
  interface RootState {
    messages: MessagesState;
  }
}