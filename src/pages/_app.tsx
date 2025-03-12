import { AppProps } from 'next/app';
import WalletProvider from '@/context/WalletProvider';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const MyApp = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();

  useEffect(() => {
    // Custom logic to handle route changes if needed
    const handleRouteChange = (url: string) => {
      console.log(`App is changing to: ${url}`);
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router.events]);

  return (
    <WalletProvider>
      <Component {...pageProps} />
    </WalletProvider>
  );
};

export default MyApp;
