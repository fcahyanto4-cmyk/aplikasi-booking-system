// Minimal typings for the Midtrans Snap.js browser SDK
// (loaded via <script> from https://app.sandbox.midtrans.com/snap/snap.js
// or the production equivalent — see src/app/layout.tsx).
// Docs: https://docs.midtrans.com/docs/snap-snapjs

export interface MidtransSnapResult {
  order_id: string;
  transaction_id: string;
  transaction_status: string;
  status_code: string;
  status_message: string;
  gross_amount: string;
  payment_type: string;
  [key: string]: unknown;
}

export interface MidtransSnapCallbacks {
  onSuccess?: (result: MidtransSnapResult) => void;
  onPending?: (result: MidtransSnapResult) => void;
  onError?: (result: MidtransSnapResult) => void;
  onClose?: () => void;
}

export interface MidtransSnap {
  pay: (token: string, callbacks?: MidtransSnapCallbacks) => void;
}

declare global {
  interface Window {
    snap: MidtransSnap;
  }
}
