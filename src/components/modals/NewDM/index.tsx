import SearchInput from '@components/common/SearchInput';
import ModalTitle from '../ModalTitle';
import { useAppSelector } from 'src/store/hooks';
import * as messages from 'src/store/messages';
import Identity from '@components/common/Identity';
import { useTranslation } from 'react-i18next';
import { Button } from '@components/common';
import { useMemo } from 'react';
import useInput from 'src/hooks/useInput';
import useDmClient from 'src/hooks/useDmClient';
import { fullIdentity } from 'src/store/selectors';

const NewDM = () => {
  const { t } = useTranslation();
  const { createConversation } = useDmClient();
  const contributors = useAppSelector(messages.selectors.messageableContributors);
  const [search, setSearch] = useInput('');
  const user = useAppSelector(fullIdentity);

  const filteredContributors = useMemo(
    () => {
      const s = search.toLocaleLowerCase();
      return contributors.filter(
        (c) => c.codename.toLocaleLowerCase().includes(s)
        || c.nickname?.toLocaleLowerCase().includes(s)
        || ('Note to self'.toLocaleLowerCase().includes(s) && c.pubkey === user?.pubkey)
      );
    },
    [contributors, search, user?.pubkey]
  );

  const userDmToken = useMemo(
    () => filteredContributors.find((c) => c.pubkey === user?.pubkey)?.dmToken,
    [filteredContributors, user?.pubkey]
  );

  return (
    <>
      <ModalTitle>{t('Send a Direct Message')}</ModalTitle>

      {contributors.length === 0 ? (
        <p className='text-red'>
          {t('Nobody from your channels is messageable.')}
        </p>
      ) : <SearchInput value={search} onChange={setSearch} className='w-full' />}
      
      <div className='w-full space-y-2 max-h-80 overflow-y-auto'>
        {(user && userDmToken !== undefined) && (
          <Button
            onClick={() => createConversation({...user, token: userDmToken })}
            className='block w-full text-left hover:bg-charcoal-3-20 rounded-lg px-4 py-1'
            variant='unstyled'>
            <Identity {...user} /> {t('(Note to self)')}
          </Button>)
        }
        {filteredContributors.filter((c) => c.pubkey !== user?.pubkey).map((contributor) => (
          <Button
            onClick={() => createConversation({
              ...contributor,
              token: contributor.dmToken ?? -1,
              color: contributor.color ?? 'var(charcoal-1)'
            })}
            className='block w-full text-left hover:bg-charcoal-3-20 rounded-lg px-4 py-1'
            variant='unstyled'>
            <Identity {...contributor} />
          </Button>
        ))}
      </div>
    </>
  );
}

export default NewDM;
