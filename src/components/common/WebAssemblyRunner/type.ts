export type HavenStorage = {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: any) => Promise<void>;
  delete: (key: string) => Promise<void>;
  clear: () => Promise<void>;
  keys: () => Promise<string[]>;
  key: (index: number) => Promise<string | null>;
  isAvailable?: () => boolean;

  // boolean indicating if the storage is available
  init?: () => Promise<boolean>;
};
