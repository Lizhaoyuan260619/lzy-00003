import { useState, useCallback } from 'react';

interface UseClipboardOptions {
  successDuration?: number;
}

interface UseClipboardResult {
  copied: boolean;
  copy: (text: string) => Promise<void>;
}

export function useClipboard(options: UseClipboardOptions = {}): UseClipboardResult {
  const { successDuration = 1500 } = options;
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
        }, successDuration);
      } catch (err) {
        console.error('复制到剪贴板失败:', err);
      }
    },
    [successDuration]
  );

  return { copied, copy };
}
