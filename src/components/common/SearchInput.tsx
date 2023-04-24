import { FC, InputHTMLAttributes } from 'react';
import s from './SearchInput.module.scss';
import { useTranslation } from 'react-i18next';

const SearchInput: FC<InputHTMLAttributes<HTMLInputElement>> = (props) => {
  const { t } = useTranslation();
  return (
    <div className={s.search}>
      <input {...props} placeholder={props.placeholder || t('Search...')} />
      <div className='absolute inset-y-0 right-2 flex items-center pl-3 pointer-events-none'>
        <svg aria-hidden='true' className='w-5 h-5 text-gray-500 dark:text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'></path></svg>
      </div>
    </div>
  );
}

export default SearchInput;