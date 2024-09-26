import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { Button } from '@components/common';
import Input from '@components/common/Input';
import { useNetworkClient } from '@contexts/network-client-context';
import { useUI } from '@contexts/ui-context';
import useInput from 'src/hooks/useInput';

const ExportCodenameView = () => {
  const { t } = useTranslation();
  const { alert } = useUI();
  const { exportPrivateIdentity } = useNetworkClient();
  const [password, setPassword, { set: setPassValue }] = useInput('');

  const handleSubmit = useCallback(async (evt: React.FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    if (password.length) {
      const result = await exportPrivateIdentity(password);
      if (result) {
        alert({ type: 'success', content: 'Account exported successfully' });
        setPassValue('');
      } else {
        alert({ type: 'error', content: 'Incorrect password.' });
      }
    }
  }, [password, exportPrivateIdentity, alert, setPassValue]);

  return (
    <>
      <h2>{t('Export Codename')}</h2>
      <hr className='w-full my-10 border-charcoal-3' />
      <p className='text-sm font-weight-normal text-charcoal-1'>{t('You can export your codename for backup or to use your codename on a second device.')}</p>
      <form className='space-y-8 mt-8' onSubmit={handleSubmit}>
        <Input className='w-80 h-10' type='password' placeholder={t('Unlock export with your password')} onChange={setPassword} value={password} />
        <Button type='submit'>
          {t('Export')}
        </Button>
      </form>
    </>
  )
}

export default ExportCodenameView;
