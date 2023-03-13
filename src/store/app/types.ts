export type AppState = {
  selectedChannelId: string | null;
  selectedConversationId: string | null;
  selectedUserPubkey: string | null;
}

declare module 'src/store/types' {
  interface RootState {
    app: AppState;
  }
}