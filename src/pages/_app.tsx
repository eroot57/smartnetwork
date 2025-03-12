import { AppProps } from 'next/app';
import WalletProvider from '@/context/WalletProvider';
import { BrowserRouter as Router } from 'react-router-dom';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <Router>
      <WalletProvider>
        <Component {...pageProps} />
      </WalletProvider>
    </Router>
  );
};

export default MyApp;
