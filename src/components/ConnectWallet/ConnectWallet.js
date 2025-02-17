import { useEffect, useState } from 'react';
import Option from './Option';
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core';
import BigNumber from 'bignumber.js';
import classNames from 'classnames';
import Loader from '../Loader/Loader';
import { SUPPORTED_WALLETS } from '../../config/wallets';
import { isMobile } from 'react-device-detect';
import { WalletConnectConnector } from '@web3-react/walletconnect-connector';
import { injected } from '../../config/connectors';
import { isMetamask } from '../../utils/detection';
import MetaMaskIcon from '../../data/icons/wallet/metamask.svg';
import { Link } from 'react-router-dom';
import Routes from '../../constants/Routes';

import {
  NoEthereumProviderError,
  UserRejectedRequestError as UserRejectedRequestErrorInjected,
} from '@web3-react/injected-connector';
import { UserRejectedRequestError as UserRejectedRequestErrorWalletConnect } from '@web3-react/walletconnect-connector';

import styles from './styles.module.scss';

const WALLET_VIEWS = {
  OPTIONS: 'OPTIONS',
  ACCOUNT: 'ACCOUNT',
  PENDING: 'PENDING',
};

function isUserRejected (error) {
  return (
    error instanceof UserRejectedRequestErrorInjected ||
    error instanceof UserRejectedRequestErrorWalletConnect ||
    (error.message && error.message === 'User denied account authorization')
  );
}

function getErrorMessage (error) {
  if (error instanceof NoEthereumProviderError) {
    return (
      <div>
        No Ethereum browser extension detected, install MetaMask on desktop or
        visit from a dApp browser on mobile.
        <a
          href={
            isMetamask || !isMobile
              ? 'https://metamask.io/download/'
              : `https://metamask.app.link/dapp/${window.location.origin}`
          }
          data-tracking-id="install-metamask-button"
          data-content-type="dashboard"
          target="_blank"
          rel="noreferrer"
          className={styles.installLink}
        >
          <div className={styles.installButtonContent}>
            <img src={MetaMaskIcon} alt="metamask" width="40" height="30" />
            Install Metamask
          </div>
        </a>
      </div>
    );
  } else if (error instanceof UnsupportedChainIdError) {
    return "You're connected to an unsupported network.";
  } else if (isUserRejected(error)) {
    return 'Please authorize this website to access your Ethereum account.';
  } else {
    console.error(error);
    return error.message || 'Unknown error';
  }
}

const ConnectWallet = props => {
  const [walletError, setWalletError] = useState('');
  const {
    active,
    account,
    library,
    connector,
    activate,
    error,
  } = useWeb3React();
  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT);
  const [balance, setBalance] = useState('');

  useEffect(() => {
    if (account && library) {
      library
        .getBalance(account)
        .then(bal => new BigNumber(bal))
        .then(bal => setBalance(bal.toFormat(2)));
    }
  }, [account, library]);

  const tryActivation = newConnector => {
    setWalletView(WALLET_VIEWS.PENDING);
    if (
      newConnector instanceof WalletConnectConnector &&
      newConnector.walletConnectProvider?.wc?.uri
    ) {
      newConnector.walletConnectProvider = undefined;
    }

    const metamask = window.ethereum?._metamask;
    if (metamask) {
      metamask.isUnlocked()
        .then(unlocked => !unlocked && 
          setWalletError('Please unlock your metamask and proceed with signing'));
    }

    newConnector &&
      activate(newConnector, undefined, true)
        .then(() => {
          setWalletView(WALLET_VIEWS.ACCOUNT);
        })
        .catch(error => {
          if (isUserRejected(error)) {
            setWalletError('');
          } else {
            const message = getErrorMessage(error);
            setWalletError(message);
          }
        });
  };

  const getOptions = () => {
    return Object.keys(SUPPORTED_WALLETS).map(key => {
      const option = SUPPORTED_WALLETS[key];
      if (isMobile) {
        if (option.mobile) {
          return (
            <Option
              id={`connect-${key}`}
              header={option.name}
              key={key}
              link={option.href}
              active={option.connector === connector}
              icon={option.iconURL}
              onClick={() => {
                option.connector === connector
                  ? setWalletView(WALLET_VIEWS.ACCOUNT)
                  : !option.href && tryActivation(option.connector);
              }}
            />
          );
        }
        return null;
      }

      // overwrite injected when needed
      if (option.connector === injected) {
        // don't show injected if there's no injected provider
        // @ts-ignore
        if (!(window.web3 || window.ethereum)) {
          return null;
        }
        // don't return metamask if injected provider isn't metamask
        else if (option.name === 'MetaMask' && !isMetamask) {
          return null;
        }
        // likewise for generic
        else if (option.name === 'Injected' && isMetamask) {
          return null;
        }
      }

      // return rest of options
      return (
        !isMobile &&
        !option.mobileOnly && (
          <Option
            id={`connect-${key}`}
            header={option.name}
            key={key}
            link={option.href}
            active={option.connector === connector}
            icon={option.iconURL}
            onClick={() => {
              option.connector === connector
                ? setWalletView(WALLET_VIEWS.ACCOUNT)
                : !option.href && tryActivation(option.connector);
            }}
          />
        )
      );
    });
  };

  const getContentWithOptions = () => {
    return <>
      {getModalHeader()}
      <div className={styles.optionsWrap}>{getOptions()}</div>
    </>;
  };

  const getContentLoading = () => {
    if (walletError) {
      return (
        <div className={classNames(styles.optionsWrap, styles.optionsError)}>
          <strong>{`Your attention is needed`}</strong>
          <div>{walletError}</div>
        </div>
      );
    }

    return (
      <div className={styles.optionsWrap}>
        <Loader />
      </div>
    );
  };

  const getModalHeader = () => {
    if (walletError) return null;
    return (
      <>
        <div className={styles.modalHeaderDesc}>
          <span className={styles.mainHeader}>Play. Trade. Earn.</span>
          <span className={styles.subHeader}>
            Choose a Wallet to connect this App
          </span>
        </div>
      </>
    );
  };

  const getModalContent = () => {
    if (error) {
      return (
        <span>
          {error instanceof UnsupportedChainIdError
            ? 'WRONG NETWORK'
            : 'ERROR IN MODAL'}
        </span>
      );
    }
    if (account && walletView === WALLET_VIEWS.ACCOUNT) {
      return (
        <div className={styles.accountInfo}>
          <span>{account}</span>
          <br />
          <span>{!isNaN(balance) && balance}</span>
          <br />
          <p className={styles.colorGrey}>Please ensure MetaMask is unlocked</p>
        </div>
      );
    }

    return (
      <>
        {walletView === WALLET_VIEWS.PENDING
          ? getContentLoading()
          : getContentWithOptions()}
        {!walletError && <p className={styles.colorGrey}>
          Click „Sign in“ to agree to the collection of information in cookies,
          I agree with{' '}
          <Link data-tracking-id="footer-privacy" to={Routes.privacy}>
            <span className={styles.descLink}>Privacy Policy</span>
          </Link>{' '}
          and with{' '}
          <Link data-tracking-id="footer-terms" to={Routes.terms}>
            <span className={styles.descLink}>Terms of Use</span>
          </Link>
          . Gambling isn't forbidding by my local authorities and I'm at least
          18 years old.
        </p> }
      </>
    );
  };

  return <div className={styles.walletsContainer}>{getModalContent()}</div>;
};

export default ConnectWallet;
