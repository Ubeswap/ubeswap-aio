import ApeModeQueryParamReader from "../hooks/useApeModeQueryParamReader";
import { Route, Switch, useHistory, useLocation, Redirect } from "react-router-dom";
import ErrorBoundary from "../components/ErrorBoundary";
import Popups from "../components/Popups";
import Web3ReactManager from "../components/Web3ReactManager";
import DarkModeQueryParamReader from "../theme/DarkModeQueryParamReader";
import { RedirectDuplicateTokenIdsNew } from "./AddLiquidity/redirects";
import RemoveLiquidityV3 from "./RemoveLiquidity/V3";
import { Pool } from "../lib/src";
import React, { useEffect, useState } from "react";
import CautionModal from "../components/CautionModal";
import { useInternet } from "../hooks/useInternet";
import { useIsNetworkFailed } from "../hooks/useIsNetworkFailed";
import Loader from "../components/Loader";
import GoogleAnalyticsReporter from "../components/analytics/GoogleAnalyticsReporter";
import { GlobalStyle, Marginer, NetworkFailedCard } from "./styled";
import Footer from "../components/Footer";
// import { t, Trans } from "@lingui/macro";

import "./index.scss";
import { UbeswapHeader } from "ubeswap-components";
import AlgebraConfig from "../algebra.config";
import styled from "styled-components/macro";
import PoolBackground from "../assets/images/background-pool.jpg";
import FarmBackground from "../assets/images/background-farm.jpg";
import { useContractKit } from "@celo-tools/use-contractkit";

const AddLiquidity = React.lazy(() => import("./AddLiquidity"));
const FarmingPage = React.lazy(() => import("./Farming/FarmingPage"));
const PoolPage = React.lazy(() => import("./Pool"));
const InfoPage = React.lazy(() => import("./InfoPage"));
const PositionPage = React.lazy(() => import("./Pool/PositionPage"));

const BackgroundImageContainer = styled.div<{ page: string }>`
    font-size: 16px;
    font-variant: none;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
    background: #121319;
    font-feature-settings: "ss01" on, "ss02" on, "cv01" on, "cv03" on;
    background-repeat: no-repeat, repeat;
    /* background-size: contain; */
    background-origin: padding-box, padding-box;
    background-clip: border-box, border-box;
    background-attachment: fixed;
    background-image: url(${({ page }) => (page === "pool" ? PoolBackground : FarmBackground)});
    -webkit-background-size: cover;
    -moz-background-size: cover;
    -o-background-size: cover;
    background-size: cover;
`;

export default function App() {
    const history = useHistory();
    const curLocation = useLocation();
    Object.defineProperty(Pool.prototype, "tickSpacing", {
        get() {
            return 60;
        },
    });
    const { address: account } = useContractKit();
    const networkFailed = useIsNetworkFailed();
    const [page, setPage] = useState("pool");

    useEffect(() => {
        if (curLocation.pathname.includes("farming")) {
            setPage("farm");
        } else {
            setPage("pool");
        }
    }, [curLocation, setPage]);

    useEffect(() => {
        if (!account) return;

        type __window = Window & { dataLayer: any };
        const _window = window as unknown as __window;

        _window.dataLayer = _window.dataLayer || [];
        _window.dataLayer.push({
            event: "userId",
            user_id: account,
        });
    }, [account]);

    return (
        <ErrorBoundary>
            <GlobalStyle />
            <Route component={DarkModeQueryParamReader} />
            <Route component={ApeModeQueryParamReader} />
            <Route component={GoogleAnalyticsReporter} />
            <BackgroundImageContainer page={page}>
                <Web3ReactManager>
                    <>
                        <UbeswapHeader
                            darkMode={true}
                            showToggleDarkMode={false}
                            enableUrlWarning={false}
                            onUpdateProvider={async (provider) => {
                                // console.log(await provider.listAccounts());
                            }}
                        />
                        <div className={"app-body w-100 ph-1 pt-3 mh-a pb-4 mm_pt-5"} style={{ zIndex: 1, marginBottom: "5rem" }}>
                            <CautionModal />
                            {/* {!internet && (
                            <InternetError>
                                <h2>Network ERROR</h2>
                            </InternetError>
                        )} */}
                            {networkFailed && (
                                <NetworkFailedCard>
                                    <div style={{ display: "flex" }}>
                                        <Loader
                                            style={{
                                                display: "inline-block",
                                                margin: "auto 8px auto 0",
                                            }}
                                            stroke={"white"}
                                        />
                                        <span>{`Connecting to ${AlgebraConfig.CHAIN_PARAMS.chainName}`}</span>
                                    </div>
                                </NetworkFailedCard>
                            )}
                            <div className={"pb-2 mm_pb-2 mxs_pb-2 maw-1180 w-100"} style={{ zIndex: 2 }}>
                                <Popups />
                                <React.Suspense fallback={<p>Loading...</p>}>
                                    <Switch>
                                        <Route strict path="/info" component={InfoPage} />

                                        <Route strict path="/farm" component={FarmingPage} />

                                        {/* <Route exact strict path="/send" component={RedirectPathToSwapOnly} /> */}
                                        {/* <Route exact strict path="/swap/:outputCurrency" component={RedirectToSwap} /> */}
                                        {/* <Route exact strict path="/swap" component={Swap} /> */}

                                        <Route exact strict path="/pool" component={PoolPage} />
                                        <Route exact strict path="/pool/:tokenId" component={PositionPage} />

                                        <Route exact strict path="/add/:currencyIdA?/:currencyIdB?/:step?" component={RedirectDuplicateTokenIdsNew} />

                                        <Route exact strict path="/increase/:currencyIdA?/:currencyIdB?/:tokenId?" component={AddLiquidity} />
                                        <Route exact strict path="/remove/:tokenId" component={RemoveLiquidityV3} />

                                        <Redirect to={"/pool"} />
                                    </Switch>
                                </React.Suspense>
                                <Marginer />
                            </div>
                        </div>
                        <Footer />
                    </>
                </Web3ReactManager>
            </BackgroundImageContainer>
        </ErrorBoundary>
    );
}
