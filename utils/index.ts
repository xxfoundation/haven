export const randomStringGenerator = (length: number) => {
  var result = "";
  var characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

// Encodes Uint8Array to a string.
export const enc = new TextEncoder();

// Decodes a string to a Uint8Array.
export const dec = new TextDecoder();

export const isClientSide = () => {
  return typeof window !== "undefined";
};
