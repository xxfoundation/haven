import React, { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export type ListItem = {
  label: string;
  id: string;
}

type Props = {
  maxItemsBeforeTruncate?: number;
  list: ListItem[];
  onClick?: (id: string) => void;
}

const EnumerateList: FC<Props> = ({ list, onClick }) => {
  const { t } = useTranslation();
  const ListItemComponent = onClick ? 'button' : 'span';

  const makeOnClick = useCallback((id: string) => () => {
    if (onClick) {
      onClick(id);
    }
  }, [onClick]);

  if (list.length === 0) {
    return <></>;
  }

  return (
    <>
      {list.slice(0, -1).map((item, index) => (
        <React.Fragment key={index}>
          <ListItemComponent className={onClick && 'text-cyan'} onClick={makeOnClick(item.id)}>
            {item.label}
          </ListItemComponent>
          {index < list.length - 2 && (', ')}
        </React.Fragment>
      ))}
      {list.length > 1 && (
        <span>{t(' and ')}</span>
      )}
      {list[list.length - 1] && (
        <ListItemComponent className={onClick && 'text-cyan'} onClick={makeOnClick(list[list.length - 1].id)}>
          {list[list.length - 1].label}
        </ListItemComponent>
      )}
    </>
  );
}

export default EnumerateList;