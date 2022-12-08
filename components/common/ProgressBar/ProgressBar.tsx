import { FC } from "react";
import s from "./ProgressBar.module.scss";

const ProgressBar = (props: any) => {
  const { completed } = props;

  const containerStyles = {
    height: 40,

    width: "320px",

    borderRadius: 50,
    margin: 50,
    border: "2px solid var(--secondary)"
  };

  const fillerStyles = {
    height: "100%",
    width: `${completed > 100 ? 100 : completed}%`,
    backgroundColor: "var(--cyan)",
    borderRadius: "inherit"
  };

  const labelStyles = {
    padding: 5,
    color: "white",
    fontWeight: "bold"
  };

  return (
    <div className="relative" style={containerStyles}>
      <div className="text-center" style={fillerStyles}>
        <span style={labelStyles}></span>
        <span
          style={{
            position: "absolute",

            left: "50%",
            transform: "translate(-50%, -50%)",
            top: "50%",
            fontWeight: "700",
            fontSize: "14px"
          }}
        >{`${completed > 100 ? 100 : completed}%`}</span>
      </div>
    </div>
  );
};

export default ProgressBar;
