import {
  CreateChannelView,
  ClaimAdminKeys,
  JoinChannelView,
  ShareChannelView,
  LeaveChannelConfirmationView,
  NickNameSetView,
  ExportCodenameView,
  NetworkNotReadyView,
  JoinChannelSuccessView,
  LogoutView,
  UserWasMuted,
  ViewPinnedMessages,
  ExportAdminKeys,
} from 'src/components/modals';
import { ModalViews, useUI } from 'src/contexts/ui-context';

import AccountSyncView from '@components/modals/AccountSync';
import Modal from '@components/modals/Modal';
import { FC, useMemo } from 'react';
import NewDM from './NewDM';

type ModalMap = Omit<Record<ModalViews, React.ReactNode>, 'IMPORT_CODENAME'>;

const AppModals: FC = () => {
  const { closeModal, closeableOverride, displayModal, modalView = '' } = useUI();

  const modals = useMemo<ModalMap>(() => ({
    ACCOUNT_SYNC: <AccountSyncView />,
    CLAIM_ADMIN_KEYS: <ClaimAdminKeys />,
    EXPORT_CODENAME:  <ExportCodenameView />,
    EXPORT_ADMIN_KEYS: <ExportAdminKeys />,
    SHARE_CHANNEL: <ShareChannelView />,
    CREATE_CHANNEL: <CreateChannelView />,
    JOIN_CHANNEL: <JoinChannelView />,
    LOGOUT: <LogoutView />,
    LOADING: <></>,
    LEAVE_CHANNEL_CONFIRMATION: <LeaveChannelConfirmationView />,
    NEW_DM: <NewDM />,
    SET_NICK_NAME: <NickNameSetView />,
    CHANNEL_SETTINGS: null,
    SETTINGS: null,
    NETWORK_NOT_READY: <NetworkNotReadyView />,
    JOIN_CHANNEL_SUCCESS: <JoinChannelSuccessView />,
    USER_WAS_MUTED: <UserWasMuted />,
    VIEW_PINNED_MESSAGES: <ViewPinnedMessages />
  }), []);

  return displayModal && modalView && modalView !== 'IMPORT_CODENAME' ? (
    <Modal
      loading={modalView === 'LOADING'}
      closeable={closeableOverride}
      onClose={closeModal}>
      {modals[modalView]}
    </Modal>
  ) : null;
};

export default AppModals;
