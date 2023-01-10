import Document, { Head, Html, Main, NextScript } from 'next/document';
import Script from 'next/script';

class MyDocument extends Document {
  render() {
    return (
      <Html lang='en-US'>
        <Head />
        <div id='emoji-portal'/>
        <body className='loading'>
          <Main />
          <NextScript />
          <Script
            id='wasm_script'
            src='/integrations/assets/wasm_exec.js'
            strategy='beforeInteractive'
            type='text/javascript'
          />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
