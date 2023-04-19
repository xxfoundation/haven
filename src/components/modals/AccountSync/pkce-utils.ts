const generateCodeVerifier = () => {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let verifier = '';
  for (let i = 0; i < 128; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    verifier += charset.charAt(randomIndex);
  }
  return verifier;
}

const bufferToBase64Url = (buffer: ArrayBuffer) => {
  const bytes = new Uint8Array(buffer);
  const base64 = Buffer.from(bytes).toString('base64');
  return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

const generateCodeChallenge = (verifier: string) => {
  const sha256 = window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
  return sha256.then(bufferToBase64Url);
}

function parseAuthCode(url: URL) {
  const queryParams = new URLSearchParams(url.search);
  return queryParams.get('code');
}


export { generateCodeVerifier, generateCodeChallenge, parseAuthCode };