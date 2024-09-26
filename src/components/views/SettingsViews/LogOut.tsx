import { useTranslation } from 'react-i18next';

import { Button } from '@components/common';
import Input from '@components/common/Input';
import { useNetworkClient } from '@contexts/network-client-context';
import useInput from 'src/hooks/useInput';

const LogOutView = () => {
  const { t } = useTranslation();
  const { logout } = useNetworkClient();
  const [password, setPassword] = useInput('');
  return (
    <>
      <h2>{t('Log out')}</h2>
      <hr className='w-full my-10 border-charcoal-3' />
      <p className='text-orange text-sm font-weight-normal leading-5'>
        {t('Warning: By logging out, all of you current data will be deleted from your browser. Please make sure you have a backup first. This can\'t be undone.')}
      </p>
      <form className='space-y-8 mt-8' onSubmit={() => { logout(password) }}>
        <Input className='w-80 h-10' type='password' placeholder={t('Enter password')} onChange={setPassword} value={password} />
        <Button disabled={!password} type='submit'>
          {t('Log Out')}
        </Button>
      </form>
    </>
  )
}

export default LogOutView;
