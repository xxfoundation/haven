import { FC, useState, useEffect } from "react";
import s from "./RightSideBar.module.scss";
import cn from "classnames";
import { Button, Collapse } from "@components/common";
import { DoubleLeftArrows, DoubleRightArrows } from "@components/icons";
import { useSpring, a } from "@react-spring/web";
import { useUI } from "contexts/ui-context";

interface IContributor {
  id: number;
  name: string;
}

const RightSideBar: FC<{ cssClasses?: string }> = ({ cssClasses }) => {
  const { openModal, setModalView } = useUI();
  const [isActive, setIsActive] = useState<boolean>(false);
  const [contributors, setContributors] = useState<IContributor[]>([
    { id: 4, name: "User name (you)" },
    { id: 2, name: "User 2" },
    { id: 1, name: "User 1" },
    { id: 3, name: "User 3" }
  ]);

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
          <Button
            cssClasses={cn("block mx-auto mb-4")}
            onClick={() => {
              setModalView("SHARE_CHANNEL");
              openModal();
            }}
          >
            Share
          </Button>
          <Button cssClasses={cn("block mx-auto")}>Admin Message</Button>
        </div>
      </div>

      <div className={s.content}>
        <Collapse title="Recent Contributors" defaultActive>
          <div className="flex flex-col">
            {contributors.map(c => {
              return (
                <span key={c.id} className={cn(s.channelPill, "headline--xs")}>
                  {c.name}
                </span>
              );
            })}
          </div>
        </Collapse>
      </div>
      <div className={s.footer}>
        <Button
          cssClasses={"block mx-auto"}
          style={{ borderColor: "var(--red)" }}
        >
          Leave
        </Button>
      </div>
    </a.div>
  );
};

export default RightSideBar;
