import { FC } from 'react';
import { FontAwesomeIcon, FontAwesomeIconProps } from '@fortawesome/react-fontawesome';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';

const Ellipsis: FC<Omit<FontAwesomeIconProps, 'icon'>> = (props) => <FontAwesomeIcon  {...props} icon={faEllipsis} />;

export default Ellipsis;
