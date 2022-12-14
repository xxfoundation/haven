import type { FC } from 'react';

import React from 'react';
import cn from 'classnames';

import { Elixxir } from 'src/components/icons';
import classes from './Identity.module.scss';

type Props = {
  nickname?: string;
  color?: string;
  codename: string;
  muted?: boolean;
}

const Identity: FC<Props> = (props) => {
  const { codename, color = '', nickname } = props;
  const colorHex = color.replace('0x', '#');
  const codenameColor = nickname ? '#73767C' : colorHex;

  return (
    <span className={cn(classes.root)}>
      {nickname && (
        <>
          <span className='nickname' style={{ color: colorHex }}>
            {nickname}
          </span>
          &nbsp;
        </>
      )}
      <Elixxir
        style={{ fill: codenameColor }}
      />
      <span className='codename' style={{ color: codenameColor }}>
        {codename}
      </span>
    </span>
  );
}

export default Identity;
