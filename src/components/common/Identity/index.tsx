import { FC, useCallback } from 'react';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Elixxir } from 'src/components/icons';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import * as app from 'src/store/app';
import { useUtils } from '@contexts/utils-context';
import { currentMutedUsers } from 'src/store/selectors';
import * as dms from 'src/store/dms';
import { useUI } from '@contexts/ui-context';

type Props = {
  disableMuteStyles?: boolean;
  nickname?: string;
  muted?: boolean;
  pubkey: string;
  codeset: number;
  clickable?: boolean;
  className?: string;
};

const Identity: FC<Props> = ({
  className,
  clickable = false,
  codeset,
  disableMuteStyles,
  nickname,
  pubkey
}) => {
  const { t } = useTranslation();
  const { getCodeNameAndColor } = useUtils();
  const dispatch = useAppDispatch();
  const { setRightSidebarView } = useUI();
  const mutedUsers = useAppSelector(currentMutedUsers);
  const isMuted = useMemo(
    () => !disableMuteStyles && mutedUsers?.includes(pubkey),
    [disableMuteStyles, pubkey, mutedUsers]
  );
  const isBlocked = useAppSelector(dms.selectors.isBlocked(pubkey));

  const { codename, color } = useMemo(
    () => getCodeNameAndColor(pubkey, codeset),
    [codeset, getCodeNameAndColor, pubkey]
  );
  const colorHex = isMuted || isBlocked ? 'var(--text-muted)' : color.replace('0x', '#');
  const codenameColor =
    isMuted || isBlocked ? 'var(--text-muted)' : nickname ? '#73767C' : colorHex;

  const onClick = useCallback(() => {
    if (clickable) {
      dispatch(app.actions.selectUser(pubkey));
      setRightSidebarView('user-details');
    }
  }, [clickable, dispatch, pubkey, setRightSidebarView]);

  return (
    <span
      onClick={onClick}
      title={`${nickname ? `${nickname} – ` : ''}${codename}`}
      className={`
        font-bold
        ${clickable ? 'cursor-pointer' : ''}
        ${isMuted ? 'line-through' : ''}
        ${className || ''}
      `}
    >
      {nickname && (
        <>
          <span className='nickname' style={{ color: colorHex }}>
            {nickname}
          </span>
          &nbsp;
        </>
      )}
      <span className='whitespace-nowrap'>
        <Elixxir className='w-3 inline mb-0.5' style={{ fill: codenameColor }} />
        <span className='codename' style={{ color: codenameColor }}>
          {codename}
        </span>
      </span>
      {isMuted && (
        <>
          &nbsp;
          <span className='text-red'>[{t('muted')}]</span>
        </>
      )}
      {isBlocked && (
        <>
          &nbsp;
          <span className='text-red'>[{t('blocked')}]</span>
        </>
      )}
    </span>
  );
};

export default Identity;
