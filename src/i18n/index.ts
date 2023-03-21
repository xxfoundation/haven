// Copyright 2017-2022 @polkadot/react-components authors & contributors
// SPDX-License-Identifier: Apache-2.0

import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import Backend from './backend';

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .use(Backend)
  .init({
    backend: {},
    debug: false,
    detection: {
      order: ['i18nLangDetector', 'navigator']
    },
    fallbackLng: false,
    interpolation: {
      escapeValue: false,
      prefix: '{{',
      suffix: '}}'
    },
    keySeparator: false,
    load: 'languageOnly',
    nsSeparator: false,
    react: {
      useSuspense: false
    },
    returnEmptyString: false,
    returnNull: false
  })
  .catch((error: Error): void =>
    console.error('i18n: failure', error)
  );


export default i18next;
