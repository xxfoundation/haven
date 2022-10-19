import React, { FC, useCallback, useMemo } from "react";

export interface State {
  displayModal: boolean;
  modalView: string;
  activeModals: object[];
}

const initialState = {
  displayModal: false,
  modalView: "",
  activeModals: []
};

type Action =
  | {
      type: "OPEN_MODAL";
    }
  | {
      type: "CLOSE_MODAL";
    }
  | {
      type: "SET_MODAL_VIEW";
      view: MODAL_VIEWS;
    };

type MODAL_VIEWS =
  | "SHARE_CHANNEL"
  | "CREATE_CHANNEL"
  | "JOIN_CHANNEL"
  | "LEAVE_CHANNEL_CONFIRMATION"
  | "SET_NICK_NAME"
  | "CHANNEL_ACTIONS"
  | "SETTINGS"
  | "EXPORT_CODENAME"
  | "IMPORT_CODENAME";

export const UIContext = React.createContext<State | any>(initialState);

UIContext.displayName = "UIContext";

function uiReducer(state: State, action: Action) {
  switch (action.type) {
    case "OPEN_MODAL": {
      return {
        ...state,
        displayModal: true,
        displaySidebar: false
      };
    }
    case "CLOSE_MODAL": {
      return {
        ...state,
        displayModal: false
      };
    }
    case "SET_MODAL_VIEW": {
      return {
        ...state,
        modalView: action.view
      };
    }
  }
}

export const UIProvider: FC<any> = props => {
  const [state, dispatch] = React.useReducer(uiReducer, initialState);

  const openModal = useCallback(() => dispatch({ type: "OPEN_MODAL" }), [
    dispatch
  ]);
  const closeModal = useCallback(() => dispatch({ type: "CLOSE_MODAL" }), [
    dispatch
  ]);

  const setModalView = useCallback(
    (view: MODAL_VIEWS) => dispatch({ type: "SET_MODAL_VIEW", view }),
    [dispatch]
  );

  const value = useMemo(
    () => ({
      ...state,
      openModal,
      closeModal,
      setModalView
    }),
    [state]
  );

  return <UIContext.Provider value={value} {...props} />;
};

export const useUI = () => {
  const context = React.useContext(UIContext);
  if (context === undefined) {
    throw new Error(`useUI must be used within a UIProvider`);
  }
  return context;
};

export const ManagedUIContext: FC<any> = ({ children }) => (
  <UIProvider>{children}</UIProvider>
);
