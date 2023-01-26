

export enum MessageType {
  Normal = 1,
  Reply = 2,
  Reaction = 3
}

export enum MessageStatus {
  Sending = 1,
  Sent = 2,
  Delivered = 3
}

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