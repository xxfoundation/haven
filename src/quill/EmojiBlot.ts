import { EmbedBlot } from 'parchment';
import Quill from 'quill';
const Embed = Quill.import('blots/embed');

class EmojiBlot extends EmbedBlot {
  static blotName = 'emoji';
  static tagName = 'span';
  static className = 'emoji';

  static create(value: string) {
    const node = super.create(value);
    node.textContent = value;
    return node;
  }

  static value(node: HTMLElement) {
    return node.textContent;
  }
}

export default EmojiBlot;
