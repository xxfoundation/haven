import { FC, useState, useEffect } from 'react';

import Registration from '../Registration';
import CodeNameRegistration from '../CodeNameRegistration';
import { useNetworkClient } from 'src/contexts/network-client-context';

const Register: FC = ({}) => {
  const { initiateCmix } = useNetworkClient();

  const [password, setPassword] = useState('');

  useEffect(() => {
    if (password.length) {
      initiateCmix(password);
    }
  }, [initiateCmix, password]);

  return password.length === 0 ? (
    <Registration onPasswordConfirmation={setPassword}></Registration>
  ) : (
    <CodeNameRegistration />
  );
};

export default Register;
