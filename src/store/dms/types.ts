import { MessageStatus, MessageType } from 'src/types';

type PubKey = string;

export type Conversation = {
  color: string;
  pubkey: PubKey;
  nickname?: string;
  token: number;
  codename: string;
  codeset: number;
  blocked: boolean;
}

export type ConversationId = Conversation['pubkey'];

export type DirectMessage = {
  uuid: number;
  color: string;
  messageId: string;
  codename: string;
  pubkey: PubKey;
  codeset: number;
  conversationId: Conversation['pubkey'];
  parentMessageId: string | null;
  timestamp: string;
  status: MessageStatus;
  body: string;
  type: MessageType;
  round: number;
}


export type DMState = {
  conversationsByPubkey: Record<PubKey, Conversation>;
  messagesByPubkey: Record<PubKey, Record<DirectMessage['uuid'], DirectMessage>>;
  missedMessagesByPubkey: Record<PubKey, boolean>;
};

declare module 'src/store/types' {
  interface RootState {
    dms: DMState;
  }
}