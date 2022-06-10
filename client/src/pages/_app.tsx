import { Chakra } from "../lib/components/Chakra";
import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Chakra>
      <Component {...pageProps} />
    </Chakra>
  );
}

export default MyApp;
