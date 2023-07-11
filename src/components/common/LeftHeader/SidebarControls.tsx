import type { SidebarView } from 'src/types/ui';
import { FC } from 'react';
import Spaces from 'src/components/icons/Spaces';
import Dms from 'src/components/icons/Dms';
import { useAppSelector } from 'src/store/hooks';
import * as channels from 'src/store/channels';
import { useTranslation } from 'react-i18next';

type Props = {
  view: SidebarView;
  onViewChange: (view: SidebarView) => void;
}

const SidebarControls: FC<Props> = ({ onViewChange, view }) => {
  const { t } = useTranslation();
  const allChannels = useAppSelector(channels.selectors.channels);
  const dmsDisabled = allChannels.length === 0;

  return (
    <div className='space-x-1 flex items-center'>
      <button
        title={t('Spaces')}
        onClick={() => onViewChange('spaces')}>
        <Spaces
          style={{
            fill: view === 'spaces'
              ? 'var(--primary)'
              : 'var(--charcoal-1)'
          }}
        />
      </button>
      <button
        title={dmsDisabled ? t('Join or create a channel first.') : t('Direct Messages')}
        disabled={dmsDisabled}
        style={{ opacity: dmsDisabled ? 0.25 : 1 }}
        onClick={() => onViewChange('dms')}>
        <Dms
          style={{
            fill: view === 'dms'
              ? 'var(--primary)'
              : 'var(--charcoal-1)'
          }}
        />
      </button>
    </div>
  );
};

export default SidebarControls;
