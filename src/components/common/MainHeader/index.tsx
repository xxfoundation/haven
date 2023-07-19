import React, { FC } from 'react';
import cn from 'classnames';

import { useAppSelector } from 'src/store/hooks';
import ChannelHeader from '../ChannelHeader';
import * as channels from 'src/store/channels';
import * as dms from 'src/store/dms';
import Identity from '../Identity';

import s from './styles.module.scss';
import { useUI } from '@contexts/ui-context';

type Props = {
  className?: string;
}

const MainHeader: FC<Props> = ({ className }) => {
  const currentChannel = useAppSelector(channels.selectors.currentChannel);
  const currentConversation = useAppSelector(dms.selectors.currentConversation);
  const { sidebarView } = useUI();

  return (
    <div className={cn(className, s.root)}>
      {currentChannel && sidebarView === 'spaces' && (
        <ChannelHeader {...currentChannel} />
      )}
      {currentConversation && sidebarView === 'dms' && (
        <ChannelHeader
          id={currentConversation.pubkey}
          isAdmin={false}
          name={<Identity {...currentConversation} />}
          privacyLevel={null} />
      )}
    </div>
  )
};

export default MainHeader;
