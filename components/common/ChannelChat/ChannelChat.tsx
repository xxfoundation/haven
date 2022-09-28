import { FC, useState, useRef, useEffect, useCallback } from "react";
import s from "./ChannelChat.module.scss";
import SendButton from "./components/SendButton/SendButton";
import ChatMessage from "./components/ChatMessage/ChatMessage";
import { IMessage, IEmojiReaction } from "@types";
import cn from "classnames";
import { Close } from "@components/icons";
import { v4 as uuidv4 } from "uuid";
import { randomStringGenerator } from "@utils";
import { useInterval } from "@utils/hooks/useIntervals";
import moment from "moment";
import _ from "lodash";
import { useNetworkClient } from "contexts/network-client-context";

const fakeHoursFlag = true;

const ChannelChat: FC<{}> = ({}) => {
  const {
    currentChannel,
    channels,
    setCurrentChannel,
    sendMessage
  } = useNetworkClient();

  const [channelMessages, setChannelMessages] = useState<IMessage[]>([]);
  const [messageBody, setMessageBody] = useState<string>("");
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [replyToMessage, setReplyToMessage] = useState<IMessage | null>();
  const [autoScrollToEnd, setAutoScrollToEnd] = useState<boolean>(true);

  let groupedMessagesPerDay = _.groupBy(channelMessages, message =>
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
  }, [channelMessages, autoScrollToEnd]);

  const addNewMessage = (externalMessage?: IMessage) => {
    let fakeTimestamp;

    if (fakeHoursFlag && channelMessages.length) {
      const copyDate = new Date(
        channelMessages[channelMessages.length - 1].timestamp
      );
      fakeTimestamp = copyDate.setTime(copyDate.getTime() + 1 * 60 * 60 * 1000);
    }

    if (externalMessage) {
      setChannelMessages([
        ...channelMessages,
        {
          ...externalMessage,
          ...(fakeTimestamp && { timestamp: fakeTimestamp })
        }
      ]);
      return;
    }
    if (messageBody.trim().length) {
      setChannelMessages([
        ...channelMessages,
        {
          id: uuidv4(),
          body: messageBody.trim(),
          userName: "Mostafa",
          timestamp: Date.now(),
          ...(replyToMessage && { replyToMessage }),
          ...(fakeTimestamp && { timestamp: fakeTimestamp })
        }
      ]);
      setAutoScrollToEnd(true); // This should be only for my messages
      setMessageBody("");
      setReplyToMessage(null);
    }
  };

  const handleReactToMessage = (
    reaction: IEmojiReaction,
    message: IMessage
  ) => {
    const temp = message;
    // If no emojis map set it.
    if (!temp.emojisMap) {
      temp.emojisMap = new Map();
    }

    // If no key for this reaction set it with this username as the value
    if (!temp.emojisMap.has(reaction.emoji)) {
      temp.emojisMap.set(reaction.emoji, [reaction.userName]);
    } else {
      const previousInteractedUsers = temp.emojisMap.get(reaction.emoji) || [];
      // If emojisMap has this same interaction for this user before then delete it
      if (previousInteractedUsers?.includes(reaction.userName)) {
        const updatedInteractedUsers = previousInteractedUsers.filter(
          u => u !== reaction.userName
        );
        if (updatedInteractedUsers.length) {
          temp.emojisMap.set(reaction.emoji, updatedInteractedUsers);
        } else {
          temp.emojisMap.delete(reaction.emoji);
        }
      } else {
        //else add it to the array
        previousInteractedUsers.push(reaction.userName);
        temp.emojisMap.set(reaction.emoji, previousInteractedUsers);
      }
    }

    setChannelMessages(
      channelMessages.map(m => {
        if (m.id === message.id) {
          return temp;
        } else {
          return m;
        }
      })
    );
  };

  return (
    <div className={s.root}>
      {currentChannel ? (
        <>
          {" "}
          <div className={s.channelHeader}>
            <div className={"headline--sm"}>
              {currentChannel?.name}{" "}
              <span className={"headline--xs"}>id: {currentChannel?.id}</span>
            </div>
            <p className={"text"}>{currentChannel?.description}</p>
          </div>
          <div
            id={"messagesContainer"}
            className={s.messagesContainer}
            ref={messagesContainerRef}
            onScroll={() => {
              if (checkBottom()) {
                setAutoScrollToEnd(true);
              } else {
                setAutoScrollToEnd(false);
              }
            }}
          >
            {Object.entries(groupedMessagesPerDay).map(([key, value]) => {
              return (
                <div className={cn(s.dayMessagesWrapper)} key={key}>
                  <div className={s.separator}></div>
                  <span className={cn(s.currentDay)}>
                    {moment(key).format("dddd MMMM Do, YYYY")}
                  </span>
                  <div>
                    {value.map(m => {
                      return (
                        <ChatMessage
                          key={m.id}
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
            })}
          </div>
          <div className={s.textArea}>
            {replyToMessage && (
              <div className={cn(s.replyContainer)}>
                <div className="flex flex-col flex-1">
                  <span>Reply to {replyToMessage.userName}</span>
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
                  addNewMessage();
                }
              }}
            />

            <div className={s.buttonsWrapper}>
              <SendButton
                cssClass={s.button}
                onClick={async () => {
                  sendMessage(messageBody);
                  addNewMessage();
                }}
              />
            </div>
          </div>
        </>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default ChannelChat;
