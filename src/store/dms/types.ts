import { MessageStatus, MessageType } from 'src/types';

export type Conversation = {
  pubkey: string;
  nickname: string;
  token: number;
  codesetVersion: number;
  blocked: boolean;
}

export type ConversationId = Conversation['pubkey'];

export type DirectMessage = {
  uuid: number;
  messageId: string;
  pubkey: string;
  parentMessageId: string;
  timestamp: string;
  status: MessageStatus;
  body: string;
  type: MessageType;
  round: number;
}

export type DMState = {
  conversationsByPubkey: Record<string, Conversation>;
  messagesByPubkey: Record<string, DirectMessage[]>;
};

declare module 'src/store/types' {
  interface RootState {
    dms: DMState;
  }
}