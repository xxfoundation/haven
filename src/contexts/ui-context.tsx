import { WithChildren } from '@types';
import React, { FC, useCallback, useState, useMemo } from 'react';

export type ModalViews =
  | 'SHARE_CHANNEL'
  | 'CREATE_CHANNEL'
  | 'JOIN_CHANNEL'
  | 'LEAVE_CHANNEL_CONFIRMATION'
  | 'SET_NICK_NAME'
  | 'CHANNEL_ACTIONS'
  | 'SETTINGS'
  | 'EXPORT_CODENAME'
  | 'IMPORT_CODENAME'
  | 'NETWORK_NOT_READY'
  | 'JOIN_CHANNEL_SUCCESS'
  | 'LOGOUT'
  | 'USER_WAS_BANNED'
  | 'VIEW_PINNED_MESSAGES'
  | 'EXPORT_ADMIN_KEYS'
  | 'CLAIM_ADMIN_KEYS';

export interface State {
  displayModal: boolean;
  modalView?: ModalViews;
  activeModals: object[];
  channelInviteLink: string;
  showPinned: boolean;
  togglePinned: () => void;
  setShowPinned: (showPinned: boolean) => void;
  openModal: () => void;
  closeModal: () => void;
  setModalView: (view: ModalViews) => void;
  setChannelInviteLink: (link: string) => void;
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
  const [showPinned, setShowPinned] = useState(false);

  const openModal = useCallback(() => dispatch({ type: 'OPEN_MODAL' }), [
    dispatch
  ]);
  
  const closeModal = useCallback(() => dispatch({ type: 'CLOSE_MODAL' }), [
    dispatch
  ]);

  const setModalView = useCallback(
    (view: ModalViews) => dispatch({ type: 'SET_MODAL_VIEW', view }),
    [dispatch]
  );

  const setChannelInviteLink = useCallback(
    (link: string) => dispatch({ type: 'SET_CHANNEL_INVITE_LINK', link }),
    [dispatch]
  );

  const value = useMemo(
    () => ({
      ...state,
      openModal,
      closeModal,
      setModalView,
      setChannelInviteLink,
      showPinned,
      setShowPinned
    }),
    [
      closeModal,
      openModal,
      setChannelInviteLink,
      setModalView,
      showPinned,
      state
    ]
  );

  return (
    <UIContext.Provider value={value}>
      {children}
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
  <UIProvider>{children}</UIProvider>
);
