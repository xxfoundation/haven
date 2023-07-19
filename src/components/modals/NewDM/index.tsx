import SearchInput from '@components/common/SearchInput';
import ModalTitle from '../ModalTitle';
import { useAppSelector } from 'src/store/hooks';
import * as messages from 'src/store/messages';
import Identity from '@components/common/Identity';
import { useTranslation } from 'react-i18next';
import { Button } from '@components/common';
import { useMemo } from 'react';
import useInput from 'src/hooks/useInput';
import { useNetworkClient } from '@contexts/network-client-context';

const NewDM = () => {
  const { t } = useTranslation();
  const { createConversation } = useNetworkClient();
  const contributors = useAppSelector(messages.selectors.messageableContributors);
  const [search, setSearch] = useInput('');
  const filteredContributors = useMemo(
    () => {
      const s = search.toLocaleLowerCase();
      return contributors.filter((c) => c.codename.toLocaleLowerCase().includes(s)
        || c.nickname?.toLocaleLowerCase().includes(search))
    },
    [contributors, search]
  );

  return (
    <>
      <ModalTitle>{t('Send a Direct Message')}</ModalTitle>
      <SearchInput value={search} onChange={setSearch} className='w-full' />
      <div className='w-full space-y-2 max-h-80 overflow-y-auto'>
        {filteredContributors.map((contributor) => (
          <Button
            onClick={() => createConversation(contributor)}
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
