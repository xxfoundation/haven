import Quill from 'quill';
import type { Range } from 'quill';
import {Mention, MentionBlot} from "quill-mention";
import React, {
  FC,
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  HTMLAttributes
} from 'react';
import EventEmitter from 'events';
import { Tooltip } from 'react-tooltip';
import { useTranslation } from 'react-i18next';

import { useNetworkClient } from 'src/contexts/network-client-context';
import { useUI } from 'src/contexts/ui-context';

import SendButton from '../SendButton';
import * as app from 'src/store/app';
import * as messages from 'src/store/messages';
import { userIsMuted } from 'src/store/selectors';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';

import { deflate } from 'src/utils/compression';
import { MESSAGE_TAGS_LIMIT } from 'src/constants';
import X from 'src/components/icons/X';
import Identity from 'src/components/common/Identity';
import { replyingToMessage } from 'src/store/selectors';
import { EmojiPortal, EmojiPicker } from 'src/components/common/EmojiPortal';
  
import AtSign from 'src/components/icons/AtSign';
import RTF from 'src/components/icons/RTF';
import { useOnClickOutside, useToggle } from 'usehooks-ts';
import Bold from 'src/components/icons/Bold';
import Italics from 'src/components/icons/Italics';
import Strikethrough from 'src/components/icons/Strikethrough';
import LinkIcon from 'src/components/icons/Link';
import OrderedList from 'src/components/icons/OrderedList';
import BulletList from 'src/components/icons/BulletList';
import Blockquote from 'src/components/icons/Blockquote';
import Code from 'src/components/icons/Code';
import CodeBlock from 'src/components/icons/CodeBlock';
import Input from 'src/components/common/Input';
import Button from 'src/components/common/Button';
import useInput from 'src/hooks/useInput';

export const bus = new EventEmitter();

const enterEvent = () => bus.emit('enter');

const extractTagsFromMessage = (message: string) => {
  const idAttributeRegex = /data-id="([^"]+)"/gi;
  const ids = new Set<string>();
  let matches;
  while ((matches = idAttributeRegex.exec(message))) {
    ids.add(matches[1]);
  }

  return Array.from(ids);
};

const ToolbarButton: FC<
  Omit<HTMLAttributes<HTMLButtonElement>, 'active'> & { active?: boolean | undefined }
> = ({ active, className, ...props }) => (
  <button
    {...props}
    className={`${className || ''} ${
      active ? 'bg-charcoal-3-20 text-primary' : 'text-charcoal-1 p-1 rounded-full hover:bg-charcoal-3-20 hover:text-primary leading-none'
    }`}
    data-active={active}
  >
    {props.children}
  </button>
);

type Props = {
  className: string;
};

const MESSAGE_MAX_SIZE = 700;

type CustomToolbarProps = {
  quill: Quill;
  className?: string;
};

const useCurrentFormats = (quill: Quill) => {
  const [selection, setSelection] = useState(quill.getSelection());
  const formats = useMemo(() => {
    if (!selection) return null;
    return quill.getFormat(selection) as QuillFormats;
  }, [quill, selection]);

  useEffect(() => {
    const onSelectionChange = () => {
      setSelection(quill.getSelection());
    };

    quill.on('editor-change', onSelectionChange);

    return () => {
      quill.off('editor-change', onSelectionChange);
    };
  }, [quill]);

  const toggle = useCallback(
    (format: keyof QuillFormats, value?: any) => {
      if (!quill || !selection) return;
      
      if (format === 'list' && value === 'ordered') {
        if (formats?.list) {
          quill.format('list', false, 'user');
        } else {
          quill.formatLine(selection.index, selection.length, 'list', 'ordered', 'user');
        }
      } else {
        quill.format(String(format), value ?? !formats?.[format], 'user');
      }
    },
    [formats, quill, selection]
  );

  return {
    selection,
    formats,
    toggle
  };
};

// Update the types at the top
interface QuillFormats {
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  link?: boolean;
  blockquote?: boolean;
  code?: boolean;
  'code-block'?: boolean;
  list?: boolean | 'ordered' | 'list';
  [key: string]: unknown;
}

interface QuillRange {
  index: number;
  length: number;
}

type Sources = 'user' | 'api' | 'silent';

const CustomToolbar: FC<CustomToolbarProps> = ({ className, quill }) => {
  const { t } = useTranslation();
  const { formats, selection, toggle } = useCurrentFormats(quill);
  const [linkMenuOpened, setLinkMenuOpened] = useState(false);
  const [linkInput, onLinkInputChanged, linkInputControls] = useInput();
  const [savedSelection, setSavedSelection] = useState<QuillRange | null>(null);
  const linkMenuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(linkMenuRef, () => {
    setLinkMenuOpened(false);
    linkInputControls.set('');
  });

  const saveSelection = useCallback(() => {
    const range = quill.getSelection();
    if (!range) {
      return;
    }
    const [leaf, offset] = quill.getLeaf(range.index + 1);
    if (leaf) {
      setSavedSelection({
        index: range.index + 1 - offset,
        length: leaf.length()
      });
    } else {
      setSavedSelection(range);
    }
  }, [quill]);

  const onLinkClicked = useCallback(() => {
    if (!formats?.link) {
      const text = quill.getText(selection?.index ?? 0, selection?.length ?? 0);
      quill.format('link', text, 'user');
      saveSelection();
      linkInputControls.set(text || '');
      setLinkMenuOpened(true);
    } else {
      quill.format('link', false, 'user');
    }
  }, [formats?.link, linkInputControls, quill, saveSelection, selection?.index, selection?.length]);

  const handleApplyLink = useCallback(() => {
    if (savedSelection) {
      if (savedSelection.length === 0) {
        quill.insertText(savedSelection.index, linkInput);
      }
      quill.formatText(
        savedSelection.index,
        savedSelection.length || linkInput.length,
        'link',
        linkInput
      );
      setLinkMenuOpened(false);
      setSavedSelection(null);
    }
  }, [linkInput, quill, savedSelection]);

  useEffect(() => {
    if (!formats?.link && !savedSelection) {
      setLinkMenuOpened(false);
    }
  }, [formats?.link, savedSelection]);

  useEffect(() => {
    const handleMouseUp = () => {
      const selected = quill.getSelection();
      if (!selected) {
        setLinkMenuOpened(false);
        return;
      }
      const currentFormats = quill.getFormat(selected);
      const link = currentFormats?.link;
      if (link) {
        setLinkMenuOpened(true);
        linkInputControls.set(link as string);
      } else {
        setLinkMenuOpened(false);
      }
    };

    quill.root.addEventListener('mouseup', handleMouseUp);

    return () => {
      quill.root.removeEventListener('mouseup', handleMouseUp);
    };
  }, [linkInputControls, quill, quill.root]);

  return (
    <div className={`${className || ''} px-2 pt-2 space-x-2`}>
      <ToolbarButton
        active={formats?.bold}
        onClick={() => {
          toggle('bold');
        }}
        id='bold-button'
      >
        <Bold />
      </ToolbarButton>
      <Tooltip className='text-center' anchorId='bold-button'>
        <strong>{t('Bold')}</strong>
        <br />
        CTRL/CMD + B
      </Tooltip>
      <Tooltip className='text-center' anchorId='italic-button'>
        <i>{t('Italic')}</i>
        <br />
        CTRL/CMD + I
      </Tooltip>
      <ToolbarButton
        active={formats?.italic}
        onClick={() => {
          toggle('italic');
        }}
        id='italic-button'
      >
        <Italics />
      </ToolbarButton>
      <Tooltip className='text-center' anchorId='strike-button'>
        <s>{t('Strikethrough')}</s>
        <br />
        CTRL/CMD + SHIFT + X
      </Tooltip>
      <ToolbarButton
        active={formats?.strike}
        onClick={() => {
          toggle('strike');
        }}
        id='strike-button'
      >
        <Strikethrough />
      </ToolbarButton>
      <Tooltip className='text-center' anchorId='link-button'>
        <a>{t('Link')}</a>
        <br />
        CTRL/CMD + U
      </Tooltip>
      <ToolbarButton active={formats?.link} onClick={onLinkClicked} id='link-button'>
        <LinkIcon />
      </ToolbarButton>
      <div
        ref={linkMenuRef}
        onMouseDown={saveSelection}
        className={`${
          linkMenuOpened ? 'flex w-[25rem] items-center space-x-2 absolute bottom-[100%] bg-charcoal-4-80 backdrop-blur-lg rounded-xl p-4' : 'hidden'
        }`}
      >
        <span>{t('Link:')}</span>
        <div className='relative flex-grow'>
          <Input
            onKeyDown={(evt) => {
              if (evt.key === 'Enter') {
                handleApplyLink();
              }
            }}
            value={linkInput}
            onChange={onLinkInputChanged}
            className='placeholder:italic'
            placeholder={t('Enter your link here...')}
            size='sm'
          />
          <button
            onClick={() => {
              linkInputControls.set('');
            }}
            className='absolute right-1.5 bottom-[0.425rem] bg-charcoal-3 rounded-full p-0.5 hover:bg-charcoal-2 transition-all'
          >
            <X className='w-4 h-4' />
          </button>
        </div>
        <Button onClick={handleApplyLink} size='sm'>
          {t('Save')}
        </Button>
      </div>
      <Tooltip className='text-center' anchorId='ordered-list-button'>
        <ol>
          <li>{t('Ordered list')}</li>
        </ol>
        CTRL/CMD + SHIFT + 7
      </Tooltip>
      <ToolbarButton
        active={formats?.list === 'ordered'}
        onClick={() => toggle('list', 'ordered')}
        id='ordered-list-button'
      >
        <OrderedList />
      </ToolbarButton>
      <Tooltip className='text-center' anchorId='unordered-list-button'>
        <ul>
          <li>{t('Bulleted list')}</li>
        </ul>
        CTRL/CMD + SHIFT + 8
      </Tooltip>
      <ToolbarButton
        active={formats?.list === 'list'}
        onClick={() => toggle('list')}
        id='unordered-list-button'
        className='ql-list'
      >
        <BulletList />
      </ToolbarButton>
      <Tooltip className='text-center' anchorId='blockquote-button'>
        <blockquote style={{ display: 'inline-block', marginBottom: '0.25rem' }}>
          {t('Blockquote')}
        </blockquote>
        <br />
        CTRL/CMD + SHIFT + 9
      </Tooltip>
      <ToolbarButton
        active={formats?.blockquote}
        onClick={() => toggle('blockquote')}
        id='blockquote-button'
      >
        <Blockquote />
      </ToolbarButton>
      <Tooltip className='text-center' anchorId='code-button'>
        <code>{t('Code')}</code>
        <br />
        CTRL/CMD + SHIFT + C
      </Tooltip>
      <ToolbarButton active={formats?.code} onClick={() => toggle('code')} id='code-button'>
        <Code />
      </ToolbarButton>
      <Tooltip className='text-center' anchorId='code-block-button'>
        <pre style={{ margin: 0 }}>{t('Code block')}</pre>
        CTRL/CMD + SHIFT + ALT + C
      </Tooltip>
      <ToolbarButton
        active={formats?.['code-block']}
        onClick={() => toggle('code-block')}
        id='code-block-button'
      >
        <CodeBlock />
      </ToolbarButton>
    </div>
  );
};

// React quill takes the short bus to school because the modules prop is not reactive
// so we're instantiating a reference outside of the component, lol
let atMentions: { id: string; value: string }[] = [];

// Add these types at the top
interface KeyBinding {
  key: string;
  shortKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  ctrlKey?: boolean;
  handler(range: { index: number; length: number }): void;
}

interface KeyBindings {
  [key: string]: KeyBinding;
}

// Add this interface for keyboard bindings
interface NormalizedBinding {
  key: string;
  shortKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  ctrlKey?: boolean;
  handler(this: { quill: Quill }, range: Range): void;
}

const UserTextArea: FC<Props> = ({ className }) => {
  const replyToMessage = useAppSelector(replyingToMessage);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const contributors = useAppSelector(messages.selectors.currentContributors);
  useEffect(() => {
    atMentions =
      contributors?.map((c) => ({
        id: c.pubkey,
        value: c.nickname ? `${c.nickname} (${c.codename})` : c.codename
      })) ?? [];
  }, [contributors]);
  const channelId = useAppSelector(app.selectors.currentChannelOrConversationId);
  const isMuted = useAppSelector(userIsMuted);
  const { openModal, setModalView } = useUI();
  const { cmix, sendMessage, sendReply } = useNetworkClient();
  const message = useAppSelector(app.selectors.messageDraft(channelId ?? ''));
  const deflatedContent = useMemo(() => deflate(message), [message]);
  const messageIsUnderLimit = useMemo(
    () => deflatedContent.length <= MESSAGE_MAX_SIZE,
    [deflatedContent]
  );
  const tags = useMemo(() => extractTagsFromMessage(message), [message]);
  const tooManyTags = replyToMessage
    ? tags.length > MESSAGE_TAGS_LIMIT - 1
    : tags.length > MESSAGE_TAGS_LIMIT;
  const placeholder = useMemo(
    () =>
      isMuted
        ? t('You have been muted by an admin and cannot send messages.')
        : t('Type your message here...'),
    [t, isMuted]
  );
  const replyMessageMarkup = useMemo(() => replyToMessage && replyToMessage.body, [replyToMessage]);
  const ctrlOrCmd = useMemo(() => {
    const isMac = navigator?.userAgent.indexOf('Mac') !== -1;
    return isMac ? { metaKey: true } : { ctrlKey: true };
  }, []);
  const [quill, setQuill] = useState<Quill | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [toolbarEnabled, toggleToolbar] = useToggle();


  // Update formats array to match registered formats
  const formats = useMemo(
    () => [
      'bold',
      'italic',
      'underline',
      'strike',
      'blockquote',
      'list',
      'mention',
      'link',
      'code',
      'code-block',
    ],
    []
  );

  const emojiIcon = "<svg class='i' viewBox='0 0 24 24'><use href='#emoticon-happy'></use></svg>";
  // Update modules configuration
  const modules = useMemo(() => ({
    toolbar: false,
    keyboard: {
      bindings: [
        {
          key: 'X',
          shiftKey: true,
          ...(ctrlOrCmd.metaKey ? { metaKey: true } : { ctrlKey: true }),
          handler(this: { quill: Quill }, range: Range) {
            const format = this.quill.getFormat(range) as QuillFormats;
            this.quill.format('strike', !format.strike, 'user');
          }
        },
        {
          key: 'Enter',
          handler() {
            enterEvent();
            return false;
          }
        },
        {
          key: '7',
          shiftKey: true,
          ...(ctrlOrCmd.metaKey ? { metaKey: true } : { ctrlKey: true }),
          handler(range: { index: number; length: number }) {
            const format = this.quill.getFormat(range.index, range.length);
            if (format.list) {
              this.quill.format('list', false, 'user');
            } else {
              this.quill.format('list', 'ordered', 'user');
            }
          }
        },
        {
          key: '8',
          shiftKey: true,
          ...(ctrlOrCmd.metaKey ? { metaKey: true } : { ctrlKey: true }),
          handler: function (this: { quill: Quill }, range: Range) {
            const format = this.quill.getFormat(range);
            this.quill.format('list', !format.list);
          }
        },
        {
          key: 'C',
          shiftKey: true,
          ...(ctrlOrCmd.metaKey ? { metaKey: true } : { ctrlKey: true }),
          handler: function (this: { quill: Quill }, range: Range) {
            const format = this.quill.getFormat(range);
            this.quill.format('code', !format.code);
          }
        },
        {
          key: 'C',
          shiftKey: true,
          altKey: true,
          ...(ctrlOrCmd.metaKey ? { metaKey: true } : { ctrlKey: true }),
          handler: function (this: { quill: Quill }, range: Range) {
            const format = this.quill.getFormat(range);
            this.quill.format('code-block', !format['code-block']);
          }
        },
        {
          key: '9',
          shiftKey: true,
          ...(ctrlOrCmd.metaKey ? { metaKey: true } : { ctrlKey: true }),
          handler: function (this: { quill: Quill }, range: Range) {
            const format = this.quill.getFormat(range);
            this.quill.format('blockquote', !format.blockquote);
          }
        },
        {
          key: 'U',
          shiftKey: false,
          ...(ctrlOrCmd.metaKey ? { metaKey: true } : { ctrlKey: true }),
          handler: function (this: { quill: Quill }, range: Range) {
            const format = this.quill.getFormat(range);
            this.quill.format('link', !format.link);
          }
        }
      ] as NormalizedBinding[]
    },
    clipboard: {
      matchVisual: false
    },
    autoDetectUrl: {
      urlRegularExpression: /(https?:\/\/|www\.)[\w-.]+\.[\w-.]+[\S]+/i
    },
    mention: {
      allowedChars: /^[A-Za-z\s]*$/,
      mentionDenotationChars: ['@'],
      source(searchTerm: string, renderList: (values: { id: string; value: string }[], search: string) => void) {
        const matches = atMentions.filter((v) =>
          v.value.toLowerCase().includes(searchTerm.toLowerCase())
        );
        renderList(matches, searchTerm);
      },
      renderItem(item: { id: string; value: string }) {
        return `<div>${item.value}</div>`;
      }
    },
  }), [ctrlOrCmd]);



  // Initialize Quill
  useEffect(() => {
    // Only initialize if we have a container and haven't initialized quill yet
    if (!containerRef.current) return;

    const initQuill = async () => {
      if (quill) return;
      try {
        const [
          { default: DetectUrl },
        ] = await Promise.all([
          import('quill-auto-detect-url'),
        ]);

        // Only register if not already registered
        if (!Quill.imports['blots/mention']) {
          Quill.register('blots/mention', MentionBlot);
        }
        if (!Quill.imports['modules/mention']) {
          Quill.register('modules/mention', Mention);
        }
        if (!Quill.imports['modules/autoDetectUrl']) {
          Quill.register('modules/autoDetectUrl', DetectUrl, true);
        }

        // Create Quill instance
        const quillInstance = new Quill(containerRef.current as HTMLElement, {
          theme: 'snow',
          modules: modules,
          formats: formats,
          placeholder: placeholder,
          readOnly: false,
          bounds: containerRef.current
        });

        setQuill(quillInstance);
      } catch (error) {
        console.error('Error initializing Quill:', error);
      }
    };

    // Initialize Quill
    initQuill();

  }, []);

  const insertEmoji = useCallback((emoji: string) => {
    if (!quill) {
      console.error('No quill instance found when inserting emoji');
      return;
    }
    const { index, length } = quill.getSelection(true);
    console.log('insertEmoji', emoji, index, length);
    quill.deleteText(index, length);
    quill.insertText(index, emoji);
    quill.setSelection(index + emoji.length, 0); // Move cursor after emoji
  }, [quill]);

  const insertMention = useCallback(() => {
    if (!quill) {
      console.error('No quill instance found when inserting mention');
      return;
    }
    const mention = quill.getModule('mention') as Mention;

    mention.openMenu('@');
  }, [quill]);


  const resetEditor = useCallback(() => {
    if (channelId) {
      dispatch(app.actions.clearMessageDraft(channelId));
    }
    quill?.setText('');
  }, [channelId, dispatch, quill]);

  const updateMessage = useCallback(
    (text: string) => {
      if (channelId) {
        const trimmed = text === '<p><br></p>' ? '' : text;
        console.log('updateMessage', trimmed);
        dispatch(app.actions.updateMessageDraft({ channelId, text: trimmed }));
      }
    },
    [channelId, dispatch]
  );

  useEffect(() => {
    if (!quill) {
      return;
    }
    quill.on('text-change', (_delta: unknown, _oldDelta: unknown, source: Sources) => {
      if (source === 'user' && updateMessage) {
        const html = quill.root.innerHTML;
        if (html !== message) {
          updateMessage(html);
        }
      }
    });
  }, [quill, updateMessage]);

  const sendCurrentMessage = useCallback(async () => {
    if (cmix && cmix.ReadyToSend && !cmix.ReadyToSend()) {
      setModalView('NETWORK_NOT_READY');
      openModal();
    } else {
      if (isMuted) {
        setModalView('USER_WAS_MUTED');
        openModal();
        return;
      }

      if (message.length === 0 || !messageIsUnderLimit || tooManyTags) {
        console.log('sendCurrentMessage cannot send: ', JSON.stringify({ messageLength: message.length, messageIsUnderLimit, tooManyTags }));
        return;
      }

      if (replyToMessage) {
        sendReply(deflatedContent, replyToMessage.id, tags);
      } else {
        sendMessage(deflatedContent, tags);
      }

      resetEditor();
    }

    dispatch(app.actions.replyTo(undefined));
  }, [
    dispatch,
    tooManyTags,
    cmix,
    setModalView,
    openModal,
    isMuted,
    message,
    resetEditor,
    messageIsUnderLimit,
    replyToMessage,
    sendReply,
    deflatedContent,
    sendMessage,
    tags
  ]);

  useEffect(() => {
    bus.addListener('enter', sendCurrentMessage);

    return () => {
      bus.removeListener('enter', sendCurrentMessage);
    };
  }, [sendCurrentMessage]);

  return (
    <EmojiPortal>
    <div className={`relative bg-charcoal-4-80 p-2 ${className || ''}`}>
      {replyToMessage && replyMessageMarkup && (
        <div className='flex justify-between mb-3 items-center'>
          <div className='text-charcoal-1'>
            {t('Replying to')} &nbsp;
            <Identity className='text-charcoal-3' {...replyToMessage} />
          </div>
          <button className='hover:bg-charcoal-3-20 hover:text-primary p-2 rounded-full'>
            <X
              className='w-5 h-5'
              onClick={() => {
                dispatch(app.actions.replyTo(undefined));
              }}
            />
          </button>
        </div>
      )}
      <div className='flex items-end'>
        <button
          onClick={toggleToolbar}
          className='p-1 text-charcoal-1 -ml-1 mr-0.5 rounded-full hover:bg-charcoal-3-20 leading-none hover:text-primary'
        >
          <RTF className='w-6 h-6' />
        </button>
        <div className='rounded-2xl bg-near-black flex-grow w-full'>
          {quill && (
            <CustomToolbar
              quill={quill}
              className={toolbarEnabled ? '' : 'hidden'}
            />
          )}
          <div className='flex w-full'>
            <div className="flex-grow">
              <div className={`w-full`}>
                <div ref={containerRef} className="w-full">
                  <div className="editor-container" />
                </div>
              </div>
            </div>
            <div className='px-1 flex items-center flex-shrink-0'>
              <ToolbarButton
                onClick={insertMention}
                className='text-charcoal-1 p-1 rounded-full hover:bg-charcoal-3-20 leading-none hover:text-primary'
              >
                <AtSign className='w-6 h-6' />
              </ToolbarButton>
              <ToolbarButton>
                <EmojiPicker onSelect={insertEmoji} />
              </ToolbarButton>
            </div>
          </div>
        </div>
        {tooManyTags && (
          <div className='text-red text-sm absolute bottom-full left-0 mb-1'>
            {t('Too many tags.')}
          </div>
        )}
        {!messageIsUnderLimit && (
          <div className='text-red text-sm absolute bottom-full left-0 mb-1'>
            {t('Message is too long.')}
          </div>
        )}
        <SendButton
          disabled={!messageIsUnderLimit || tooManyTags || isMuted}
          onClick={sendCurrentMessage}
        />
      </div>
    </div>
    </EmojiPortal>
  );
};

export default UserTextArea;
