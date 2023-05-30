import { FC, useCallback, useState } from 'react';
import cn from 'classnames';
import { useTranslation } from 'react-i18next';

import s from './ExportCodenameView.module.scss';
import { PrimaryButton } from 'src/components/common';
import { useNetworkClient } from 'src/contexts/network-client-context';
import { useUI } from 'src/contexts/ui-context';

const ExportCodenameView: FC = () => {
  const { t } = useTranslation();
  const { closeModal } = useUI();
  const { exportPrivateIdentity } = useNetworkClient();
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState('');

  const handleSubmit = useCallback(() => {
    setError('');
    if (password.length) {
      const result = exportPrivateIdentity(password);
      if (result) {
        closeModal();
      } else {
        setError(t('Incorrect password'));
      }
    }
  }, [t, closeModal, exportPrivateIdentity, password]);

  return (
    <div
      className={cn('w-full flex flex-col justify-center items-center', s.root)}
    >
      <h2 className='mt-9 mb-4'>
        {t('Export codename')}
      </h2>
      <p className='mb-8'>
        {t(`You can export your codename for backup or to use your codename on a
        second device.`)}
      </p>
      <input
        type='password'
        placeholder={t('Unlock export with your password')}
        value={password}
        onKeyDown={(evt) => {
          if (evt.key === 'Enter') {
            handleSubmit();
          }
        }}
        onChange={e => {
          setPassword(e.target.value);
        }}
      />

      {error && (
        <div className={'text text--xs mt-2'} style={{ color: 'var(--red)' }}>
          {error}
        </div>
      )}
      <PrimaryButton
        cssClass={cn('mt-5', s.button)}
        onClick={handleSubmit}
      >
        {t('Export')}
      </PrimaryButton>
    </div>
  );
};

export default ExportCodenameView;
