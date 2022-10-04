import { FC } from "react";
import s from "./Loading.module.scss";
import { Spinner } from "@components/common";
import { Elixxir } from "@components/icons";

const Loading: FC<{}> = ({}) => {
  return (
    <div className={s.root}>
      <Elixxir
        style={{
          marginBottom: "72px"
        }}
      />
      <Spinner />
    </div>
  );
};

export default Loading;
