import { Message, MessageStatus } from 'src/types';

import React, {
  CSSProperties,
  FC,
  HTMLAttributes,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react';
import cn from 'classnames';
import Clamp from 'react-multiline-clamp';
import { useTranslation } from 'react-i18next';

import Identity from 'src/components/common/Identity';
import s from './ChatMessage.module.css';
import ChatReactions from '../ChatReactions';
import Spinner from '@components/common/Spinner';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import * as messages from 'src/store/messages';
import * as app from 'src/store/app';
import { Tooltip } from 'react-tooltip';
import { selectors } from 'src/store/messages';
import dayjs from 'dayjs';
import Badge from '@components/common/Badge';
import ConnectingLine from '@components/icons/ConnectingLine';
import { useOnClickOutside } from 'usehooks-ts';

type Props = HTMLAttributes<HTMLDivElement> & {
  clamped: boolean;
  message: Message;
  className?: string;
  noReply?: boolean;
};

type ClampToggleProps = {
  toggle: () => void;
};

const HoveredMention = ({ codename }: { codename: string }) => {
  const contributors = useAppSelector(selectors.currentContributors);
  const mentioned = useMemo(
    () => contributors.find((c) => c.codename === codename),
    [codename, contributors]
  );
  return mentioned ? <Identity {...mentioned} /> : null;
};

const ChatMessage: FC<Props> = ({ clamped, message, noReply, ...htmlProps }) => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const repliedToMessage = useAppSelector(messages.selectors.repliedTo(message));
  const userReplyId = useAppSelector(app.selectors.replyingToId);
  const highlighted = useAppSelector(app.selectors.highlighted(message.id));

  const [hoveredMention, setHoveredMention] = useState<string | null>(null);
  const [tooltipStyles, setTooltipStyles] = useState<CSSProperties>({});
  const replyRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(replyRef, () => {
    dispatch(app.actions.highlightMessage(undefined));
  });

  useEffect(() => {
    const mentions = document.getElementById(message.id)?.getElementsByClassName('mention');
    if (!mentions) {
      return;
    }

    for (let i = 0; i < mentions.length; i++) {
      const mention = mentions[i];

      if (mention instanceof HTMLElement) {
        const codename = mention.dataset.value ?? '';

        mention.onmouseenter = (evt) => {
          setHoveredMention(codename);
          setTooltipStyles({
            position: 'fixed',
            zIndex: 10,
            left: evt.clientX - 10,
            top: evt.clientY + 10
          });
        };
        mention.onmouseleave = () => {
          setHoveredMention(null);
          setTooltipStyles({});
        };
      }
    }
  }, [message.body, message.id]);

  return (
    <div
      data-testid='message-container'
      id={message.id}
      {...htmlProps}
      className={`
        px-4 py-2 relative transition-all
        ${highlighted ? 'bg-charcoal-4-40 border-l-2 border-charcoal-2' : ''}
        ${(!message.id || message.id !== userReplyId) && !htmlProps.className?.includes('bg-') 
          ? 'bg-near-black hover:bg-charcoal-4-40' 
          : ''}
        ${userReplyId && message.id === userReplyId && !noReply 
          ? 'bg-green-10 border-l-2 border-green' 
          : ''}
        ${htmlProps.className || ''}
      `}
    >
      {repliedToMessage && !noReply && (
        <div
          ref={replyRef}
          className="cursor-pointer border rounded-lg border-charcoal-3 py-1.5 px-2.5 ml-5 mb-2 relative hover:bg-charcoal-4"
          onClick={() => {
            const originalMessage = document.getElementById(repliedToMessage.id || '');
            if (originalMessage) {
              originalMessage.scrollIntoView();
              dispatch(app.actions.highlightMessage(repliedToMessage.id));
            }
          }}
        >
          <ConnectingLine className="absolute -left-6 text-charcoal-3 bottom-0" />
          {repliedToMessage ? (
            <>
              <Identity clickable {...repliedToMessage} />
              <Clamp lines={3}>
                <div
                  className="message"
                  dangerouslySetInnerHTML={{
                    __html: repliedToMessage.body
                  }}
                />
              </Clamp>
            </>
          ) : (
            <>{t('This message is unknown/deleted')}</>
          )}
        </div>
      )}
      <Tooltip clickable style={tooltipStyles} isOpen={hoveredMention !== null}>
        {hoveredMention && <HoveredMention codename={hoveredMention} />}
      </Tooltip>
      <div className="w-full">
        <div className="shrink truncate overflow-hidden break-words hyphens-auto">
          <div className="flex items-center">
            {message.repliedTo !== null ? (
              <>
                <Identity clickable {...message} />
                <span className="mx-1 text-xs">{t('replied to')}</span>
                {repliedToMessage ? (
                  <Identity clickable {...repliedToMessage} />
                ) : (
                  <span className="text-xs">
                    <strong>{t('deleted/unknown')}</strong>
                  </span>
                )}
              </>
            ) : (
              <Identity clickable {...message} />
            )}
            <span className="text-[10px] font-normal ml-1.5">
              {dayjs(message.timestamp).format('hh:mm A')}
            </span>
            {(message.status === MessageStatus.Unsent || message.status === MessageStatus.Sent) && 
              <Spinner size='xs' />
            }
            {message.round !== 0 && (
              <a
                href={`https://dashboard.xx.network/rounds/${message.round}`}
                target='_blank'
                rel='noreferrer'
                className='text text--xs ml-2'
              >
                <Badge className='rounded-lg hover:text-primary hover:border-primary' color='grey'>
                  {t('Mix')}
                </Badge>
              </a>
            )}
            &nbsp;
            {message.status === MessageStatus.Failed && (
              <span className='text-xs text-red'>
                ({t('Failed')})
              </span>
            )}
          </div>

          <div className="text-sm">
            <Clamp
              showMoreElement={({ toggle }: ClampToggleProps) => (
                <button className="text-cyan" type='button' onClick={toggle}>
                  {t('Show more')}
                </button>
              )}
              showLessElement={({ toggle }: ClampToggleProps) => (
                <button className="text-cyan" type='button' onClick={toggle}>
                  {t('Show less')}
                </button>
              )}
              maxLines={Number.MAX_SAFE_INTEGER}
              withToggle={clamped}
              lines={clamped ? 3 : Number.MAX_SAFE_INTEGER}
            >
              {message.body ? (
                <div
                  className={`message ${message.status === MessageStatus.Failed ? 'text-red' : ''}`}
                  dangerouslySetInnerHTML={{
                    __html: message.body
                  }}
                />
              ) : (
                <p></p>
              )}
            </Clamp>
          </div>
          <ChatReactions message={message} />
        </div>
      </div>
    </div>
  );
};

export default React.memo(ChatMessage);
