import { FC } from 'react';
import Spaces from 'src/components/icons/Spaces';
import Dms from 'src/components/icons/Dms';
import { useAppSelector } from 'src/store/hooks';
import * as channels from 'src/store/channels';
import { useTranslation } from 'react-i18next';
import { useUI } from '@contexts/ui-context';

const SidebarControls: FC = () => {
  const { t } = useTranslation();
  const { leftSidebarView, setLeftSidebarView: setSidebarView } = useUI();
  return (
    <div className='flex items-center space-x-1'>
      <button title={t('Spaces')} onClick={() => setSidebarView('spaces')}>
        <Spaces
          className={
            leftSidebarView === 'spaces' ? 'fill-[var(--primary)]' : 'fill-[var(--charcoal-1)]'
          }
        />
      </button>
      <button title={t('Direct Messages')} onClick={() => setSidebarView('dms')}>
        <Dms
          className={
            leftSidebarView === 'dms' ? 'fill-[var(--primary)]' : 'fill-[var(--charcoal-1)]'
          }
        />
      </button>
    </div>
  );
};

export default SidebarControls;
