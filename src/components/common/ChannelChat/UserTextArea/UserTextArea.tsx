import type { EditorProps, SyntheticKeyboardEvent } from 'react-draft-wysiwyg';
import type { Message } from 'src/types';

import React, { FC, useEffect, useState, useCallback, useMemo } from 'react';
import cn from 'classnames';
import Clamp from 'react-multiline-clamp';
import dynamic from 'next/dynamic';
import { convertToRaw, EditorState, RichUtils } from 'draft-js';

import { Close } from 'src/components/icons';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useUI } from 'src/contexts/ui-context';
import s from './UserTextArea.module.scss';
import SendButton from '../SendButton';
import * as channels from 'src/store/channels';
import { useAppSelector } from 'src/store/hooks';

import 'react-draft-wysiwyg/dist/react-draft-wysiwyg.css';
import { deflateContent, deflatedMessageToMarkup, resetEditorState } from '@utils/index';
import { Tooltip } from 'react-tooltip';

const Editor = dynamic<EditorProps>(
  () => import('react-draft-wysiwyg').then((mod) => mod.Editor),
  { ssr: false }
)

type Props = {
  scrollToEnd: () => void;
  replyToMessage: Message | null | undefined;
  setReplyToMessage: (msg: Message | null) => void;
};

const MESSAGE_MAX_SIZE = 700;

type CustomEditorButton = {
  onChange: (editorState: EditorState) => void;
  editorState: EditorState;
}

const createCustomButton = (
  type: 'block' | 'style',
  key: string,
  icon: React.ReactNode,
  tooltip?: React.ReactNode
): FC<CustomEditorButton> => ({ editorState, onChange }) => {
  const func = type ===  'block' ? 'toggleBlockType' : 'toggleInlineStyle';
  const toggleCode = useCallback(() => {
    const newState = RichUtils[func](editorState, key);

    if (newState) {
      onChange(newState);
    }
  }, [onChange, func, editorState]);

  const currentSelection = editorState.getSelection();
  const currentKey = currentSelection.getStartKey();
  const currentBlock = editorState.getCurrentContent().getBlockForKey(currentKey);
  const blockType = currentBlock.getType();
  const id = `${type}-${key}-tooltip`;
  return (
    <>
      <Tooltip anchorId={id}>
        {tooltip}
      </Tooltip>
      <button
        id={id}
        title={key.toLocaleLowerCase()}
        className={cn('rdw-option-wrapper', { 'rdw-option-active': editorState.getCurrentInlineStyle().has(key) || blockType === key })} 
        onClick={toggleCode}>
        {icon}
      </button>
    </>
  );
}

const Bold = createCustomButton(
  'style',
  'BOLD',
  <svg viewBox='0 0 20 20'>
    <path fill='currentColor' fill-rule='evenodd' d='M4 2.75A.75.75 0 0 1 4.75 2h6.343a3.908 3.908 0 0 1 3.88 3.449A2.21 2.21 0 0 1 15 5.84l.001.067a3.901 3.901 0 0 1-1.551 3.118A4.627 4.627 0 0 1 11.875 18H4.75a.75.75 0 0 1-.75-.75V9.5a.75.75 0 0 1 .032-.218A.75.75 0 0 1 4 9.065V2.75Zm2.5 5.565h3.593a2.157 2.157 0 1 0 0-4.315H6.5v4.315Zm4.25 1.935H6.5v5.5h4.25a2.75 2.75 0 1 0 0-5.5Z' clip-rule='evenodd'></path>
  </svg>,
  'CTRL/CMD + B'
);

const Italic = createCustomButton(
  'style',
  'ITALIC',
  <svg viewBox='0 0 20 20'>
    <path fill='currentColor' fill-rule='evenodd' d='M7 2.75A.75.75 0 0 1 7.75 2h7.5a.75.75 0 0 1 0 1.5H12.3l-2.6 13h2.55a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5H7.7l2.6-13H7.75A.75.75 0 0 1 7 2.75Z' clip-rule='evenodd'></path>
  </svg>,
  'CTRL/CMD + I'
);

const Strikethrough = createCustomButton(
  'style',
  'STRIKETHROUGH',
  <svg viewBox='0 0 20 20'><path fill='currentColor' fill-rule='evenodd' d='M11.721 3.84c-.91-.334-2.028-.36-3.035-.114-1.51.407-2.379 1.861-2.164 3.15C6.718 8.051 7.939 9.5 11.5 9.5a.76.76 0 0 1 .027.001h5.723a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1 0-1.5h3.66c-.76-.649-1.216-1.468-1.368-2.377-.347-2.084 1.033-4.253 3.265-4.848l.007-.002.007-.002c1.252-.307 2.68-.292 3.915.16 1.252.457 2.337 1.381 2.738 2.874a.75.75 0 0 1-1.448.39c-.25-.925-.91-1.528-1.805-1.856Zm2.968 9.114a.75.75 0 1 0-1.378.59c.273.64.186 1.205-.13 1.674-.333.492-.958.925-1.82 1.137-.989.243-1.991.165-3.029-.124-.93-.26-1.613-.935-1.858-1.845a.75.75 0 0 0-1.448.39c.388 1.441 1.483 2.503 2.903 2.9 1.213.338 2.486.456 3.79.135 1.14-.28 2.12-.889 2.704-1.753.6-.888.743-1.992.266-3.104Z' clip-rule='evenodd'></path></svg>
);

const Code = createCustomButton(
  'style',
  'CODE',
  <svg viewBox='0 0 20 20'><path fill='currentColor' fill-rule='evenodd' d='M12.48 2.926a.75.75 0 0 0-1.46-.352l-3.5 14.5a.75.75 0 0 0 1.46.352l3.5-14.5ZM5.763 5.204a.75.75 0 0 0-1.06.032l-4 4.25a.75.75 0 0 0 0 1.028l4 4.25a.75.75 0 0 0 1.092-1.028L2.28 10l3.516-3.736a.75.75 0 0 0-.032-1.06Zm8.472 0a.75.75 0 0 1 1.06.032l4 4.25a.75.75 0 0 1 0 1.028l-4 4.25a.75.75 0 0 1-1.092-1.028L17.72 10l-3.516-3.736a.75.75 0 0 1 .032-1.06Z' clip-rule='evenodd'></path></svg>
)

const CodeBlock = createCustomButton(
  'block',
  'code-block',
  <svg aria-hidden='true' viewBox='0 0 20 20'>
    <path fill='currentColor' fill-rule='evenodd' d='M9.212 2.737a.75.75 0 1 0-1.424-.474l-2.5 7.5a.75.75 0 0 0 1.424.474l2.5-7.5Zm6.038.265a.75.75 0 0 0 0 1.5h2a.25.25 0 0 1 .25.25v11.5a.25.25 0 0 1-.25.25h-13a.25.25 0 0 1-.25-.25v-3.5a.75.75 0 0 0-1.5 0v3.5c0 .966.784 1.75 1.75 1.75h13a1.75 1.75 0 0 0 1.75-1.75v-11.5a1.75 1.75 0 0 0-1.75-1.75h-2Zm-3.69.5a.75.75 0 1 0-1.12.996l1.556 1.753-1.556 1.75a.75.75 0 1 0 1.12.997l2-2.248a.75.75 0 0 0 0-.996l-2-2.252ZM3.999 9.06a.75.75 0 0 1-1.058-.062l-2-2.248a.75.75 0 0 1 0-.996l2-2.252a.75.75 0 1 1 1.12.996L2.504 6.251l1.557 1.75a.75.75 0 0 1-.062 1.06Z' clip-rule='evenodd'></path>
  </svg>,
  'CTRL/CMD J'
);

const OrderedList = createCustomButton(
  'block',
  'ordered-list-item',
  <svg viewBox='0 0 20 20'>
    <path fill='currentColor' fill-rule='evenodd' d='M3.792 2.094A.5.5 0 0 1 4 2.5V6h1a.5.5 0 1 1 0 1H2a.5.5 0 1 1 0-1h1V3.194l-.842.28a.5.5 0 0 1-.316-.948l1.5-.5a.5.5 0 0 1 .45.068ZM7.75 3.5a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5h-10ZM7 10.75a.75.75 0 0 1 .75-.75h10a.75.75 0 0 1 0 1.5h-10a.75.75 0 0 1-.75-.75Zm0 6.5a.75.75 0 0 1 .75-.75h10a.75.75 0 0 1 0 1.5h-10a.75.75 0 0 1-.75-.75Zm-4.293-3.36a.997.997 0 0 1 .793-.39c.49 0 .75.38.75.75 0 .064-.033.194-.173.409a5.146 5.146 0 0 1-.594.711c-.256.267-.552.548-.87.848l-.088.084a41.6 41.6 0 0 0-.879.845A.5.5 0 0 0 2 18h3a.5.5 0 0 0 0-1H3.242l.058-.055c.316-.298.629-.595.904-.882a6.1 6.1 0 0 0 .711-.859c.18-.277.335-.604.335-.954 0-.787-.582-1.75-1.75-1.75a1.998 1.998 0 0 0-1.81 1.147.5.5 0 1 0 .905.427.996.996 0 0 1 .112-.184Z' clip-rule='evenodd'></path>
  </svg>
);

const UnorderedList = createCustomButton(
  'block',
  'unordered-list-item',
  <svg viewBox='0 0 20 20'>
    <path fill='currentColor' fill-rule='evenodd' d='M4 3a1 1 0 1 1-2 0 1 1 0 0 1 2 0Zm3 0a.75.75 0 0 1 .75-.75h10a.75.75 0 0 1 0 1.5h-10A.75.75 0 0 1 7 3Zm.75 6.25a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5h-10Zm0 7a.75.75 0 0 0 0 1.5h10a.75.75 0 0 0 0-1.5h-10ZM3 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2Zm0 7a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z' clip-rule='evenodd'></path>
  </svg>
)

const BlockQuote = createCustomButton(
  'block',
  'blockquote',
  <svg data-4ek='true' aria-hidden='true' viewBox='0 0 20 20'>
    <path fill='currentColor' fill-rule='evenodd' d='M3.5 2.75a.75.75 0 0 0-1.5 0v14.5a.75.75 0 0 0 1.5 0V2.75ZM6.75 3a.75.75 0 0 0 0 1.5h8.5a.75.75 0 0 0 0-1.5h-8.5ZM6 10.25a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 0 1.5H6.75a.75.75 0 0 1-.75-.75Zm.75 5.25a.75.75 0 0 0 0 1.5h7.5a.75.75 0 0 0 0-1.5h-7.5Z' clip-rule='evenodd'></path>
  </svg>
);

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
  const [editorState, setEditorState] = useState(EditorState.createEmpty());
  const rawContent = useMemo(() => JSON.stringify(convertToRaw(editorState.getCurrentContent())), [editorState])
  const deflatedContent = useMemo(() => deflateContent(rawContent), [rawContent])
  const messageIsValid = useMemo(() => deflatedContent.length <= MESSAGE_MAX_SIZE, [deflatedContent])
  const placeholder = useMemo(
    () => isMuted
      ? 'You have been muted by an admin and cannot send messages.'
      : 'Type your message here...',
    [isMuted]
  );
  const replyMessageMarkup = useMemo(() => replyToMessage && deflatedMessageToMarkup(replyToMessage.body), [replyToMessage]);
  
  const resetEditor = useCallback(() => {
    setEditorState(resetEditorState);
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

      if (!editorState.getCurrentContent().hasText()|| !messageIsValid) {
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
    editorState,
    resetEditor,
    messageIsValid,
    replyToMessage,
    sendReply,
    deflatedContent,
    sendMessage
  ]);

  const handleReturn = useCallback((e: SyntheticKeyboardEvent, state: EditorState) => {
    const currentBlockType = RichUtils.getCurrentBlockType(state);
    let handled = true;

    if (e.key === 'Enter' && !e.shiftKey) {
      sendCurrentMessage();
    } else if (e.key === 'Enter' && e.shiftKey) {
      if (currentBlockType !== 'unstyled') {
        // Soft returns are handled only with unstyled blocks.
        handled = false;
      }

      handled = false;
    }

    return handled;
  }, [sendCurrentMessage]);

  const handleKeyCommand = useCallback((command: string, state: EditorState) => {
    let newState: EditorState | null = RichUtils.handleKeyCommand(state, command);

    // If RichUtils.handleKeyCommand didn't find anything, check for our custom strikethrough command and call `RichUtils.toggleInlineStyle` if we find it.
    if (!newState && command === 'strikethrough') {
      newState = RichUtils.toggleInlineStyle(editorState, 'STRIKETHROUGH');
    }

    if (newState) {
      setEditorState(newState);
      return 'handled';
    }

    return 'not-handled';
  }, [editorState]);

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
        <Editor
          handleKeyCommand={handleKeyCommand}
          customStyleMap={{
            'CODE': {
              backgroundColor: 'var(--dark-7)',
              color: 'var(--light-orange)',
              padding: '0 0.25ch',
              margin: '0 0.25ch',
              borderRadius: '0.25rem'
            }
          }}
          placeholder={placeholder}
          toolbarClassName={s.toolbar}
          editorClassName={s.editor}
          editorState={editorState}
          toolbar={{
            options: ['link'],
            inline: {
              options: [],
            },
            link: {
              options: ['link'],
              link: { icon: 'data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 20 20\' %3e%3cpath fill=\'white\' fill-rule=\'evenodd\' d=\'M12.306 3.755a2.75 2.75 0 0 1 3.889 0l.05.05a2.75 2.75 0 0 1 0 3.89l-3.18 3.18a2.75 2.75 0 0 1-3.98-.096l-.03-.034a.75.75 0 1 0-1.11 1.01l.03.033a4.25 4.25 0 0 0 6.15.147l3.18-3.18a4.25 4.25 0 0 0 0-6.01l-.05-.05a4.25 4.25 0 0 0-6.01 0L9.47 4.47a.75.75 0 1 0 1.06 1.06l1.776-1.775Zm-4.611 12.49a2.75 2.75 0 0 1-3.89 0l-.05-.05a2.75 2.75 0 0 1 0-3.89l3.18-3.18a2.75 2.75 0 0 1 3.98.096l.03.033a.75.75 0 1 0 1.11-1.009l-.03-.034a4.25 4.25 0 0 0-6.15-.146l-3.18 3.18a4.25 4.25 0 0 0 0 6.01l.05.05a4.25 4.25 0 0 0 6.01 0l1.775-1.775a.75.75 0 0 0-1.06-1.06l-1.775 1.775Z\' clip-rule=\'evenodd\'%3e%3c/path%3e%3c/svg%3e' }
            }
          }}
          handleReturn={handleReturn}
          onEditorStateChange={setEditorState}
          toolbarCustomButtons={[
            Bold,
            Italic,
            Strikethrough,
            OrderedList,
            UnorderedList,
            BlockQuote,
            Code,
            CodeBlock,
          ].map((C) => <C editorState={editorState} onChange={setEditorState} />)}
        />
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
