import type { IdentityVariables } from './types';

import React, { FC ,useEffect } from 'react';

import { useUI } from '@contexts/ui-context';
import Modal from 'src/components/common/Modal';
import ImportAccountForm from './ImportAccountForm';

type Props = {
  onSubmit: (identityVariables: IdentityVariables) => void;
}

const ImportAccountModal: FC<Props> = ({ onSubmit }) => {
  const { closeModal } = useUI();
  useEffect(() => {}, []);

  return (
    <Modal onClose={closeModal}>
      <ImportAccountForm onSubmit={onSubmit} />
    </Modal>
  );
};

export default ImportAccountModal;
