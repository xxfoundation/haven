import { default as ReactQuill, ReactQuillProps } from 'react-quill';
import { Quill, RangeStatic, StringMap } from 'quill';
import type { QuillAutoDetectUrlOptions } from 'quill-auto-detect-url'
import React, { FC, useEffect, useState, useCallback, useMemo, useRef, HTMLAttributes } from 'react';
import cn from 'classnames';
import dynamic from 'next/dynamic';
import EventEmitter from 'events';
import { Tooltip } from 'react-tooltip';
import { useTranslation } from 'react-i18next';

import { useNetworkClient } from 'src/contexts/network-client-context';
import { useUI } from 'src/contexts/ui-context';
import s from './UserTextArea.module.scss';
import SendButton from '../SendButton';
import * as app from 'src/store/app';
import * as messages from 'src/store/messages';
import { userIsMuted } from 'src/store/selectors';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import Spinner from 'src/components/common/Spinner';

import { deflate } from 'src/utils/index';
import { MESSAGE_TAGS_LIMIT } from 'src/constants';
import X from '@components/icons/X';
import Identity from '@components/common/Identity';
import { replyingToMessage } from 'src/store/selectors';
import { EmojiPicker } from '@components/common/EmojiPortal';
import AtSign from '@components/icons/AtSign';
import RTF from '@components/icons/RTF';
import { useOnClickOutside, useToggle } from 'usehooks-ts';
import Bold from '@components/icons/Bold';
import Italics from '@components/icons/Italics';
import Strikethrough from '@components/icons/Strikethrough';
import LinkIcon from '@components/icons/Link';
import OrderedList from '@components/icons/OrderedList';
import BulletList from '@components/icons/BulletList';
import Blockquote from '@components/icons/Blockquote';
import Code from '@components/icons/Code';
import CodeBlock from '@components/icons/CodeBlock';
import Input from '@components/common/Input';
import Button from '@components/common/Button';
import useInput from 'src/hooks/useInput';

export const bus = new EventEmitter();

const enterEvent = () => bus.emit('enter');

const extractTagsFromMessage = (message: string) => {
  const idAttributeRegex = /data-id="([^"]+)"/gi;
  const ids = new Set<string>();
  let matches;
  while (matches = idAttributeRegex.exec(message)) {
    ids.add(matches[1]);
  }

  return Array.from(ids);
}

const ToolbarButton: FC<Omit<HTMLAttributes<HTMLButtonElement>, 'active'> & { active?: boolean }> = (props) => (
  <button
    {...props}
    className={cn(
      props.className,
      {
        'bg-charcoal-3-20 text-primary': props.active
      },
      'text-charcoal-1 p-1 rounded-full hover:bg-charcoal-3-20 hover:text-primary leading-none'
    )}>
    {props.children}
  </button>
)


const Editor = dynamic(
  async () => {
    const { default: RQ } = await import('react-quill');

    return ({ forwardedRef, ...props }: ReactQuillProps & { forwardedRef: React.LegacyRef<ReactQuill>}) => <RQ {...props}  ref={forwardedRef} />;
  },
  { ssr: false, loading: () => <Spinner /> },
);

type Props = {
  className: string;
};

const MESSAGE_MAX_SIZE = 700;

type CustomToolbarProps = {
  quill: Quill;
  className?: string;
}

const useCurrentFormats = (quill: Quill) => {
  const [selection, setSelection] = useState(quill.getSelection());
  const formats = useMemo(() => selection && quill.getFormat(selection), [quill, selection]);

  useEffect(() => {
    const onSelectionChange = () => {
      setSelection(quill.getSelection());
    }

    quill.on('editor-change', onSelectionChange);

    return () => {
      quill.off('editor-change', onSelectionChange);
    }
  }, [quill]);


  const toggle = useCallback((format: string, value?: string) => {
    if (format === 'list' && value === 'ordered') {
      if (formats?.list) {
        quill.format(format, false);
      } else {
        quill.formatLine(selection?.index ?? 0, selection?.length ?? 0, 'list', 'ordered');
      }
    } else {
      quill.format(format, value !== undefined ? value : !formats?.[format]);
    }
    setSelection(quill.getSelection());
  }, [formats, quill, selection?.index, selection?.length])

  return {
    selection,
    formats,
    toggle
  }
}

const CustomToolbar: FC<CustomToolbarProps> = ({ className, quill }) => {
  const { t } = useTranslation();
  const { formats, selection, toggle } = useCurrentFormats(quill);
  const [linkMenuOpened, setLinkMenuOpened] = useState(false);
  const [linkInput, onLinkInputChanged, linkInputControls] = useInput();
  const [savedSelection, setSavedSelection] = useState<RangeStatic | null>(null);
  const linkMenuRef = useRef<HTMLDivElement>(null);

  useOnClickOutside(linkMenuRef, () => {
    setLinkMenuOpened(false);
    linkInputControls.set('');
  });

  const saveSelection = useCallback(() => {
    const range = quill.getSelection();
    if (!range) { return }
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
      quill.format('link', text);
      saveSelection();
      linkInputControls.set(text);
      setLinkMenuOpened(true);
    } else {
      quill.format('link', false);
    }
  }, [formats?.link, linkInputControls, quill, saveSelection, selection?.index, selection?.length]);

  const handleApplyLink = useCallback(() => {
    if (savedSelection) {
      if (savedSelection.length === 0) {
        quill.insertText(savedSelection.index, linkInput);
      }
      quill.formatText(savedSelection.index, savedSelection.length || linkInput.length, 'link', linkInput);
      setLinkMenuOpened(false);
      setSavedSelection(null);
    }
  }, [linkInput, quill, savedSelection]);

  useEffect(() => {
    if (!formats?.link && !savedSelection) {
      setLinkMenuOpened(false);
    }
  }, [formats?.link, savedSelection])

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
        linkInputControls.set(link);
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
    <div className={cn(className, 'px-2 pt-2 space-x-2')}>
      <ToolbarButton
        active={formats?.bold}
        onClick={() => { toggle('bold') }}
        id='bold-button'>
        <Bold />
      </ToolbarButton>
      <Tooltip className='text-center' anchorId='bold-button'>
        <strong>
          {t('Bold')}
        </strong>
        <br />
        CTRL/CMD + B
      </Tooltip>
      <Tooltip
        className='text-center' anchorId='italic-button'>
        <i>
          {t('Italic')}
        </i>
        <br />
        CTRL/CMD + I
      </Tooltip>
      <ToolbarButton
        active={formats?.italic}
        onClick={() => { toggle('italic') }}
        id='italic-button'>
        <Italics />
      </ToolbarButton>
      <Tooltip className='text-center' anchorId='strike-button'>
        <s>
          {t('Strikethrough')}
        </s>
        <br />
        CTRL/CMD + SHIFT + X
      </Tooltip>
      <ToolbarButton
        active={formats?.strike}
        onClick={() => { toggle('strike') }}
      id='strike-button'>
        <Strikethrough />
      </ToolbarButton>
      <Tooltip className='text-center' anchorId='link-button'>
        <a>
          {t('Link')}
        </a>
        <br />
        CTRL/CMD + U
      </Tooltip>
      <ToolbarButton
        active={formats?.link}
        onClick={onLinkClicked}
        id='link-button'>
        <LinkIcon />
      </ToolbarButton>
      <div
        ref={linkMenuRef}
        onMouseDown={saveSelection}
        className={cn(
          { 'hidden': !linkMenuOpened },
          'flex w-[25rem] items-center space-x-2 absolute bottom-[100%] bg-charcoal-4-80 backdrop-blur-lg rounded-xl p-4'
        )}>
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
            size='sm' />
          <button
            onClick={() => { linkInputControls.set('') }}
            className='absolute right-1.5 bottom-[0.425rem] bg-charcoal-3 rounded-full p-0.5 hover:bg-charcoal-2 transition-all'>
            <X className='w-4 h-4' />
          </button>
        </div>
        <Button onClick={handleApplyLink} size='sm'>
          {t('Save')}
        </Button>
      </div>
      <Tooltip className='text-center' anchorId='ordered-list-button'>
        <ol>
          <li>
            {t('Ordered list')}
          </li>
        </ol>
        CTRL/CMD + SHIFT + 7
      </Tooltip>
      <ToolbarButton
        active={formats?.list === 'ordered'}
        onClick={() => toggle('list', 'ordered')}
        id='ordered-list-button'>
        <OrderedList />
      </ToolbarButton>
      <Tooltip className='text-center' anchorId='unordered-list-button'>
        <ul>
          <li>
            {t('Bulleted list')}
          </li>
        </ul>
        CTRL/CMD + SHIFT + 8
      </Tooltip>
      <ToolbarButton
        active={formats?.list === 'bullet'}
        onClick={() => toggle('list')}
        id='unordered-list-button' className='ql-list'>
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
        id='blockquote-button'>
        <Blockquote />
      </ToolbarButton>
      <Tooltip className='text-center' anchorId='code-button'>
        <code>
          {t('Code')}
        </code>
        <br />
        CTRL/CMD + SHIFT + C
      </Tooltip>
      <ToolbarButton
        active={formats?.code}
        onClick={() => toggle('code')}
        id='code-button'>
        <Code />
      </ToolbarButton>
      <Tooltip className='text-center' anchorId='code-block-button'>
        <pre style={{ margin: 0 }}>
          {t('Code block')}
        </pre>
        CTRL/CMD + SHIFT + ALT + C
      </Tooltip>
      <ToolbarButton
        active={formats?.['code-block']}
        onClick={() => toggle('code-block')}
        id='code-block-button'>
        <CodeBlock />
      </ToolbarButton>
    </div>
  );
};

// React quill takes the short bus to school because the modules prop is not reactive
// so we're instantiating a reference outside of the component, lol
let atMentions: { id: string, value: string }[] = [];

const UserTextArea: FC<Props> = ({ className }) => {
  const replyToMessage = useAppSelector(replyingToMessage);
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const contributors = useAppSelector(messages.selectors.currentContributors);
  useEffect(() => {
    atMentions = contributors?.map((c) => ({ id: c.pubkey, value: c.nickname ? `${c.nickname} (${c.codename})` : c.codename })) ?? [];
  }, [contributors]);
  const channelId = useAppSelector(app.selectors.currentChannelOrConversationId);
  const isMuted = useAppSelector(userIsMuted);
  const { openModal, setModalView } = useUI();
  const { cmix, sendMessage, sendReply } = useNetworkClient();
  const [editorLoaded, setEditorLoaded] = useState(false);
  const message = useAppSelector(app.selectors.messageDraft(channelId ?? ''))
  const deflatedContent = useMemo(() => deflate(message), [message]);
  const messageIsUnderLimit = useMemo(() => deflatedContent.length <= MESSAGE_MAX_SIZE, [deflatedContent]);
  const tags = useMemo(() => extractTagsFromMessage(message), [message]);
  const tooManyTags = replyToMessage
    ? tags.length > MESSAGE_TAGS_LIMIT - 1
    : tags.length > MESSAGE_TAGS_LIMIT;
  const placeholder = useMemo(
    () => isMuted
      ? t('You have been muted by an admin and cannot send messages.')
      : t('Type your message here...'),
    [t, isMuted]
  );
  const replyMessageMarkup = useMemo(() => replyToMessage && replyToMessage.body, [replyToMessage]);
  const ctrlOrCmd = useMemo(() => {
    const isMac = navigator?.userAgent.indexOf('Mac') !== -1;
    return isMac ? ({ metaKey: true }) : ({ ctrlKey: true });
  }, []);
  const editorRef = useRef<ReactQuill>(null);
  const [toolbarEnabled, toggleToolbar] = useToggle();

  const insertEmoji = useCallback((emoji: string) => {
    const quill = editorRef.current?.editor;
    if (!quill) { return }
    const { index, length } = quill.getSelection(true);
    quill.deleteText(index, length);
    quill.insertEmbed(index, 'emoji', emoji, 'user');
    setTimeout(() => quill.setSelection(index + emoji.length, 0), 0);
  }, []);

  const insertMention = useCallback(() => {
    const quill = editorRef.current?.editor;
    if (!quill) { return }
    const mention = quill.getModule('mention');

    mention.openMenu('@');
  }, [])

  const loadQuillModules = useCallback(async () => {
    await import('quill-mention');
    const QuillInstance = (await import('react-quill')).default.Quill;
    const DetectUrl = (await import('quill-auto-detect-url')).default;
    const ShortNameEmoji = (await import('src/quill/ShortNameEmoji')).default;
    const Link = QuillInstance.import('formats/link')
    const icons = QuillInstance.import('ui/icons');
    const EmojiBlot = (await import('src/quill/EmojiBlot')).default;

    icons['code-block'] = '<svg data-tml=\'true\' aria-hidden=\'true\' viewBox=\'0 0 20 20\'><path fill=\'currentColor\' fillRule=\'evenodd\' d=\'M9.212 2.737a.75.75 0 1 0-1.424-.474l-2.5 7.5a.75.75 0 0 0 1.424.474l2.5-7.5Zm6.038.265a.75.75 0 0 0 0 1.5h2a.25.25 0 0 1 .25.25v11.5a.25.25 0 0 1-.25.25h-13a.25.25 0 0 1-.25-.25v-3.5a.75.75 0 0 0-1.5 0v3.5c0 .966.784 1.75 1.75 1.75h13a1.75 1.75 0 0 0 1.75-1.75v-11.5a1.75 1.75 0 0 0-1.75-1.75h-2Zm-3.69.5a.75.75 0 1 0-1.12.996l1.556 1.753-1.556 1.75a.75.75 0 1 0 1.12.997l2-2.248a.75.75 0 0 0 0-.996l-2-2.252ZM3.999 9.06a.75.75 0 0 1-1.058-.062l-2-2.248a.75.75 0 0 1 0-.996l2-2.252a.75.75 0 1 1 1.12.996L2.504 6.251l1.557 1.75a.75.75 0 0 1-.062 1.06Z\' clipRule=\'evenodd\'></path></svg>';
    Link.PROTOCOL_WHITELIST = ['http', 'https', 'mailto', 'tel', 'radar', 'rdar', 'smb', 'sms']
    
    class CustomLinkSanitizer extends Link {
      static sanitize(url: string) {
        const sanitizedUrl = super.sanitize(url)
    
        if (!sanitizedUrl || sanitizedUrl === 'about:blank') return sanitizedUrl
        
        const hasWhitelistedProtocol = this.PROTOCOL_WHITELIST
          .some((protocol: string)  => sanitizedUrl?.startsWith(protocol))
    
        if (hasWhitelistedProtocol) return sanitizedUrl
    
        return `https://${sanitizedUrl}`
      }
    }

    QuillInstance.register('formats/emoji', EmojiBlot);
    QuillInstance.register('modules/shortNameEmoji', ShortNameEmoji);
    QuillInstance.register(CustomLinkSanitizer, true)
    QuillInstance.register('modules/autoDetectUrl', DetectUrl);
    
    setEditorLoaded(true);
  }, []);

  useEffect(() => {
    loadQuillModules();
  }, [loadQuillModules]);

  const resetEditor = useCallback(() => {
    if (channelId) {
      dispatch(app.actions.clearMessageDraft(channelId));
    }
  }, [channelId, dispatch]);

  const updateMessage = useCallback((text: string) => {
    if (channelId) {
      const trimmed = text === '<p><br></p>' ? '' : text;
      dispatch(app.actions.updateMessageDraft({ channelId, text: trimmed }));
    }
  }, [channelId, dispatch]);

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
    bus.addListener('enter', sendCurrentMessage)

    return () => { bus.removeListener('enter', sendCurrentMessage) };
  }, [sendCurrentMessage]);

  const modules  = useMemo<StringMap>(() => ({
    toolbar: false,
    shortNameEmoji: true,
    autoDetectUrl: {
      urlRegularExpression: /(https?:\/\/|www\.)[\w-.]+\.[\w-.]+[\S]+/i,
    } as QuillAutoDetectUrlOptions,
    mention: {
      allowedChars: /^[A-Za-z]*$/,
      mentionDenotationChars: ['@'],
      source: function(searchTerm: string, renderList: (values: { id: string, value: string }[], search: string) => void) {
        const matches = atMentions.filter((v) => v.value.toLocaleLowerCase().startsWith(searchTerm.toLocaleLowerCase()));
        renderList(matches, searchTerm);
      },
    },
    keyboard: {
      bindings: {
        strike: {
          ...ctrlOrCmd,
          key: 'X',
          shiftKey: true,
          handler: function(this: { quill: Quill }, range: RangeStatic) {
            const format = this.quill.getFormat(range);
            this.quill.format('strike', !format.strike);
          }
        },
        enter: {
          key: 'Enter',
          handler: () => {
            enterEvent();
          }
        },
        listOrdered: {
          ...ctrlOrCmd,
          key: '7',
          shiftKey: true,
          handler: function(this: { quill: Quill }, range: RangeStatic) {
            const format = this.quill.getFormat(range);
            if (format.list) {
              this.quill.format('list', false);
            } else {
              this.quill.formatLine(range.index, range.length, 'list', 'ordered');
            }
          }
        },
        list: {
          ...ctrlOrCmd,
          key: '8',
          shiftKey: true,
          handler: function(this: { quill: Quill }, range: RangeStatic) {
            const format = this.quill.getFormat(range);
            this.quill.format('list', !format.list);
          }
        },
        code: {
          ...ctrlOrCmd,
          key: 'C',
          shiftKey: true,
          handler: function(this: { quill: Quill }, range: RangeStatic) {
            const format = this.quill.getFormat(range);
            this.quill.format('code', !format.code);
          }
        },
        codeblock: {
          ...ctrlOrCmd,
          key: 'C',
          shiftKey: true,
          altKey: true,
          handler: function(this: { quill: Quill }, range: RangeStatic) {
            const format = this.quill.getFormat(range);
            this.quill.format('code-block', !format['code-block']);
          }
        },
        blockquote: {
          ...ctrlOrCmd,
          key: '9',
          shiftKey: true,
          handler: function(this: { quill: Quill }, range: RangeStatic) {
            const format = this.quill.getFormat(range);
            this.quill.format('blockquote', !format.blockquote);
          }
        },
        link: {
          ...ctrlOrCmd,
          key: 'U',
          shiftKey: false,
          handler: function(this: { quill: Quill }, range: RangeStatic) {
            const format = this.quill.getFormat(range);
            this.quill.format('link', !format.link);
          }
        },
      }
    }
  }), [ctrlOrCmd]);

  const formats = useMemo(() => [
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link',
    'code', 'code-block',
    'mention',
    'emoji'
  ], []);

  return (
    <div className={cn('relative bg-charcoal-4-80 p-2', s.textArea, className)}>
      {replyToMessage && replyMessageMarkup && (
        <div className='flex justify-between mb-3 items-center'>
          <div className={s.replyHeader}>
            {t('Replying to')} &nbsp;<Identity className='text-charcoal-3-important' {...replyToMessage} />
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
        <div className='rounded-2xl bg-near-black flex-grow'>
          {(editorLoaded && editorRef.current?.editor) && (
            <CustomToolbar quill={editorRef.current.editor} className={cn({
              hidden: !toolbarEnabled,
            })} />
          )}
          <div className='flex'>
            {editorLoaded && (
              <Editor
                className={cn('flex-grow', { 'text-red': isMuted })}
                forwardedRef={editorRef}
                id='editor'
                preserveWhitespace
                value={message}
                theme='snow'
                formats={formats}
                modules={modules}
                onChange={updateMessage}
                placeholder={placeholder} />
            )}
            <div className='px-1 flex items-center'>
              <ToolbarButton
                onClick={insertMention}
                className='text-charcoal-1 p-1 rounded-full hover:bg-charcoal-3-20 leading-none hover:text-primary'>
                <AtSign className='w-6 h-6' />
              </ToolbarButton>
              <ToolbarButton>
                <EmojiPicker className='w-6 h-6' onSelect={insertEmoji} />
              </ToolbarButton>
            </div>
          </div>
        </div>
        {tooManyTags && (
          <div className={s.error}>
            {t('Too many tags.')}
          </div>
        )}
        {!messageIsUnderLimit && (
          <div className={s.error}>
            {t('Message is too long.')}
          </div>
        )}
        <SendButton
          disabled={!messageIsUnderLimit || tooManyTags || isMuted}
          onClick={sendCurrentMessage}
        />
      </div>

    </div>
  );
};

export default UserTextArea;
