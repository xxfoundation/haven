import Quill from 'quill';
const Embed = Quill.import('blots/embed');

class EmojiBlot extends Embed {
  static create(value: string) {
    const node = super.create();
    node.classList.add('emoji');
    node.innerText = value;
    return node;
  }
}

EmojiBlot.blotName = 'emoji';
EmojiBlot.tagName = 'span';

export default EmojiBlot;
