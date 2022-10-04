import { FC, useState } from "react";
import s from "./RegisterView.module.scss";
import { ModalCtaButton } from "@components/common";
import cn from "classnames";

const RegisterView: FC<{
  onConfirm: Function;
}> = ({ onConfirm }) => {
  const [password, setPassword] = useState<string>("");
  const [passwordConfirm, setPasswordConfirm] = useState<string>("");
  const [error, setError] = useState<string>("");

  return (
    <div
      className={cn("w-full flex flex-col justify-center items-center", s.root)}
    >
      <h2 className="mt-9 mb-4">Registration</h2>

      <p
        className="mb-12 text"
        style={{ color: "var(--cyan)", lineHeight: "13px" }}
      >
        !!Warning: Your password cannot be recovered or changed, please make
        sure to keep it safe.
      </p>
      <input
        type="password"
        placeholder="Enter your password"
        className="mt-4"
        value={password}
        onChange={e => {
          setPassword(e.target.value);
        }}
      />
      <input
        type="password"
        placeholder="Confirm your password"
        className="mt-4"
        value={passwordConfirm}
        onChange={e => {
          setPasswordConfirm(e.target.value);
        }}
      />
      {error && (
        <div className={"text text--xs mt-2"} style={{ color: "var(--red)" }}>
          {error}
        </div>
      )}
      <div className="flex flex-col my-5">
        <ModalCtaButton
          buttonCopy="Continue"
          cssClass="mb-4"
          onClick={() => {
            if (passwordConfirm !== password) {
              setError("Password doesn't match confirmation.");
            } else {
              if (password.length) {
                onConfirm(password);
              }
              setError("");
            }
          }}
        />
      </div>
    </div>
  );
};

export default RegisterView;
