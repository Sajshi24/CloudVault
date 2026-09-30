import { useState } from 'react';

export function useConfirm() {
  const [state, setState] = useState<{
    open: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm?: () => Promise<void> | void;
  }>({ open: false, title: '', message: '' });

  const confirm = (
    title: string,
    message: string,
    onConfirm: () => Promise<void> | void,
    confirmLabel?: string
  ) => {
    setState({ open: true, title, message, onConfirm, confirmLabel });
  };

  const close = () => setState((s) => ({ ...s, open: false }));

  return { state, confirm, close };
}
