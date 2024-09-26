import { FC, useCallback, useState } from 'react';

import Registration from '../Registration';
import CodeNameRegistration from '../CodeNameRegistration';

const Register: FC = () => {
  const [password, setPassword] = useState<string>();

  const onPasswordConfirmation = useCallback((pass: string) => {
    setPassword(pass);
  }, []);

  return password
    ? <CodeNameRegistration password={password} />
    : <Registration onPasswordConfirmation={onPasswordConfirmation}></Registration>
};

export default Register;
