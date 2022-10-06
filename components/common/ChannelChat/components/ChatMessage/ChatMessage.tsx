import { FC, useEffect, useRef, useState, RefObject } from "react";
import s from "./ChatMessage.module.scss";
import cn from "classnames";
import Moment from "react-moment";
import "moment-timezone";
import moment from "moment";
import dynamic from "next/dynamic";
import { IEmojiPickerProps } from "emoji-picker-react";
import { EmojisPicker as EmojisPickerIcon, Reply } from "@components/icons";
import { IMessage } from "@types";
import { ToolTip } from "@components/common";
import { useNetworkClient } from "contexts/network-client-context";
import { Elixxir } from "@components/icons";

const EmojiPicker = dynamic<IEmojiPickerProps>(
  () => import("emoji-picker-react"),
  {
    ssr: false,
    loading: () => <p>Loading ...</p>
  }
);

const MessageSenderHeader: FC<{ message: IMessage }> = ({ message }) => {
  const color = (message?.color || "").replace("0x", "#");
  return (
    <span className={cn(s.sender)}>
      {message.nickName && (
        <span style={{ color: `${color}`, marginRight: "6px" }}>
          {message.nickName}
        </span>
      )}
      <Elixxir
        style={message.nickName ? { fill: "#73767C" } : { fill: color }}
      />
      <span style={message.nickName ? { color: "#73767C" } : { color: color }}>
        {message.codeName}
      </span>
    </span>
  );
};

const ActionsWrapper: FC<{
  onReplyClicked: Function;
  onReactToMessage: Function;
  className?: string;
}> = ({ onReplyClicked, onReactToMessage, className }) => {
  const pickerRef = useRef<HTMLDivElement>(null);
  const pickerIconRef = useRef<HTMLDivElement>(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [style, setStyle] = useState({});

  useEffect(() => {
    const listener = (event: any) => {
      if (
        pickerIconRef.current?.contains(event.target) ||
        pickerRef.current?.contains(event.target)
      ) {
        return;
      }
      setPickerVisible(false);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [pickerRef]);

  const adjustPickerPosition = () => {
    const messagesContainerElement = document.getElementById(
      "messagesContainer"
    );
    if (pickerIconRef.current && messagesContainerElement) {
      const tempStyle: any = {};
      const eleRect = pickerIconRef.current.getBoundingClientRect();
      const targetRect = messagesContainerElement.getBoundingClientRect();
      const bottom = targetRect.bottom - eleRect.bottom;
      const availableBottom = bottom + eleRect.height;
      const t = availableBottom >= 320 ? 0 : availableBottom - 320;
      tempStyle.top = `${t}px`;
      setStyle(tempStyle);
    }
  };

  useEffect(() => {
    adjustPickerPosition();
  }, [pickerVisible]);

  return (
    <div className={cn(s.actionsWrapper, className)}>
      <div className="relative mr-1 inline-block">
        <div ref={pickerIconRef}>
          <EmojisPickerIcon
            onClick={() => {
              setPickerVisible(!pickerVisible);
            }}
          />
        </div>

        {pickerVisible && (
          <div
            ref={pickerRef}
            style={{ ...style }}
            className={cn("absolute inline", s.emojisPickerWrapper)}
          >
            <EmojiPicker
              onEmojiClick={(event, emoji) => {
                onReactToMessage({
                  emoji: emoji.emoji
                });
              }}
            />
          </div>
        )}
      </div>
      <Reply
        onClick={() => {
          onReplyClicked();
        }}
      />
    </div>
  );
};

const ChatMessage: FC<{
  message: IMessage;
  onReplyClicked: Function;
  onReactToMessage: Function;
}> = ({ message, onReplyClicked, onReactToMessage }) => {
  const [actionsWrapperVisible, setActionsWrapperVisible] = useState(false);
  const { getIdentity, getNickName } = useNetworkClient();
  const identity = getIdentity();

  return (
    <div
      className={cn("flex items-center", s.root, {
        [s.root__withReply]: !!message.replyToMessage
      })}
      id={message.id}
      onMouseEnter={() => {
        setActionsWrapperVisible(true);
      }}
      onTouchStart={() => {
        setActionsWrapperVisible(true);
      }}
      onMouseLeave={() => {
        setActionsWrapperVisible(false);
      }}
    >
      {typeof message?.status !== "undefined" &&
        [1, 2, 3].includes(message?.status) &&
        actionsWrapperVisible && (
          <ActionsWrapper
            onReactToMessage={onReactToMessage}
            onReplyClicked={onReplyClicked}
          />
        )}

      <div className={cn("flex flex-col", s.messageWrapper)}>
        <div className={cn(s.header)}>
          {message.replyToMessage ? (
            <>
              <MessageSenderHeader message={message} />
              <span className={cn(s.separator, "mx-1")}>replied to</span>

              <MessageSenderHeader message={message.replyToMessage} />
            </>
          ) : (
            <MessageSenderHeader message={message} />
          )}

          <span className={cn(s.messageTimestamp)}>
            {moment(message.timestamp).format("hh:mm A")}
          </span>
          <a
            href={`https://dashboard.xx.network/rounds/${message.round}`}
            target="_blank"
            className="text text--xs ml-2"
            style={{
              fontSize: "9px",
              color: "var(--text-secondary)",
              textDecoration: "underline",
              marginBottom: "1px"
            }}
          >
            Show mix
          </a>
        </div>

        <div className={cn(s.body)}>
          {message.replyToMessage && (
            <p
              className={cn(s.replyToMessageBody)}
              onClick={() => {
                const originalMessage = document.getElementById(
                  message?.replyToMessage?.id || ""
                );
                if (originalMessage) {
                  originalMessage.scrollIntoView();
                  originalMessage.classList.add(s.root__highlighted);
                  setTimeout(() => {
                    originalMessage.classList.remove(s.root__highlighted);
                  }, 3000);
                }
              }}
            >
              <MessageSenderHeader message={message.replyToMessage} />

              {message.replyToMessage.body}
            </p>
          )}
          <p
            className={cn(s.messageBody, {
              [s.messageBody__failed]: message.status === 3
            })}
          >
            {message.body}
          </p>
        </div>
        {message.emojisMap && (
          <div className={cn(s.footer)}>
            <div className={cn(s.emojisWrapper)}>
              {Array.from(message.emojisMap.keys()).map(emoji => {
                return (
                  <div
                    key={`${message.id}-${emoji}`}
                    data-tip
                    data-for={`${message.id}-${emoji}-emojis-users-reactions`}
                    className={cn(s.emoji)}
                    onClick={() =>
                      onReactToMessage({
                        emoji: emoji,
                        codeName: "Mostafa"
                      })
                    }
                  >
                    <span className="mr-1">{emoji}</span>
                    <span className={cn(s.emojiCount)}>
                      {message.emojisMap?.get(emoji)?.length}
                    </span>
                  </div>
                );
              })}
            </div>
            {Array.from(message.emojisMap.keys()).map(emoji => {
              const users = message.emojisMap?.get(emoji) || [];
              const usersLength = users.length;
              return (
                <ToolTip
                  key={emoji}
                  tooltipProps={{
                    id: `${message.id}-${emoji}-emojis-users-reactions`,
                    effect: "solid",
                    place: "top",
                    className: s.emojisTooltip
                  }}
                >
                  <div className={cn(s.emojiIcon)}>{emoji}</div>
                  <p>
                    {usersLength === 1
                      ? users[0] + ` reacted with `
                      : usersLength === 2
                      ? `${users[0]} and ${users[1]} reacted with `
                      : users.slice(0, usersLength - 1).join(", ") +
                        ` and ${users[usersLength - 1]} reacted with `}
                    <span style={{ fontSize: "18px", marginLeft: "4px" }}>
                      {emoji}
                    </span>
                  </p>
                </ToolTip>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
