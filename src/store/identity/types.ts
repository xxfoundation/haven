export type Identity = {
  pubkey: string;
  codename: string;
  color: string;
  extension: string;
  codeset: number;
}

export type IdentityState = { identity?: Identity };

declare module 'src/store/types' {
  interface RootState {
    identity: IdentityState;
  }
}