import { FC } from 'react';
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import { faLockOpen } from '@fortawesome/free-solid-svg-icons';

const LockOpen: FC<Omit<FontAwesomeIconProps, 'icon'>> = (props) => <FontAwesomeIcon  {...props} icon={faLockOpen} />;

export default LockOpen;
