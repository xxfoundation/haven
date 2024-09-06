import { Head, Html, Main, NextScript } from 'next/document';

const MyDocument = () => (
  <Html>
    <Head />
    <div id='emoji-portal'/>
    <body className='loading'>
      <Main />
      <NextScript />
    </body>
  </Html>
);

export default MyDocument;
