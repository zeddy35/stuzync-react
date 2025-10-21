export type ToastPayload = {
  text: string;
  variant?: "success" | "error" | "info";
  durationMs?: number;
  actionLabel?: string;
  onAction?: () => void;
};

type Listener = (toast: ToastPayload | null) => void;

let listeners = new Set<Listener>();
let current: ToastPayload | null = null;

export function onToast(fn: Listener) {
  listeners.add(fn);
  // Push current immediately
  fn(current);
  return () => listeners.delete(fn);
}

export function showToast(toast: ToastPayload) {
  current = toast;
  listeners.forEach((l) => l(current));
}

export function clearToast() {
  current = null;
  listeners.forEach((l) => l(current));
}

