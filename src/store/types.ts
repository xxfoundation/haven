/* eslint-disable @typescript-eslint/no-empty-interface */
export interface RootState {
  // empty on purpose so that the slices extend the interface
}

// { [messageId]: { [emoji]: codename[] } }
type ReactionInfo = { pubkey: string, codeset: number };
export type EmojiReactions =  Record<string, Record<string, ReactionInfo[]>>;