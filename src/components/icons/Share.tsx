import { FC } from 'react';
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import { faShareNodes } from '@fortawesome/free-solid-svg-icons';

const Share: FC<Omit<FontAwesomeIconProps, 'icon'>> = (props) => <FontAwesomeIcon  {...props} icon={faShareNodes} />;

export default Share;
