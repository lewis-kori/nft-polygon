import NavBar from '../ui/NavBar';
import WalletContext from '../../contexts/WalletContext';
import Onboard from 'bnc-onboard';
import { ethers } from 'ethers';

let provider;

const onBoard = Onboard({
  hideBranding: true,
  networkId: 1337,
  networkName: 'local',
  subscriptions: {
    wallet: (wallet) => {
      provider = new ethers.providers.Web3Provider(wallet.provider);
      console.log(`${wallet.name} is now connected`);
    },
  },
});

const login = async () => {
  await onBoard.walletSelect();
  await onBoard.walletCheck();
};

const DefaultLayout = (props) => {
  return (
    <div>
      <WalletContext.Provider value={{ provider, login }}>
        <NavBar />
        {props.children}
      </WalletContext.Provider>
    </div>
  );
};

export default DefaultLayout;
