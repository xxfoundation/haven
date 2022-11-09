import { FC, useState, useEffect, useRef } from "react";
import s from "./UserTextArea.module.scss";
import cn from "classnames";
import { IMessage } from "@types";
import { Close } from "@components/icons";
import { useNetworkClient } from "contexts/network-client-context";
import { useUI } from "contexts/ui-context";
import SendButton from "../../components/SendButton/SendButton";

const UserTextArea: FC<{
  setAutoScrollToEnd: Function;
  replyToMessage: IMessage | null | undefined;
  setReplyToMessage: Function;
}> = ({ setAutoScrollToEnd, replyToMessage, setReplyToMessage }) => {
  const [messageBody, setMessageBody] = useState<string>("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { setModalView, openModal } = useUI();
  const {
    currentChannel,
    sendMessage,
    sendReply,
    network
  } = useNetworkClient();

  useEffect(() => {
    setMessageBody("");
  }, [currentChannel?.id]);

  const checkMessageLength = () => {
    if (messageBody.trim().length > 700) {
      setModalView("MESSAGE_LONG");
      openModal();
      return false;
    } else {
      return true;
    }
  };

  return (
    <div className={s.textArea}>
      {replyToMessage && (
        <div className={cn(s.replyContainer)}>
          <div className="flex flex-col flex-1">
            <span>Reply to {replyToMessage.codeName}</span>
            <p>{replyToMessage.body}</p>
          </div>
          <Close
            width={14}
            height={14}
            fill={"var(--orange)"}
            onClick={() => {
              setReplyToMessage(null);
            }}
          />
        </div>
      )}

      <textarea
        ref={textAreaRef}
        name=""
        placeholder="Type your message here..."
        value={messageBody}
        onChange={e => {
          setMessageBody(e.target.value);
        }}
        onKeyDown={e => {
          if (e.keyCode === 13 && !e.shiftKey) {
            e.preventDefault();
            if (network && network.ReadyToSend && !network.ReadyToSend()) {
              setModalView("NETWORK_NOT_READY");
              openModal();
            } else {
              if (replyToMessage) {
                if (checkMessageLength()) {
                  sendReply(messageBody.trim(), replyToMessage.id);
                  setMessageBody("");
                }
              } else {
                if (checkMessageLength()) {
                  sendMessage(messageBody.trim());
                  setMessageBody("");
                }
              }
            }

            setAutoScrollToEnd(true);
            setReplyToMessage(null);
          }
        }}
      />

      <div className={s.buttonsWrapper}>
        <SendButton
          cssClass={s.button}
          onClick={async () => {
            if (network && network.ReadyToSend && !network.ReadyToSend()) {
              setModalView("NETWORK_NOT_READY");
              openModal();
            } else {
              if (replyToMessage) {
                if (checkMessageLength()) {
                  sendReply(messageBody.trim(), replyToMessage.id);
                  setMessageBody("");
                }
              } else {
                if (checkMessageLength()) {
                  sendMessage(messageBody.trim());
                  setMessageBody("");
                }
              }
            }

            setAutoScrollToEnd(true);
            setReplyToMessage(null);
          }}
        />
      </div>
    </div>
  );
};

export default UserTextArea;
