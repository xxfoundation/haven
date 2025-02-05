import dayjs from 'dayjs';

export const formatTimeAgo = (date: Date | number): string => {
  return dayjs(date).format('HH:mm');
};

export const formatDate = (key: string, timestamp?: string): string => {
  const date = dayjs(key);
  const today = dayjs();
  
  if (date.isSame(today, 'day')) {
    return 'Today';
  }
  if (date.isSame(today.subtract(1, 'day'), 'day')) {
    return 'Yesterday';
  }
  return date.format('MMMM D, YYYY');
};
