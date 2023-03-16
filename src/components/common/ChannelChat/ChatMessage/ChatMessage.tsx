import { Message, MessageStatus } from 'src/types';

import React, { CSSProperties, FC, HTMLAttributes, useEffect, useMemo, useState } from 'react';
import cn from 'classnames';
import 'moment-timezone';
import moment from 'moment';
import Clamp from 'react-multiline-clamp';
import { useTranslation } from 'react-i18next';

import Identity from 'src/components/common/Identity';
import s from './ChatMessage.module.scss';
import ChatReactions from '../ChatReactions';
import Spinner from '@components/common/Spinner';
import { useAppSelector } from 'src/store/hooks';
import * as messages from 'src/store/messages';
import { inflate } from '@utils/index';
import { Tooltip } from 'react-tooltip';
import { selectors } from 'src/store/messages';

type Props = HTMLAttributes<HTMLDivElement> & {
  clamped: boolean;
  message: Message;
}

const HoveredMention = ({ codename }: { codename: string }) => {
  const contributors = useAppSelector(selectors.currentContributors);
  const mentioned = useMemo(
    () => contributors.find((c) => c.codename === codename),
    [codename, contributors]
  );
  return mentioned ? (
    <Identity {...mentioned} />
  ) : null;
}

const ChatMessage: FC<Props> = ({ clamped, message, ...htmlProps }) => {
  const { t } = useTranslation();
  const repliedToMessage = useAppSelector(messages.selectors.repliedTo(message));
  const markup = useMemo(
    () => inflate(message.body),
    [message.body]
  );
  
  const replyMarkup = useMemo(
    () => repliedToMessage && inflate(repliedToMessage.body),
    [repliedToMessage]
  );
  
  const [hoveredMention, setHoveredMention] = useState<string | null>(null);
  const [tooltipStyles, setTooltipStyles] = useState<CSSProperties>({});

  useEffect(() => {
    const mentions = document.getElementById(message.id)?.getElementsByClassName('mention')
    if (!mentions) {
      return;
    }

    for (let i = 0; i < mentions.length; i++) {
      const mention = mentions[i];

      if (mention instanceof HTMLElement) {
        const codename = mention.dataset.value ?? '';

        mention.onmouseenter = (evt) => {
          setHoveredMention(codename);
          setTooltipStyles({ position: 'fixed', zIndex: 10, left: evt.clientX - 10, top: evt.clientY + 10 });
        };
        mention.onmouseleave = () => {
          setHoveredMention(null);
          setTooltipStyles({});
        };
      }
    }
  }, [markup, message.id])
  
  return (
    <div
      id={message.id}
      {...htmlProps}
      className={cn(
        htmlProps.className,
        'flex items-center',
        s.root,
        {
          [s.root__withReply]: message.repliedTo !== null
        },
        htmlProps.className
      )}
    >
      <Tooltip clickable style={tooltipStyles} isOpen={hoveredMention !== null}>
        {hoveredMention && <HoveredMention codename={hoveredMention} />}
      </Tooltip>
      <div className={cn('w-full')}>
        <div className={cn(s.header)}>
          {message.repliedTo !== null ? (
            <>
              <Identity {...message} />
              <span className={cn(s.separator, 'mx-1')}>
                {t('replied to')}
              </span>
              {
              repliedToMessage
                ? <Identity clickable {...repliedToMessage} />
                : (
                  <span className={cn(s.separator, '')}>
                    <strong>{t('deleted/unknown')}</strong>
                  </span>
                )
              }
            </>
          ) : (
            <Identity clickable {...message} />
          )}

          <span className={cn(s.messageTimestamp)}>
            {moment(message.timestamp).format('hh:mm A')}
          </span>
          {message.status === MessageStatus.Unsent && (
            <Spinner size='xs' />
          )}
          {message.round !== 0 && (
            <a
              href={`https://dashboard.xx.network/rounds/${message.round}`}
              target='_blank'
              rel='noreferrer'
              className='text text--xs ml-2'
              style={{
                whiteSpace: 'nowrap',
                fontSize: '9px',
                color: 'var(--text-secondary)',
                textDecoration: 'underline',
                marginBottom: '1px'
              }}
            >
              {t('Show mix')}
            </a>
          )}
          &nbsp;
          {message.status === MessageStatus.Failed && (
            <span className='text-xs' style={{ color: 'var(--red)' }}>
              ({t('Failed')})
            </span>
          )}
        </div>

        <div className={cn('message-body', s.body)}>
          {message.repliedTo !== null && (
            <p
              className={cn(s.replyToMessageBody)}
              onClick={() => {
                if (repliedToMessage) {
                  const originalMessage = document.getElementById(
                    repliedToMessage.id || ''
                  );
                  if (originalMessage) {
                    originalMessage.scrollIntoView();
                    originalMessage.classList.add(s.root__highlighted);
                    setTimeout(() => {
                      originalMessage.classList.remove(s.root__highlighted);
                    }, 3000);
                  }
                }
              }}
            >
              {repliedToMessage && replyMarkup ? (
                <>
                  <Identity clickable {...repliedToMessage} />
                  <Clamp lines={3}>
                    <p
                      className='message'
                      dangerouslySetInnerHTML={{
                        __html: replyMarkup
                      }}
                    />
                  </Clamp>
                </>
              ) : (
                <>{t('This message is unknown/deleted')}</>
              )}
            </p>
          )}
          <Clamp
            showMoreElement={({ toggle }: { toggle: () => void }) => (
              <button style={{ color: 'var(--cyan)'}} type='button' onClick={toggle}>
                {t('Show more')}
              </button>
            )}
            showLessElement={({ toggle }: { toggle: () => void }) => (
              <button style={{ color: 'var(--cyan)'}} type='button' onClick={toggle}>
                {t('Show less')}
              </button>
            )}
            maxLines={Number.MAX_SAFE_INTEGER}
            withToggle={clamped}
            lines={clamped ? 3 : Number.MAX_SAFE_INTEGER}>
            {markup ? <p
              className={cn('message', s.messageBody, {
                [s.messageBody__failed]: message.status === MessageStatus.Failed
              })}
              dangerouslySetInnerHTML={{
                __html: markup
              }}
            /> : <p></p>}
          </Clamp>
        </div>
        <ChatReactions message={message} />
      </div>
    </div>
  );
};

export default ChatMessage;
