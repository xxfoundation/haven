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
      <h2 className="mt-9 mb-4">Get Started</h2>

      <p
        className="mb-6 text"
        style={{ color: "var(--cyan)", lineHeight: "13px" }}
      >
        Select a password to secure your speakeasy identity
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

      <div
        style={{
          color: "var(--red)",
          marginTop: "14px",
          fontSize: "11px",
          maxWidth: "444px",
          textAlign: "center"
        }}
      >
        !!Warning: Your password cannot be recovered or changed, please make
        sure to keep it safe.
      </div>

      <div className="flex flex-col mb-5 mt-14">
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
