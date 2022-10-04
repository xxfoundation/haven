import { FC, useState, useEffect } from "react";
import s from "./RightSideBar.module.scss";
import cn from "classnames";
import { Button, Collapse } from "@components/common";
import { DoubleLeftArrows, DoubleRightArrows } from "@components/icons";
import { useSpring, a } from "@react-spring/web";
import { useUI } from "contexts/ui-context";
import { useNetworkClient } from "contexts/network-client-context";
import { Elixxir } from "@components/icons";

const RightSideBar: FC<{ cssClasses?: string }> = ({ cssClasses }) => {
  const {
    currentChannel,
    channels,
    getNickName,
    getIdentity,
    messages
  } = useNetworkClient();
  const [currentContributors, setCurrentContributors] = useState<any>([]);

  const currentChannelMessages = messages.filter(
    m => m.channelId === (currentChannel?.id || "")
  );

  useEffect(() => {
    const updated = [
      ...Array.from(
        new Map(
          currentChannelMessages.map(item => [item["codeName"], item])
        ).values()
      )
    ];
    setCurrentContributors(updated);
  }, [currentChannelMessages?.length]);

  const { openModal, setModalView } = useUI();
  const [isActive, setIsActive] = useState<boolean>(true);

  const codeName = getIdentity().Codename;
  let color = getIdentity().Color;
  if (color) {
    color = color.replace("0x", "#");
  }
  const nickName = getNickName();

  const animProps1 = useSpring({
    width: isActive ? "22%" : "40px",
    config: { duration: 100 }
  });

  useEffect(() => {
    const adjustActiveState = () => {
      if (window?.innerWidth <= 760) {
        setIsActive(false);
      }
    };
    adjustActiveState();
    window?.addEventListener("resize", adjustActiveState);
    return () => window?.removeEventListener("resize", adjustActiveState);
  }, []);

  const toggleIsActive = () => {
    setIsActive(!isActive);
  };
  const Icon = ({
    onClick,
    cssClass
  }: {
    onClick: Function;
    cssClass?: string;
  }) => {
    return isActive ? (
      <DoubleRightArrows onClick={onClick} className={cn(cssClass)} />
    ) : (
      <DoubleLeftArrows onClick={onClick} className={cn(cssClass)} />
    );
  };
  return (
    <a.div
      className={cn(s.root, cssClasses, { [s.root__collapsed]: !isActive })}
      style={{ overflow: "hidden", ...animProps1 }}
    >
      <div className={s.header}>
        <Icon
          onClick={() => toggleIsActive()}
          cssClass={cn("cursor-pointer", s.icon)}
        />
        <div>
          {currentChannel && (
            <>
              <Button
                cssClasses={cn("block mx-auto mb-4")}
                disabled={!currentChannel}
                onClick={() => {
                  if (currentChannel) {
                    setModalView("SHARE_CHANNEL");
                    openModal();
                  }
                }}
              >
                Share
              </Button>
              <Button
                cssClasses={cn("block mx-auto")}
                onClick={() => {
                  const filename = (window as any).logFile?.Name();
                  const data = (window as any).logFile?.GetFile();
                  const file = new Blob([data], { type: "text/plain" });
                  let a = document.createElement("a"),
                    url = URL.createObjectURL(file);
                  a.href = url;
                  a.download = filename;
                  document.body.appendChild(a);
                  a.click();
                  setTimeout(function() {
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(url);
                  }, 0);
                }}
              >
                Download Logs
              </Button>
            </>
          )}
        </div>
      </div>

      <div className={s.content}>
        {currentChannel && (
          <Collapse title="Recent Contributors" defaultActive>
            <div className="flex flex-col">
              <div className={cn(s.channelPill, "headline--xs flex flex-col")}>
                {nickName?.length ? (
                  <span style={{ color }}>{nickName} (you)</span>
                ) : (
                  <span style={{ color }} className="flex items-center">
                    <Elixxir style={{ fill: color, width: "10px" }} />
                    {codeName} (you)
                  </span>
                )}

                <span
                  style={{
                    color: "var(--cyan)"
                  }}
                  className="cursor-pointer underline mt-1"
                  onClick={() => {
                    setModalView("SET_NICK_NAME");
                    openModal();
                  }}
                >
                  {nickName?.length ? "CHANGE" : "SET NICKNAME"}
                </span>
              </div>

              {currentContributors.map((c: any) => {
                if (c.codeName === codeName) {
                  return null;
                } else {
                  return (
                    <span
                      key={c.codeName}
                      className={cn(
                        s.channelPill,
                        "headline--xs flex items-center"
                      )}
                      style={{
                        color: c?.color?.replace("0x", "#")
                      }}
                    >
                      <Elixxir
                        style={{
                          width: "10px",
                          fill: c?.color?.replace("0x", "#")
                        }}
                      />

                      {c.codeName}
                    </span>
                  );
                }
              })}
            </div>
          </Collapse>
        )}
      </div>
      <div className={s.footer}>
        {currentChannel && (
          <Button
            cssClasses={"block mx-auto"}
            style={{ borderColor: "var(--red)" }}
            disabled={!currentChannel}
            onClick={() => {
              if (currentChannel) {
                setModalView("LEAVE_CHANNEL_CONFIRMATION");
                openModal();
              }
            }}
          >
            Leave
          </Button>
        )}
      </div>
    </a.div>
  );
};

export default RightSideBar;
