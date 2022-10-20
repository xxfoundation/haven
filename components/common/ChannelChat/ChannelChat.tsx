import { FC, useState, useRef, useEffect } from "react";
import s from "./ChannelChat.module.scss";
import SendButton from "./components/SendButton/SendButton";
import ChatMessage from "./components/ChatMessage/ChatMessage";
import { IMessage, IEmojiReaction } from "@types";
import cn from "classnames";
import { Close } from "@components/icons";
import moment from "moment";
import _ from "lodash";
import { useNetworkClient } from "contexts/network-client-context";
import { useUI } from "contexts/ui-context";
import { Tree } from "@components/icons";

import { Spinner } from "@components/common";

const ChannelChat: FC<{}> = ({}) => {
  const {
    currentChannel,
    messages,
    sendMessage,
    sendReply,
    sendReaction,
    channels,
    loadMoreChannelData,
    network
  } = useNetworkClient();

  const { setModalView, openModal } = useUI();

  const [messageBody, setMessageBody] = useState<string>("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [replyToMessage, setReplyToMessage] = useState<IMessage | null>();
  const [autoScrollToEnd, setAutoScrollToEnd] = useState<boolean>(true);

  let currentChannelMessages = messages.filter(m => {
    return m?.channelId === currentChannel?.id;
  });

  let groupedMessagesPerDay = _.groupBy(currentChannelMessages, message =>
    moment(moment(message.timestamp), "DD/MM/YYYY").startOf("day")
  );

  let sortedGroupedMessagesPerDay = Object.entries(groupedMessagesPerDay).sort(
    (x, y) => {
      return new Date(x[0]).getTime() - new Date(y[0]).getTime();
    }
  );

  const checkBottom = () => {
    if (messagesContainerRef && messagesContainerRef.current) {
      return (
        Math.ceil(
          messagesContainerRef.current.scrollTop +
            messagesContainerRef.current.clientHeight
        ) >= messagesContainerRef.current.scrollHeight
      );
    }
    return;
  };

  const checkTop = async () => {
    if (
      messagesContainerRef &&
      messagesContainerRef.current &&
      messagesContainerRef.current.scrollTop === 0
    ) {
      if (
        currentChannel &&
        typeof currentChannel.currentMessagesBatch !== "undefined"
      ) {
        const res = await loadMoreChannelData(currentChannel.id);
        if (res) {
          messagesContainerRef.current.scrollTop = 20;
        }
      }
    }
  };

  const scrollToEnd = () => {
    if (messagesContainerRef && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
    setAutoScrollToEnd(true);
  };

  useEffect(() => {
    if (!document.querySelector(".emoji-picker-react") && autoScrollToEnd) {
      scrollToEnd();
    }
  }, [currentChannelMessages, autoScrollToEnd]);

  const handleReactToMessage = (
    reaction: IEmojiReaction,
    message: IMessage
  ) => {
    if (network && network.ReadyToSend && !network.ReadyToSend()) {
      setModalView("NETWORK_NOT_READY");
      openModal();
    } else {
      sendReaction(reaction.emoji, message.id);
    }
  };

  return (
    <div className={s.root}>
      {currentChannel ? (
        <>
          <div className={s.channelHeader}>
            <div className={"headline--sm"}>
              {currentChannel?.name}{" "}
              <span className={"headline--xs"}>id: {currentChannel?.id}</span>
            </div>
            <p className={"text"}>{currentChannel?.description}</p>
          </div>
          <div
            id={"messagesContainer"}
            className={cn(s.messagesContainer)}
            ref={messagesContainerRef}
            onScroll={() => {
              checkTop();
              if (checkBottom()) {
                setAutoScrollToEnd(true);
              } else {
                setAutoScrollToEnd(false);
              }
            }}
          >
            {currentChannel.isLoading ? (
              <div className="m-auto flex w-full h-full justify-center items-center">
                <Spinner />
              </div>
            ) : (
              sortedGroupedMessagesPerDay.map(([key, value]) => {
                return (
                  <div className={cn(s.dayMessagesWrapper)} key={key}>
                    <div className={s.separator}></div>
                    <span className={cn(s.currentDay)}>
                      {moment(key).format("dddd MMMM Do, YYYY")}
                    </span>
                    <div>
                      {value.map((m, index) => {
                        return (
                          <ChatMessage
                            key={`${m.id}${m.status}${index}`}
                            message={m}
                            onReactToMessage={(reaction: IEmojiReaction) => {
                              handleReactToMessage(reaction, m);
                            }}
                            onReplyClicked={() => {
                              setReplyToMessage(m);
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
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
              name=""
              placeholder="Type your message here..."
              value={messageBody}
              onChange={e => {
                setMessageBody(e.target.value);
              }}
              onKeyDown={e => {
                if (e.keyCode === 13 && !e.shiftKey) {
                  e.preventDefault();

                  if (
                    network &&
                    network.ReadyToSend &&
                    !network.ReadyToSend()
                  ) {
                    setModalView("NETWORK_NOT_READY");
                    openModal();
                  } else {
                    if (replyToMessage) {
                      sendReply(messageBody.trim(), replyToMessage.id);
                    } else {
                      sendMessage(messageBody.trim());
                    }
                  }

                  setAutoScrollToEnd(true);
                  setMessageBody("");
                  setReplyToMessage(null);
                }
              }}
            />

            <div className={s.buttonsWrapper}>
              <SendButton
                cssClass={s.button}
                onClick={async () => {
                  if (
                    network &&
                    network.ReadyToSend &&
                    !network.ReadyToSend()
                  ) {
                    setModalView("NETWORK_NOT_READY");
                    openModal();
                  } else {
                    if (replyToMessage) {
                      sendReply(messageBody.trim(), replyToMessage.id);
                    } else {
                      sendMessage(messageBody.trim());
                    }
                  }

                  setAutoScrollToEnd(true);
                  setMessageBody("");
                  setReplyToMessage(null);
                }}
              />
            </div>
          </div>
        </>
      ) : channels.length ? (
        <div className={s.channelHeader}></div>
      ) : (
        <>
          <div className={s.channelHeader}></div>
          <div className="flex flex-col justify-center items-center h-full">
            <Tree></Tree>
            <div
              style={{
                fontSize: "12px",
                lineHeight: "14px",
                marginTop: "14px",
                maxWidth: "280px",
                fontWeight: "700",
                color: "var(--text-primary)"
              }}
            >
              You haven’t joined any channel yet. You can create or join a
              channel to start the journey!
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChannelChat;
