import { useState, useCallback } from 'react';

interface UseClipboardResult {
  copyToClipboard: (text: string) => Promise<boolean>;
  isCopying: boolean;
  copySuccess: boolean;
  copyError: string | null;
}

export const useClipboard = (): UseClipboardResult => {
  const [isCopying, setIsCopying] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    setIsCopying(true);
    setCopyError(null);
    setCopySuccess(false);

    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(true);
      
      // Reset success state after 2 seconds
      setTimeout(() => setCopySuccess(false), 2000);
      
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      setCopyError('Failed to copy to clipboard');
      
      // Reset error state after 3 seconds
      setTimeout(() => setCopyError(null), 3000);
      
      return false;
    } finally {
      setIsCopying(false);
    }
  }, []);

  return {
    copyToClipboard,
    isCopying,
    copySuccess,
    copyError,
  };
};