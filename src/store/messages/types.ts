import { EmojiReactions } from 'src/store/types';
import { ChannelId, MessageStatus, MessageType } from 'src/types';

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
  codeset: number;
  dmToken?: number;
}

export type MessageUuid = Message['uuid'];
export type MessageId = Message['id'];

export type Contributor = Pick<Message, 'pubkey' | 'codeset' | 'codename' | 'nickname' | 'timestamp' | 'color' | 'dmToken'>;

export type MessagesState = {
  reactions: EmojiReactions;
  contributorsByChannelId: Record<ChannelId, Contributor[]>;
  byChannelId: Record<Message['channelId'], Record<MessageUuid, Message>>;
  sortedMessagesByChannelId: Record<Message['channelId'], Array<Message>>;
};

declare module 'src/store/types' {
  interface RootState {
    messages: MessagesState;
  }
}