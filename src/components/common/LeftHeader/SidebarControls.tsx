import { FC } from 'react';
import Spaces from 'src/components/icons/Spaces';
import Dms from 'src/components/icons/Dms';
import { useAppSelector } from 'src/store/hooks';
import * as channels from 'src/store/channels';
import { useTranslation } from 'react-i18next';
import { useUI } from '@contexts/ui-context';

const SidebarControls: FC= () => {
  const { t } = useTranslation();
  const { leftSidebarView, setLeftSidebarView: setSidebarView } = useUI();
  const allChannels = useAppSelector(channels.selectors.channels);
  const dmsDisabled = allChannels.length === 0;

  return (
    <div className='space-x-1 flex items-center'>
      <button
        title={t('Spaces')}
        onClick={() => setSidebarView('spaces')}>
        <Spaces
          style={{
            fill: leftSidebarView === 'spaces'
              ? 'var(--primary)'
              : 'var(--charcoal-1)'
          }}
        />
      </button>
      <button
        className='disabled:cursor-not-allowed'
        title={dmsDisabled ? t('Join or create a channel first.') : t('Direct Messages')}
        disabled={dmsDisabled}
        style={{ opacity: dmsDisabled ? 0.25 : 1 }}
        onClick={() => setSidebarView('dms')}>
        <Dms
          style={{
            fill: leftSidebarView === 'dms'
              ? 'var(--primary)'
              : 'var(--charcoal-1)'
          }}
        />
      </button>
    </div>
  );
};

export default SidebarControls;
