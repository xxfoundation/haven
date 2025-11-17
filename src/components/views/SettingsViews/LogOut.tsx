import { useTranslation } from 'react-i18next';

import { Button } from '@components/common';
import Input from '@components/common/Input';
import { useNetworkClient } from '@contexts/network-client-context';
import { useUI } from '@contexts/ui-context';
import { useAppSelector } from 'src/store/hooks';
import * as identitySelectors from 'src/store/identity/selectors';
import useInput from 'src/hooks/useInput';

const LogOutView = () => {
  const { t } = useTranslation();
  const { logout } = useNetworkClient();
  const { setSettingsView } = useUI();
  const identity = useAppSelector(identitySelectors.identity);
  const codename = identity?.codename || 'Codename';
  const [password, setPassword] = useInput('');
  return (
    <>
      <h2>{t('Log out')}</h2>
      <hr className='w-full my-10 border-charcoal-3' />
      <p className='text-orange text-sm font-weight-normal leading-5'>
        {`Warning: By logging out, all of your data related to ${codename} will be deleted from your browser. Once logged out, you can only log back in as ${codename} by importing it. Would you like to `}
        <span
          className='cursor-pointer text-blue-500 underline'
          onClick={() => setSettingsView('export-codename')}
        >
          {`create an import file for ${codename}`}
        </span>
        {` before logging out?`}
      </p>
      <form
        className='space-y-8 mt-8'
        onSubmit={() => {
          logout(password);
        }}
      >
        <Input
          className='w-80 h-10'
          type='password'
          placeholder={t('Enter password')}
          onChange={setPassword}
          value={password}
        />
        <Button disabled={!password} type='submit'>
          {t('Log Out')}
        </Button>
      </form>
    </>
  );
};

export default LogOutView;
