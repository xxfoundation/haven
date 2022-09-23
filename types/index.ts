export interface IEmojiReaction {
  emoji: string;
  userName: string;
}

export interface IMessage {
  id: string;
  body: string;
  timestamp: number;
  userName: string;
  emojisMap?: Map<IEmojiReaction["emoji"], IEmojiReaction["userName"][]>;
  replyToMessage?: IMessage;
}
