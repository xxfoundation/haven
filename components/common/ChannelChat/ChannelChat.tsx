import { FC } from "react";
import s from "./ChannelChat.module.scss";
import SendButton from "./components/SendButton/SendButton";

const ChannelChat: FC<{}> = ({}) => {
  return (
    <div className={s.root}>
      <div className={s.channelHeader}>
        <div className={"headline--sm"}>
          Channel 3 <span className={"headline--xs"}>(id: 2585Th)</span>
        </div>
        <p className={"text"}>
          Description goes here ipsum dolor sit amet, consectetur adipiscing
          elit. Maecenas posuere cursus posuere. Nunc dolor elit, malesuada sed
          dui vitae, euismod dictum elit. Morbi faucibus id nibh eu
        </p>
      </div>
      <div className={s.messagesContainer}></div>
      <div className={s.textArea}>
        <textarea name="" placeholder="Type your message here..."></textarea>
        <div className={s.buttonsWrapper}>
          <SendButton cssClass={s.button} />
        </div>
      </div>
    </div>
  );
};

export default ChannelChat;
