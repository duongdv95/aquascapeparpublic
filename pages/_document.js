import React from "react";
import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html>
        <Head />
        <body>
          <Main />
          <NextScript />
          <div id="amzn-assoc-ad-a6f6fe47-27d2-4c7b-b582-3fdb9c5f4658"></div><script async src="//z-na.amazon-adsystem.com/widgets/onejs?MarketPlace=US&adInstanceId=a6f6fe47-27d2-4c7b-b582-3fdb9c5f4658"></script>
        </body>
      </Html>
    );
  }
}

export default MyDocument;