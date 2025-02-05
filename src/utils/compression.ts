import pako from 'pako';
import DOMPurify from 'dompurify';
import { Buffer } from 'buffer';


export const inflate = (content: string) => {
  let inflated: string;
  try {
    const uint8Array = new Uint8Array(Buffer.from(content, 'base64'));
    inflated = new TextDecoder().decode(pako.inflate(uint8Array));
  } catch (e) {
    console.error(`Couldn't decode message "${content}". Falling back to plaintext.`, e);
    inflated = content;
  }
  return sanitize(inflated);
};

export const deflate = (str: string): string => {
  const compressed = pako.deflate(str);
  return Buffer.from(compressed).toString('base64');
};

const sanitize = (markup: string) =>
  DOMPurify.sanitize(markup, {
    ALLOWED_TAGS: [
      'blockquote',
      'p',
      'a',
      'br',
      'code',
      'ol',
      'ul',
      'li',
      'pre',
      'i',
      'strong',
      'b',
      'em',
      'span',
      's'
    ],
    ALLOWED_ATTR: ['target', 'href', 'rel', 'class', 'style']
  });
