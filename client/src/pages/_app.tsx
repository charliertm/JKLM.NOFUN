import type { AppProps } from "next/app";
import { Chakra } from "../lib/components/Chakra";
import Layout from "../lib/layout";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Chakra>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </Chakra>
  );
}

export default MyApp;
