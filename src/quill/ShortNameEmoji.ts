/* eslint-disable @typescript-eslint/no-explicit-any */
import Quill, { DeltaStatic, RangeStatic, Sources } from 'quill';
import Fuse from 'fuse.js';
import emojiMap from '../../public/integrations/assets/emojiSet.json';

const allEmojiKeys = Object.keys(emojiMap.emojis);

const Module = Quill.import('core/module');

const MAX_LOOKBACK_CHARS = 31;
const TRIGGER_CHAR = ':';
const MATCHING_CHARS = /:[a-zA-Z0-9_+]*:/dg;
const MIN_MATCH_LENGTH = 1;

class ShortNameEmoji extends Module {
  container: HTMLUListElement;

  quill: Quill & { container?: any };

  fuse: Fuse<string>;

  constructor(quill: Quill, options: any) {
    super(quill, options);

    this.fuse = new Fuse(allEmojiKeys, {
      shouldSort: true,
      threshold: 0.1,
      location: 0,
      distance: 100,
      minMatchCharLength: 1,
    });

    this.quill = quill;
    this.container = document.createElement('ul');
    this.container.classList.add('emoji-completions');
    this.quill.container.appendChild(this.container);
    this.container.style.position = 'absolute';
    this.container.style.display = 'none';

    quill.on('text-change', this.onTextChange.bind(this));

    this.open = false;
    this.triggerIndex = null;
    this.focusedButton = null;

    this.isWhiteSpace = (ch: string) => {
      let whiteSpace = false;
      if (/\s/.test(ch)) {
        whiteSpace = true;
      }
      return whiteSpace;
    }
  }

  onTextChange(delta: DeltaStatic, oldDelta: DeltaStatic, source: Sources) {
    if (source === 'user') {
      this.onSomethingChange();
    }
  }


  getTextBeforeCursor(cursorPos: number): string {
    const startPos = Math.max(0, (this.quill.getSelection()?.index ?? 0) - MAX_LOOKBACK_CHARS);

    const content = this.quill.getContents(
      startPos,
      cursorPos - startPos
    );

    // embeds take up exactly 1 character space as far as indexes are concerned,
    // so we add a blank character in their place.
    const textBeforeCursorPos = content.ops?.map((op) => typeof op.insert === 'string' ? op.insert : ' ').join('') ?? '';


    return textBeforeCursorPos;
  }

  onSomethingChange() {
    const range = this.quill.getSelection();
    if (range == null) return;

    const textBeforeCursor = this.getTextBeforeCursor(range.index);
    this.triggerIndex = textBeforeCursor.lastIndexOf(TRIGGER_CHAR);
    const matches = MATCHING_CHARS.exec(textBeforeCursor);
    
    if (matches && matches.length > 0) {
      const match = matches[matches.length - 1];
      const start = textBeforeCursor.lastIndexOf(match)
      const end = start + match.length;

      const code = textBeforeCursor.slice(start, end).replaceAll(':', '');
      const emoji = emojiMap.emojis[code as keyof typeof emojiMap.emojis]?.skins[0]?.native;
      if (emoji) {
        this.quill.deleteText(start, end, 'user');
        this.quill.insertEmbed(start, 'emoji', emoji, 'user');

        setTimeout(() => this.quill.setSelection(start + emoji.length, 0), 0);
      }

      return;
    }
    
    if (this.triggerIndex === -1) {
      this.close(null);
    } else {
      this.triggerPicker(range);

      const textAfter = textBeforeCursor.substring(
        this.triggerIndex + 1
      );
      
      if (this.isWhiteSpace(textAfter)) {
        this.close(null);
        return;
      }

      this.query = textAfter.trim();

      let searchResults = this.fuse.search(this.query).map((result) => result.item);

      if (this.query.length < MIN_MATCH_LENGTH || searchResults.length === 0){
        this.container.style.display = 'none';
        return;
      }

      if (searchResults.length > 15) { //return only 15
        searchResults = searchResults.slice(0, 15);
      }

      this.renderCompletions(searchResults);
    }
  }

  triggerPicker(range: RangeStatic) {
    if (this.open) return true;
    
    const triggerBounds = this.quill.getBounds(range.index);

    const paletteMaxPos = triggerBounds.left + 250;
    if (paletteMaxPos > this.quill.container.offsetWidth) {
      this.container.style.left = (triggerBounds.left - 250)+ 'px';
    } else{
      this.container.style.left = triggerBounds.left + 'px';
    }

    this.container.style.bottom = triggerBounds.top + triggerBounds.height + 'px';
    this.open = true;

    if (this.onOpen) {
      this.onOpen();
    }
  }

  handleArrow() {
    if (!this.open) return true;
    this.buttons[0].classList.remove('emoji-active');
    this.buttons[0].focus();
    if (this.buttons.length > 1) {
      this.buttons[1].focus();
    }
  }

  update() {
    const sel = this.quill.getSelection()?.index ?? 0;
    if (this.triggerIndex >= sel) {
      return this.close(null);
    }

    //Using: fuse.js
    this.query = this.quill.getText(this.triggerIndex + 1, sel - this.triggerIndex - 1);

    try {
      if(event && this.isWhiteSpace(this.query)){
        this.close(null);
        return;
      }
    } catch(e) { console.warn(e); }

    this.query = this.query.trim();

    let searchResults = this.fuse.search(this.query);

    if (this.query.length < MIN_MATCH_LENGTH || searchResults.length === 0){
      this.container.style.display = 'none';
      return;
    }

    if (searchResults.length > 15) { //return only 15
      searchResults = searchResults.slice(0, 15);
    }

    this.renderCompletions(searchResults.map((result) => result.item));
  }

  maybeUnfocus() {
    if (this.container.querySelector('*:focus')) return;
    this.close(null);
  }

  renderCompletions(emojiKeys: string[]) {
    try {
      if (event) {
        if (event['key' as keyof typeof event] === 'Enter') {
          const emoji = emojiMap.emojis[emojiKeys[0] as keyof typeof emojiMap.emojis]?.skins[0].native
          this.close(emoji, 1);
          this.container.style.display = 'none';
          return;
        }

        else if (event['key' as keyof typeof event] === 'Tab') {
          this.quill.disable();
          this.buttons[0].classList.remove('emoji-active');
          this.buttons[1].focus();
          return;
        }
      }
    } catch(e) { console.warn(e); }

    while (this.container.firstChild){
      this.container.removeChild(this.container.firstChild);
    }

    const buttons = Array(emojiKeys.length);
    this.buttons = buttons;

    const handler = (i: number, emoji: string) => (evt: KeyboardEvent) => {
      if (evt.key === 'ArrowRight') {
        evt.preventDefault();
        buttons[Math.min(buttons.length - 1, i + 1)].focus();
      }
      else if (evt.key === 'Tab') {
        evt.preventDefault();
        if ((i + 1) === buttons.length) {
          buttons[0].focus();
          return;
        }
        buttons[Math.min(buttons.length - 1, i + 1)].focus();
      }
      else if (evt.key === 'ArrowLeft') {
        evt.preventDefault();
        buttons[Math.max(0, i - 1)].focus();
      }
      else if (evt.key === 'ArrowDown') {
        evt.preventDefault();
        buttons[Math.min(buttons.length - 1, i + 1)].focus();
      }
      else if (evt.key === 'ArrowUp') {
        evt.preventDefault();
        buttons[Math.max(0, i - 1)].focus();
      }
      else if (evt.key === 'Enter'
               || evt.key === ' '
               || evt.key === 'Tab') {
        evt.preventDefault();
        this.quill.enable();
        this.close(emoji);
      }
    };

    emojiKeys.forEach((emojiKey: string, i) => {
      const li = document.createElement('li');
      const button = document.createElement('button')
      const emoji = emojiMap.emojis[emojiKey as keyof typeof emojiMap.emojis]?.skins[0].native;
      button.innerText = emoji
      li.appendChild(button);
      this.container.appendChild(li);
      buttons[i] = li.firstChild;
      // Events will be GC-ed with button on each re-render:
      buttons[i].addEventListener('keydown', handler(i, emojiKey));
      buttons[i].addEventListener('mousedown', () => this.close(emoji));
      buttons[i].addEventListener('focus', () => this.focusedButton = i);
      buttons[i].addEventListener('unfocus', () => this.focusedButton = null);
    });

    this.container.style.display = 'flex';
    //emoji palette on top
    if (this.quill.container.classList.contains('top-emoji')) {
      const x = this.container.querySelectorAll('li');
      let i;
      for (i = 0; i < x.length; i++) {
        x[i].style.display = 'flex';
      }

      const windowHeight = window.innerHeight;
      const editorPos = this.quill.container.getBoundingClientRect().top;
      if (editorPos > windowHeight/2 && this.container.offsetHeight > 0) {
        this.container.style.top = '-' + this.container.offsetHeight + 'px';
      }
    }

    buttons[0].classList.add('emoji-active');
  }

  close(value: string | null, trailingDelete = 0) {
    this.quill.enable();
    this.container.style.display = 'none';
    while (this.container.firstChild) this.container.removeChild(this.container.firstChild);

    if (value) {
      const index = this.triggerIndex;
      this.quill.deleteText(index, this.query.length + 1 + trailingDelete, 'user');
      this.quill.insertEmbed(index, 'emoji', value, 'user');
      setTimeout(() => this.quill.setSelection(index + value.length), 0);
    }
    this.quill.focus();
    this.open = false;
    if (this.onClose) {
      this.onClose(value);
    }
  }
}

ShortNameEmoji.DEFAULTS = {
  emojiList: allEmojiKeys,
};

export default ShortNameEmoji;
