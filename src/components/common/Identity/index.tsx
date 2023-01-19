import type { FC } from 'react';

import React, { useMemo } from 'react';
import cn from 'classnames';

import { Elixxir } from 'src/components/icons';
import classes from './Identity.module.scss';
import { useNetworkClient } from '@contexts/network-client-context';

type Props = {
  disableMuteStyles?: boolean;
  nickname?: string;
  color?: string;
  codename: string;
  muted?: boolean;
  pubkey: string;
}

const Identity: FC<Props> = ({ codename, color = '', disableMuteStyles, nickname, pubkey }) => {

  const { userIsMuted } = useNetworkClient();
  const isMuted = useMemo(
    () => !disableMuteStyles && userIsMuted(pubkey),
    [disableMuteStyles, pubkey, userIsMuted]
  );
  const colorHex = isMuted ? 'var(--dark-2)' : color.replace('0x', '#');
  const codenameColor = isMuted
    ? 'var(--dark-2)'
    : (nickname
      ? '#73767C'
      : colorHex);

  return (
    <span title={`${nickname && `${nickname} – `}${codename}`} className={cn(classes.root)}>
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
          <span style={{ color: 'var(--red)'}}>(muted)</span>
        </>
      )}
    </span>
  );
}

export default Identity;
