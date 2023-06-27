import { FC, useCallback } from 'react';

import React, { useMemo } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import { Elixxir } from 'src/components/icons';
import classes from './Identity.module.scss';
import { useAppDispatch, useAppSelector } from 'src/store/hooks';
import * as app from 'src/store/app';
import { useUtils } from '@contexts/utils-context';
import { currentMutedUsers } from 'src/store/selectors';
import * as dms from 'src/store/dms';

type Props = {
  disableMuteStyles?: boolean;
  nickname?: string;
  muted?: boolean;
  pubkey: string;
  codeset: number;
  clickable?: boolean;
  className?: string;
}

const Identity: FC<Props> = ({ className, clickable = false, codeset, disableMuteStyles, nickname, pubkey }) => {
  const { t } = useTranslation();
  const { getCodeNameAndColor } = useUtils();
  const dispatch = useAppDispatch();
  const mutedUsers = useAppSelector(currentMutedUsers);
  const isMuted = useMemo(
    () => !disableMuteStyles && mutedUsers?.includes(pubkey),
    [disableMuteStyles, pubkey, mutedUsers]
  );
  const isBlocked = useAppSelector(dms.selectors.isBlocked(pubkey));
  
  const { codename, color } = useMemo(
    () => getCodeNameAndColor(pubkey, codeset),
    [codeset, getCodeNameAndColor, pubkey]
  )
  const colorHex = (isMuted || isBlocked) ? 'var(--dark-2)' : color.replace('0x', '#');
  const codenameColor = (isMuted || isBlocked)
    ? 'var(--dark-2)'
    : (nickname
      ? '#73767C'
      : colorHex);

  const onClick = useCallback(() => {
    if (clickable) {
      dispatch(app.actions.selectUser(pubkey));
    }
  }, [clickable, dispatch, pubkey])

  return (
    <span
      onClick={onClick}
      title={`${nickname ? `${nickname} – ` : ''}${codename}`}
      className={cn(className, classes.root, { [classes.clickable]: clickable })}>
      {nickname && (
        <>
          <span className='nickname' style={{ color: colorHex }}>
            {nickname}
          </span>
          &nbsp;
        </>
      )}
      <span style={{ whiteSpace: 'nowrap' }}>
        <Elixxir style={{ fill: codenameColor }} />
        <span className='codename' style={{ color: codenameColor }}>
          {codename}
        </span>
      </span>
      {isMuted && (
        <>
          &nbsp;
          <span style={{ color: 'var(--red)'}}>({t('muted')})</span>
        </>
      )}
      {isBlocked && (
        <>
          &nbsp;
          <span style={{ color: 'var(--red)'}}>({t('blocked')})</span>
        </>
      )}
    </span>
  );
}

export default Identity;
