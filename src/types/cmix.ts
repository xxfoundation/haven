export type IsReadyInfo = {
  IsReady: boolean;
  HowClose: number;
}

type HealthCallback = { Callback: (healthy: boolean) => void }

export type CMix = {
  AddHealthCallback: (callback: HealthCallback) => number;
  IsReady: (threshold: number) => string;
  GetID: () => number;
}