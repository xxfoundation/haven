import { FC } from 'react';
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

const Slash: FC<Omit<FontAwesomeIconProps, 'icon'>> = (props) => <FontAwesomeIcon  {...props} icon={faXmark} />;

export default Slash;
