export enum MessageType {
  Normal = 1,
  Reply = 2,
  Reaction = 3
}

export enum MessageStatus {
  Unsent    = 0,
  Sent      = 1,
  Delivered = 2,
  Failed    = 3
}

export type DBMessage = {
  id: number;
  nickname: string;
  message_id: string;
  channel_id: string;
  parent_message_id: null | string;
  timestamp: string;
  lease: number;
  status: MessageStatus;
  hidden: boolean,
  pinned: boolean;
  text: string;
  type: MessageType;
  round: number;
  pubkey: string;
  codeset_version: number;
  dm_token: number;
}

export type DBChannel = {
  id: string;
  name: string;
  description: string;
}
