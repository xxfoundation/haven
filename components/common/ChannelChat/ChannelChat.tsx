import { FC, useState, useRef, useEffect } from "react";
import s from "./ChannelChat.module.scss";
import SendButton from "./components/SendButton/SendButton";
import ChatMessage from "./components/ChatMessage/ChatMessage";
import { IMessage, IEmojiReaction } from "@types";
import cn from "classnames";
import { Close } from "@components/icons";
import { v4 as uuidv4 } from "uuid";
import moment from "moment";
import _ from "lodash";
import { useNetworkClient, IChannel } from "contexts/network-client-context";
import { Tree } from "@components/icons";
import { Loading } from "@components/common";
import { Spinner } from "@components/common";

const ChannelChat: FC<{}> = ({}) => {
  const {
    currentChannel,
    messages,
    setMessages,
    sendMessage,
    sendReply,
    sendReaction,
    channels
  } = useNetworkClient();

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

  // const addNewMessage = () => {
  //   if (messageBody.trim().length) {
  //     setMessages([
  //       ...messages,
  //       {
  //         id: uuidv4(),
  //         channelId: currentChannel?.id,
  //         body: messageBody.trim(),
  //         userName: "Mostafa",
  //         timestamp: Date.now(),
  //         ...(replyToMessage && { replyToMessage })
  //       }
  //     ]);
  //     setAutoScrollToEnd(true); // This should be only for my messages
  //     setMessageBody("");
  //     setReplyToMessage(null);
  //   }
  // };

  const handleReactToMessage = (
    reaction: IEmojiReaction,
    message: IMessage
  ) => {
    sendReaction(reaction.emoji, message.id);
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
              Object.entries(groupedMessagesPerDay).map(([key, value]) => {
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
                            // key={Math.random()}
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
                  if (replyToMessage) {
                    sendReply(messageBody.trim(), replyToMessage.id);
                  } else {
                    sendMessage(messageBody.trim());
                  }
                  // addNewMessage();
                  /////////
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
                  if (replyToMessage) {
                    sendReply(messageBody.trim(), replyToMessage.id);
                  } else {
                    sendMessage(messageBody.trim());
                  }
                  /////////
                  setAutoScrollToEnd(true);
                  setMessageBody("");
                  setReplyToMessage(null);
                  // addNewMessage();
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
