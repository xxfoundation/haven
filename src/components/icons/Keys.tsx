import { FC } from 'react';
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import { faKey } from '@fortawesome/free-solid-svg-icons';

const Keys: FC<Omit<FontAwesomeIconProps, 'icon'>> = (props) => <FontAwesomeIcon  {...props} icon={faKey} />;

export default Keys;
