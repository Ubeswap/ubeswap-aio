import "inter-ui";
import "@reach/dialog/styles.css";
import "./components/analytics";
import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { createWeb3ReactRoot, Web3ReactProvider } from "@web3-react/core";
import { StrictMode } from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import { HashRouter } from "react-router-dom";
import Blocklist from "./components/Blocklist";
import { NetworkContextName } from "./constants/misc";
// import { LanguageProvider } from "./i18n";
import App from "./pages/App";
import store from "./state";
import ApplicationUpdater from "./state/application/updater";
import ListsUpdater from "./state/lists/updater";
import MulticallUpdater from "./state/multicall/updater";
import LogsUpdater from "./state/logs/updater";
import TransactionUpdater from "./state/transactions/updater";
import UserUpdater from "./state/user/updater";
import ThemeProvider, { ThemedGlobalStyle } from "./theme";
import getLibrary from "./utils/getLibrary";
import "@fontsource/montserrat";
import { ContractKitProvider } from "@celo/react-celo";
import GasUpdater from "./state/application/gasUpdater";
import "./assets/styles/index.scss";

import AlgebraConfig from "./algebra.config";
import { Alfajores, Mainnet } from "ubeswap-components/src/networks";

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName);

if (window.ethereum) {
    window.ethereum.autoRefreshOnNetworkChange = false;
}

const client = new ApolloClient({
    uri: AlgebraConfig.SUBGRAPH.infoURL,
    cache: new InMemoryCache(),
});

function Updaters() {
    return (
        <>
            <ListsUpdater />
            <UserUpdater />
            <ApplicationUpdater />
            <TransactionUpdater />
            <MulticallUpdater />
            <LogsUpdater />
            <GasUpdater />
        </>
    );
}

ReactDOM.render(
    <StrictMode>
        <ContractKitProvider
            dapp={{
                name: "Ubeswap",
                description: "The interface for Ubeswap, a decentralized exchange and automated market maker protocol for Celo assets.",
                url: "https://app.ubeswap.org",
                icon: "https://info.ubeswap.org/favicon.png",
            }}
            network={Mainnet}
            networks={[Mainnet, Alfajores]}
            connectModal={{
                reactModalProps: {
                    style: {
                        content: {
                            top: "50%",
                            left: "50%",
                            right: "auto",
                            bottom: "auto",
                            transform: "translate(-50%, -50%)",
                            border: "unset",
                            background: "unset",
                            padding: "unset",
                            color: "black",
                        },
                        overlay: {
                            zIndex: 100,
                        },
                    },
                    overlayClassName: "tw-fixed tw-bg-gray-100 dark:tw-bg-gray-700 tw-bg-opacity-75 tw-inset-0",
                },
            }}
        >
            <ApolloProvider client={client}>
                <Provider store={store}>
                    <HashRouter>
                        {/* <LanguageProvider> */}
                        <Web3ReactProvider getLibrary={getLibrary}>
                            <Web3ProviderNetwork getLibrary={getLibrary}>
                                <Blocklist>
                                    <Updaters />
                                    <ThemeProvider>
                                        <ThemedGlobalStyle />
                                        <App />
                                    </ThemeProvider>
                                </Blocklist>
                            </Web3ProviderNetwork>
                        </Web3ReactProvider>
                        {/* </LanguageProvider> */}
                    </HashRouter>
                </Provider>
            </ApolloProvider>
        </ContractKitProvider>
    </StrictMode>,
    document.getElementById("root")
);
