import { FC, useState } from "react";
import s from "./LeftSideBar.module.scss";
import cn from "classnames";
import { Button, Collapse } from "@components/common";
import { Elixxir } from "@components/icons";
import { useUI } from "contexts/ui-context";

interface IChannel {
  id: number;
  title: string;
}

const LeftSideBar: FC<{
  cssClasses?: string;
}> = ({ cssClasses }) => {
  const { openModal, closeModal, setModalView } = useUI();

  const [channels, setChannels] = useState<IChannel[]>([
    { id: 1, title: "Channel 1" },
    { id: 2, title: "Channel 2" },
    { id: 3, title: "Channel 3" }
  ]);

  const [currentActiveChannel, setCurrentActiveChannel] = useState(
    channels[0].id
  );

  const onChannelChange = (ch: IChannel) => {
    setCurrentActiveChannel(ch.id);
  };

  return (
    <div className={cn(s.root, cssClasses)}>
      <div className={s.header}>
        <Elixxir />
        <div className={"headline--text"}>Elixxir Covert Communites</div>
      </div>
      <div className={s.content}>
        <Collapse title="JOINED" defaultActive>
          <div className="flex flex-col">
            {channels.map(ch => {
              return (
                <span
                  key={ch.id}
                  className={cn(s.channelPill, "headline--xs", {
                    [s.channelPill__active]: ch.id === currentActiveChannel
                  })}
                  onClick={() => {
                    onChannelChange(ch);
                  }}
                >
                  {ch.title}
                </span>
              );
            })}
          </div>
        </Collapse>
      </div>
      <div className={s.footer}>
        <Button
          cssClasses={"w-full mb-3"}
          onClick={() => {
            setModalView("JOIN_CHANNEL");
            openModal();
          }}
        >
          Join Channel
        </Button>
        <Button
          cssClasses={"w-full"}
          onClick={() => {
            setModalView("CREATE_CHANNEL");
            openModal();
          }}
        >
          Create Channel
        </Button>
      </div>
    </div>
  );
};

export default LeftSideBar;
