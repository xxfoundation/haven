import { WithChildren } from '@types';
import React, {FC, useCallback, useMemo, useState } from 'react';
import { SettingsView, LeftSidebarView, RightSidebarView } from 'src/types/ui';
import toast, { Toaster } from 'react-hot-toast';
import Alert, { AlertType } from '@components/common/Alert';
import { EmojiPortal } from '@components/common/EmojiPortal';

export type ModalViews =
  | 'SHARE_CHANNEL'
  | 'CREATE_CHANNEL'
  | 'JOIN_CHANNEL'
  | 'LEAVE_CHANNEL_CONFIRMATION'
  | 'SET_NICK_NAME'
  | 'CHANNEL_SETTINGS'
  | 'SETTINGS'
  | 'LOADING'
  | 'EXPORT_CODENAME'
  | 'IMPORT_CODENAME'
  | 'NETWORK_NOT_READY'
  | 'JOIN_CHANNEL_SUCCESS'
  | 'LOGOUT'
  | 'USER_WAS_MUTED'
  | 'VIEW_PINNED_MESSAGES'
  | 'VIEW_MUTED_USERS'
  | 'EXPORT_ADMIN_KEYS'
  | 'CLAIM_ADMIN_KEYS'
  | 'ACCOUNT_SYNC'
  | 'NEW_DM';


export enum EasterEggs {
  Spaceman,
  CarWarranty,
  Masochist
}
  
export interface State {
  alert: (alert: AlertType) => void;
  dismissAlert: (id: string) => void;
  displayModal: boolean;
  leftSidebarView: LeftSidebarView;
  setLeftSidebarView: (view: LeftSidebarView) => void;
  rightSidebarView: RightSidebarView | null;
  setRightSidebarView: (view: RightSidebarView | null) => void;
  settingsView: SettingsView;
  setSettingsView: (view: SettingsView) => void;
  modalView?: ModalViews;
  activeModals: object[];
  channelInviteLink: string;
  showPinned: boolean;
  closeableOverride?: boolean;
  togglePinned: () => void;
  setShowPinned: (showPinned: boolean) => void;
  openModal: () => void;
  closeModal: () => void;
  setModalView: (view: ModalViews, closeableOverride?: boolean) => void;
  setChannelInviteLink: (link: string) => void;
  triggerEasterEgg: (egg: EasterEggs) => void;
  easterEggs: EasterEggs[];
}

const initialState = {
  displayModal: false,
  activeModals: [],
  channelInviteLink: '',
  showPinned: false,
} as unknown as State;

type Action =
  | {
      type: 'OPEN_MODAL';
    }
  | {
      type: 'CLOSE_MODAL';
    }
  | {
      type: 'SET_MODAL_VIEW';
      view: ModalViews;
    }
  | {
      type: 'SET_CHANNEL_INVITE_LINK';
      link: string;
    };

export const UIContext = React.createContext<State>(initialState as unknown as State);

UIContext.displayName = 'UIContext';

function uiReducer(state: State, action: Action) {
  switch (action.type) {
    case 'OPEN_MODAL': {
      return {
        ...state,
        displayModal: true,
        displaySidebar: false
      };
    }
    case 'CLOSE_MODAL': {
      return {
        ...state,
        displayModal: false
      };
    }
    case 'SET_MODAL_VIEW': {
      return {
        ...state,
        modalView: action.view
      };
    }
    case 'SET_CHANNEL_INVITE_LINK': {
      return {
        ...state,
        channelInviteLink: action.link
      };
    }
  }
}
export const UIProvider: FC<WithChildren> = ({ children }) => {
  const [state, dispatch] = React.useReducer(uiReducer, initialState);
  const [closeableOverride, setCloseableOverride] = useState<boolean>();
  const [leftSidebarView, setLeftSidebarView] = useState<LeftSidebarView>('spaces');
  const [rightSidebarView, setRightSidebarView] =  useState<RightSidebarView | null>(null);
  const [settingsView, setSettingsView] = useState<SettingsView>('notifications');
  const [easterEggs, setEasterEggs] = useState<EasterEggs[]>([]);

  const openModal = useCallback(() => dispatch({ type: 'OPEN_MODAL' }), [
    dispatch
  ]);
  
  const closeModal = useCallback(
    () => {
      setCloseableOverride(undefined);
      dispatch({ type: 'CLOSE_MODAL' })
    },
    []
  );

  const setModalView = useCallback(
    (view: ModalViews, closeable?: boolean) => {
      setCloseableOverride(closeable);
      dispatch({ type: 'SET_MODAL_VIEW', view })
    },
    []
  );

  const setChannelInviteLink = useCallback(
    (link: string) => dispatch({ type: 'SET_CHANNEL_INVITE_LINK', link }),
    []
  );

  const dismissAlert = useCallback<State['dismissAlert']>((id) => {
    toast.dismiss(id);
  }, []);

  const alert = useCallback<State['alert']>((al) => {
    toast.custom(<Alert {...al} />);
  }, []);

  const triggerEasterEgg = useCallback((egg: EasterEggs) => {
    setEasterEggs((eggs) => {
      const found = !eggs.includes(egg);
      if (found) {
        alert({ type: 'success', content: `Easter egg #${egg + 1} of 3 found.` });
      }
      return found ? eggs.concat(egg) : eggs;
    });
  }, [alert]);

  const value = useMemo(
    () => ({
      ...state,
      easterEggs,
      alert,
      dismissAlert,
      leftSidebarView,
      setLeftSidebarView,
      settingsView,
      setSettingsView,
      closeableOverride,
      openModal,
      closeModal,
      setModalView,
      setChannelInviteLink,
      triggerEasterEgg,
      rightSidebarView,
      setRightSidebarView,
    }),
    [
      alert,
      easterEggs,
      closeModal,
      closeableOverride,
      dismissAlert,
      openModal,
      setChannelInviteLink,
      setModalView,
      settingsView,
      setSettingsView,
      setLeftSidebarView,
      leftSidebarView,
      state,
      triggerEasterEgg,
      rightSidebarView,
      setRightSidebarView
    ]
  );

  return (
    <UIContext.Provider value={value}>
      <EmojiPortal>
        {children}
      </EmojiPortal>
    </UIContext.Provider>
    );
};

export const useUI = () => {
  const context = React.useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};

export const ManagedUIContext: FC<WithChildren> = ({ children }) => (
  <UIProvider>
    <Toaster />
    {children}
  </UIProvider>
);
