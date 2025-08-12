export const isValidTimeout = (value: any): value is TimeoutId => {
  return value !== null && value !== undefined;
};

// For environments where you need to handle both Node.js and Browser timeouts
export const clearTimeoutSafe = (timeout: TimeoutId | null) => {
  if (timeout !== null) {
    clearTimeout(timeout);
  }
};
