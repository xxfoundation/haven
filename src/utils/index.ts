import { deflateSync, inflateSync } from 'zlib';
import DOMPurify from 'dompurify';

// Encodes Uint8Array to a string.
export const encoder = new TextEncoder();

// Decodes a string to a Uint8Array.
export const decoder = new TextDecoder();

export const isClientSide = () => {
  return typeof window !== 'undefined';
};

export const envIsDev = () => {
  let isDev = false;
  if (isClientSide()) {
    isDev = window.location.href.indexOf('localhost') !== -1;
    isDev ||= window.location.href.indexOf('dev') !== -1;
  }
  return isDev;
}

export const exportDataToFile = (data: Uint8Array) => {
  const filename = 'speakeasyIdentity.json';

  const file = new Blob([data], { type: 'text/plain' });
  const a = document.createElement('a');
  const url = URL.createObjectURL(file);
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(function() {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 0);
};

export const byEntryTimestamp = (x: [string, unknown], y: [string, unknown]) => new Date(x[0]).getTime() - new Date(y[0]).getTime()

const sanitize = (markup: string) => DOMPurify.sanitize(markup, {
  ALLOWED_TAGS: ['blockquote', 'p', 'a', 'br', 'code', 'ol', 'ul', 'li', 'pre', 'i', 'strong', 'b', 'em', 'span', 's'],
  ALLOWED_ATTR: ['target', 'href', 'rel', 'class', 'style']
});

export const inflate = (content: string) => {
  let inflated: string;
  try {
    inflated = inflateSync(Buffer.from(content, 'base64')).toString();
  } catch (e) {
    console.error('Couldn\'t decode message. Falling back to plaintext.', e);
    inflated = content;
  }

  return sanitize(inflated);
}

export const deflate = (content: string) => deflateSync(content).toString('base64');
