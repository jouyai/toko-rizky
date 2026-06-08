interface SnapResult {
  transaction_id: string;
  status_code: string;
  status_message: string;
  [key: string]: any;
}

interface SnapOptions {
  onSuccess?: (result: SnapResult) => void;
  onPending?: (result: SnapResult) => void;
  onError?: (result: SnapResult) => void;
  onClose?: () => void;
}

interface Snap {
  pay: (token: string, options?: SnapOptions) => void;
}

interface Window {
  snap: Snap;
}
