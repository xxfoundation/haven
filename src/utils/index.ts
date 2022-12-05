// Encodes Uint8Array to a string.
export const encoder = new TextEncoder();

// Decodes a string to a Uint8Array.
export const decoder = new TextDecoder();

export const isClientSide = () => {
  return typeof window !== 'undefined';
};
