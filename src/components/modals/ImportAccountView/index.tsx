import type { IdentityVariables } from './types';

import React, { FC } from 'react';

import { useUI } from '@contexts/ui-context';
import Modal from 'src/components/modals/Modal';
import ImportAccountForm from './ImportAccountForm';

type Props = {
  onSubmit: (identityVariables: IdentityVariables) => Promise<void>;
}

const ImportAccountModal: FC<Props> = ({ onSubmit }) => {
  const { closeModal } = useUI();

  return (
    <Modal onClose={closeModal}>
      <ImportAccountForm onSubmit={onSubmit} />
    </Modal>
  );
};

export default ImportAccountModal;
