import { FC, useState, useEffect } from "react";
import RegisterView from "./components/RegisterView";
import RegisterView2 from "./components/RegisterView2";
import { useNetworkClient } from "contexts/network-client-context";
import { useAuthentication } from "contexts/authentication-context";

const Register: FC<{}> = ({}) => {
  const { initiateCmix } = useNetworkClient();

  const [password, setPassword] = useState("");

  useEffect(() => {
    if (password.length) {
      initiateCmix(password);
    }
  }, [password]);

  const onConfirm = (password: string) => {
    setPassword(password);
  };

  return password.length === 0 ? (
    <RegisterView onConfirm={onConfirm}></RegisterView>
  ) : (
    <RegisterView2></RegisterView2>
  );
};

export default Register;
