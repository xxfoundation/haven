import { FC, useCallback } from 'react';

import React, { useMemo } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import { Elixxir } from 'src/components/icons';
import classes from './Identity.module.scss';
import { useNetworkClient } from '@contexts/network-client-context';
import { useAppDispatch } from 'src/store/hooks';
import * as app from 'src/store/app';
import { useUtils } from '@contexts/utils-context';

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
  const { userIsMuted } = useNetworkClient();
  const dispatch = useAppDispatch();
  const isMuted = useMemo(
    () => !disableMuteStyles && userIsMuted(pubkey),
    [disableMuteStyles, pubkey, userIsMuted]
  );
  
  const { codename, color } = useMemo(
    () => getCodeNameAndColor(pubkey, codeset),
    [codeset, getCodeNameAndColor, pubkey]
  )
  const colorHex = isMuted ? 'var(--dark-2)' : color.replace('0x', '#');
  const codenameColor = isMuted
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
    </span>
  );
}

export default Identity;
