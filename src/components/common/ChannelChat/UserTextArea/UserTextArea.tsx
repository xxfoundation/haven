import type { Message } from 'src/types';
import type { Quill, RangeStatic, StringMap } from 'quill';
import type { QuillAutoDetectUrlOptions } from 'quill-auto-detect-url'

import React, { FC, useEffect, useState, useCallback, useMemo } from 'react';
import cn from 'classnames';
import Clamp from 'react-multiline-clamp';
import dynamic from 'next/dynamic';
import EventEmitter from 'events';

import { Close } from 'src/components/icons';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useUI } from 'src/contexts/ui-context';
import s from './UserTextArea.module.scss';
import SendButton from '../SendButton';
import * as channels from 'src/store/channels';
import { useAppSelector } from 'src/store/hooks';
import Spinner from 'src/components/common/Spinner';

import { deflate, inflate } from '@utils/index';

export const bus = new EventEmitter();

const enterEvent = () => bus.emit('enter');

// const Editor = dynamic(
//   async () => {
//     const { default: ReactQuill } = await import('react-quill');
//     const QuillAutoDetectUrl = await import('quill-auto-detect-url');

//     ReactQuill.Quill.register('modules/autoDetectUrl', QuillAutoDetectUrl);

//     return ReactQuill;
//   },
//   { ssr: false, loading: () => <Spinner size='md' /> },
// );

const Editor = dynamic(
  () => import('react-quill').then((mod) => mod.default),
  { ssr: false, loading: () => <Spinner /> },
);

type Props = {
  scrollToEnd: () => void;
  replyToMessage: Message | null | undefined;
  setReplyToMessage: (msg: Message | null) => void;
};

const MESSAGE_MAX_SIZE = 700;


const UserTextArea: FC<Props> = ({
  replyToMessage,
  setReplyToMessage,
}) => {
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
      ? 'You have been muted by an admin and cannot send messages.'
      : 'Type your message here...',
    [isMuted]
  );
  const replyMessageMarkup = useMemo(() => replyToMessage && inflate(replyToMessage.body), [replyToMessage]);
  
  const loadQuillModules = useCallback(async () => {
    const Quill = (await import('react-quill')).default.Quill;
    const DetectUrl = (await import('quill-auto-detect-url')).default;

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
    toolbar: [
      ['bold', 'italic', 'strike'],
      ['link'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['blockquote', 'code', 'code-block'],
    ],
    autoDetectUrl: {
      urlRegularExpression: /(https?:\/\/|www\.)[\w-.]+\.[\w-.]+[\S]+/i,
    } as QuillAutoDetectUrlOptions,
    keyboard: {
      bindings: {
        strike: {
          key: 'S',
          ctrlKey: true,
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
          key: '7',
          shiftKey: true,
          ctrlKey: true,
          handler: function(this: { quill: Quill }, range: RangeStatic) {
            this.quill.formatLine(range.index, range.length, 'list', 'ordered');
          }
        },
        list: {
          key: '8',
          shiftKey: true,
          ctrlKey: true,
          handler: function(this: { quill: Quill }, range: RangeStatic) {
            const format = this.quill.getFormat(range);
            this.quill.format('list', !format.list);
          }
        },
        code: {
          key: 'C',
          shiftKey: true,
          ctrlKey: true,
          handler: function(this: { quill: Quill }, range: RangeStatic) {
            const format = this.quill.getFormat(range);
            this.quill.format('code', !format.code);
          }
        },
        codeblock: {
          key: '0',
          shiftKey: true,
          ctrlKey: true,
          handler: function(this: { quill: Quill }, range: RangeStatic) {
            const format = this.quill.getFormat(range);
            this.quill.format('code-block', !format['code-block']);
          }
        },
        blockquote: {
          key: '9',
          shiftKey: true,
          ctrlKey: true,
          handler: function(this: { quill: Quill }, range: RangeStatic) {
            const format = this.quill.getFormat(range);
            this.quill.format('blockquote', !format.blockquote);
          }
        },
        link: {
          key: 'L',
          ctrlKey: true,
          shiftKey: false,
          handler: function(this: { quill: Quill }, range: RangeStatic) {
            const format = this.quill.getFormat(range);
            this.quill.format('link', !format.link);
          }
        },
      }
    }
  }), []);

  const formats = useMemo(() => [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link',
    'code', 'code-block'
  ], []);

  return (
    <div className={cn('relative', s.textArea)}>
      {replyToMessage && replyMessageMarkup && (
        <div className={cn(s.replyContainer)}>
          <div className={s.replyHeader}>Replying to {replyToMessage.codename}</div>
          <Clamp lines={1}><p dangerouslySetInnerHTML={{ __html: replyMessageMarkup }}></p></Clamp>
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
      <div className={s.editorWrapper}>
        {editorLoaded && (
          <Editor
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
