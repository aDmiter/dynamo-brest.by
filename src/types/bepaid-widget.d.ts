export type BePaidWidgetCloseStatus =
  | 'successful'
  | 'failed'
  | 'pending'
  | 'redirected'
  | 'error'
  | null;

export interface BePaidWidgetParams {
  checkout_url: string;
  token: string;
  fromWebview?: boolean;
  checkout?: { iframe?: boolean };
  closeWidget?: (status: BePaidWidgetCloseStatus) => void;
}

declare global {
  interface Window {
    BeGateway: new (params: BePaidWidgetParams) => { createWidget: () => void };
  }
}

export {};
