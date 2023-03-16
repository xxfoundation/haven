import type { Message } from 'src/types';
import type { Quill, RangeStatic, StringMap } from 'quill';
import type { QuillAutoDetectUrlOptions } from 'quill-auto-detect-url'

import React, { FC, useEffect, useState, useCallback, useMemo } from 'react';
import cn from 'classnames';
import Clamp from 'react-multiline-clamp';
import dynamic from 'next/dynamic';
import EventEmitter from 'events';
import { Tooltip } from 'react-tooltip';
import { useTranslation } from 'react-i18next';

import { Close } from 'src/components/icons';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useUI } from 'src/contexts/ui-context';
import s from './UserTextArea.module.scss';
import SendButton from '../SendButton';
import * as channels from 'src/store/channels';
import * as messages from 'src/store/messages';
import { useAppSelector } from 'src/store/hooks';
import Spinner from 'src/components/common/Spinner';

import { deflate, inflate } from 'src/utils/index';

export const bus = new EventEmitter();

const enterEvent = () => bus.emit('enter');

const Editor = dynamic(
  () => import('react-quill').then((mod) => mod.default),
  { ssr: false, loading: () => <Spinner /> },
);

type Props = {
  className: string;
  replyToMessage: Message | null | undefined;
  setReplyToMessage: (msg: Message | null) => void;
};

const MESSAGE_MAX_SIZE = 700;

const CustomToolbar = () => {
  const { t } = useTranslation();
  return (
    <div id='custom-toolbar'>
      <span className='ql-formats'>
        <Tooltip className='text-center' anchorId='bold-button'>
          <strong>
            {t('Bold')}
          </strong>
          <br />
          CTRL/CMD + B
        </Tooltip>
        <button id='bold-button' className='ql-bold' />
        <Tooltip className='text-center' anchorId='italic-button'>
          <i>
            {t('Italic')}
          </i>
          <br />
          CTRL/CMD + I
        </Tooltip>
        <button id='italic-button' className='ql-italic' />
        <Tooltip className='text-center' anchorId='strike-button'>
          <s>
            {t('Strikethrough')}
          </s>
          <br />
          CTRL/CMD + SHIFT + X
        </Tooltip>
        <button id='strike-button' className='ql-strike' />
      </span>
      <span className='ql-formats'>
        <Tooltip className='text-center' anchorId='link-button'>
          <a>
            {t('Link')}
          </a>
          <br />
          CTRL/CMD + U
        </Tooltip>
        <button id='link-button' className='ql-link' />
      </span>
      <span className='ql-formats'>
        <Tooltip className='text-center' anchorId='ordered-list-button'>
          <ol>
            <li>
              {t('Ordered list')}
            </li>
          </ol>
          CTRL/CMD + SHIFT + 7
        </Tooltip>
        <button id='ordered-list-button' className='ql-list' value='ordered' />
        <Tooltip className='text-center' anchorId='unordered-list-button'>
          <ul>
            <li>
             {t('Bulleted list')}
            </li>
          </ul>
          CTRL/CMD + SHIFT + 8
        </Tooltip>
        <button id='unordered-list-button' className='ql-list' value='bullet' />
      </span>
      <span className='ql-formats'>
        <Tooltip className='text-center' anchorId='blockquote-button'>
          <blockquote style={{ display: 'inline-block', marginBottom: '0.25rem' }}>
            {t('Blockquote')}
          </blockquote>
          <br />
          CTRL/CMD + SHIFT + 9
        </Tooltip>
        <button id='blockquote-button' className='ql-blockquote' />
      </span>
      <span className='ql-formats'>
        <Tooltip className='text-center' anchorId='code-button'>
          <code>
            {t('Code')}
          </code>
          <br />
          CTRL/CMD + SHIFT + C
        </Tooltip>
        <button id='code-button' className='ql-code' />
        <Tooltip className='text-center' anchorId='code-block-button'>
          <pre style={{ margin: 0 }}>
            {t('Code block')}
          </pre>
          CTRL/CMD + SHIFT + ALT + C
        </Tooltip>
        <button id='code-block-button' className='ql-code-block' />
      </span>
    </div>
  );
};

// React quill takes the short bus to school because the modules prop is not reactive
// so we're instantiating a reference outside of the component, lol
let atMentions: { id: string, value: string }[] = [];

const UserTextArea: FC<Props> = ({
  className,
  replyToMessage,
  setReplyToMessage,
}) => {
  const { t } = useTranslation();
  const contributors = useAppSelector(messages.selectors.currentContributors);
  useEffect(() => {
    atMentions = contributors?.map((c) => ({ id: c.pubkey, value: c.codename })) ?? [];
  }, [contributors]);
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const { openModal, setModalView } = useUI();
  const {
    cmix,
    isMuted,
    sendMessage,
    sendReply
  } = useNetworkClient();
  const [editorLoaded, setEditorLoaded] = useState(false);
  const [message, setMessage] = useState('');
  const deflatedContent = useMemo(() => deflate(message), [message])
  const messageIsValid = useMemo(() => deflatedContent.length <= MESSAGE_MAX_SIZE, [deflatedContent])
  const placeholder = useMemo(
    () => isMuted
      ? t('You have been muted by an admin and cannot send messages.')
      : t('Type your message here...'),
    [t, isMuted]
  );
  const replyMessageMarkup = useMemo(() => replyToMessage && inflate(replyToMessage.body), [replyToMessage]);
  const ctrlOrCmd = useMemo(() => {
    const isMac = navigator?.userAgent.indexOf('Mac') !== -1;
    return isMac ? ({ metaKey: true }) : ({ ctrlKey: true });
  }, []);
  
  const loadQuillModules = useCallback(async () => {
    await import('quill-mention');
    const Quill = (await import('react-quill')).default.Quill;
    const DetectUrl = (await import('quill-auto-detect-url')).default;
    const Link = Quill.import('formats/link')
    const icons = Quill.import('ui/icons');

    icons['code-block'] = '<svg data-tml=\'true\' aria-hidden=\'true\' viewBox=\'0 0 20 20\'><path fill=\'currentColor\' fill-rule=\'evenodd\' d=\'M9.212 2.737a.75.75 0 1 0-1.424-.474l-2.5 7.5a.75.75 0 0 0 1.424.474l2.5-7.5Zm6.038.265a.75.75 0 0 0 0 1.5h2a.25.25 0 0 1 .25.25v11.5a.25.25 0 0 1-.25.25h-13a.25.25 0 0 1-.25-.25v-3.5a.75.75 0 0 0-1.5 0v3.5c0 .966.784 1.75 1.75 1.75h13a1.75 1.75 0 0 0 1.75-1.75v-11.5a1.75 1.75 0 0 0-1.75-1.75h-2Zm-3.69.5a.75.75 0 1 0-1.12.996l1.556 1.753-1.556 1.75a.75.75 0 1 0 1.12.997l2-2.248a.75.75 0 0 0 0-.996l-2-2.252ZM3.999 9.06a.75.75 0 0 1-1.058-.062l-2-2.248a.75.75 0 0 1 0-.996l2-2.252a.75.75 0 1 1 1.12.996L2.504 6.251l1.557 1.75a.75.75 0 0 1-.062 1.06Z\' clip-rule=\'evenodd\'></path></svg>';
    Link.PROTOCOL_WHITELIST = ['http', 'https', 'mailto', 'tel', 'radar', 'rdar', 'smb', 'sms']
    
    class CustomLinkSanitizer extends Link {
      static sanitize(url: string) {
        const sanitizedUrl = super.sanitize(url)
    
        if (!sanitizedUrl || sanitizedUrl === 'about:blank') return sanitizedUrl
    
        const hasWhitelistedProtocol = this.PROTOCOL_WHITELIST
          .some((protocol: string)  => sanitizedUrl.startsWith(protocol))
    
        if (hasWhitelistedProtocol) return sanitizedUrl
    
        return `https://${sanitizedUrl}`
      }
    }

    Quill.register(CustomLinkSanitizer, true)
    Quill.register('modules/autoDetectUrl', DetectUrl);

    setEditorLoaded(true);
  }, []);

  useEffect(() => {
    loadQuillModules();
  }, [loadQuillModules])

  const resetEditor = useCallback(() => {
    setMessage('');
  }, []);

  useEffect(() => {
    if (currentChannel?.id) {
      resetEditor();
    }
  }, [currentChannel?.id, resetEditor]);

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

      if (message.length === 0 || !messageIsValid) {
        return;
      }

      if (replyToMessage) {
        sendReply(deflatedContent, replyToMessage.id);
      } else {
        sendMessage(deflatedContent);
      }

      resetEditor();
    }

    setReplyToMessage(null);
  }, [
    cmix,
    setReplyToMessage,
    setModalView,
    openModal,
    isMuted,
    message,
    resetEditor,
    messageIsValid,
    replyToMessage,
    sendReply,
    deflatedContent,
    sendMessage
  ]);

  useEffect(() => {
    bus.addListener('enter', sendCurrentMessage)

    return () => { bus.removeListener('enter', sendCurrentMessage) };
  }, [sendCurrentMessage]);

  const modules  = useMemo<StringMap>(() => ({
    toolbar: {
      container: '#custom-toolbar'
    },
    autoDetectUrl: {
      urlRegularExpression: /(https?:\/\/|www\.)[\w-.]+\.[\w-.]+[\S]+/i,
    } as QuillAutoDetectUrlOptions,
    mention: {
      allowedChars: /^[A-Za-z]*$/,
      mentionDenotationChars: ['@'],
      source: function(searchTerm: string, renderList: (values: { id: string, value: string }[], search: string) => void) {
        const matches = atMentions.filter((v) => v.value.toLocaleLowerCase().startsWith(searchTerm.toLocaleLowerCase()));
        renderList(matches, searchTerm);
      }
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
          shiftKey: true,
          handler: function(this: { quill: Quill }, range: RangeStatic) {
            const format = this.quill.getFormat(range);
            this.quill.format('link', !format.link);
          }
        },
      }
    }
  }), [ctrlOrCmd]);

  const formats = useMemo(() => [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link',
    'code', 'code-block',
    'mention'
  ], []);

  return (
    <div className={cn('relative', s.textArea, className)}>
      {replyToMessage && replyMessageMarkup && (
        <div className={cn(s.replyContainer)}>
          <div className={s.replyHeader}>
            {t('Replying to {{codename}}', { codename: replyToMessage.codename })}
          </div>
          <Clamp lines={1}>
            <pre dangerouslySetInnerHTML={{ __html: replyMessageMarkup }} />
          </Clamp>
          <Close
            className={s.closeButton}
            width={14}
            height={14}
            fill={'var(--orange)'}
            onClick={() => {
              setReplyToMessage(null);
            }}
          />
        </div>
      )}
      <div className={cn('editor', s.editorWrapper)}>
        <CustomToolbar />
        {editorLoaded && (
          <Editor
            preserveWhitespace
            value={message}
            theme='snow'
            formats={formats}
            modules={modules}
            onChange={setMessage}
            placeholder={placeholder} />
        )}
        <SendButton
          disabled={!messageIsValid}
          className={s.button}
          onClick={sendCurrentMessage}
        />
      </div>

    </div>
  );
};

export default UserTextArea;
