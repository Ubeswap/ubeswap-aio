import { SwitchLocaleLink } from "../../components/SwitchLocaleLink";
import { forwardRef, useEffect, useMemo, useState } from "react";
import { Redirect, Route, Switch, useRouteMatch } from "react-router-dom";
import { useFarmingSubgraph } from "../../hooks/useFarmingSubgraph";
import { AlignJustify, Calendar, Zap } from "react-feather";
import { useActiveWeb3React } from "../../hooks/web3";
import { FarmingMyFarms } from "../../components/FarmingMyFarms";
import { FarmingEventsPage } from "../FarmingEventsPage";
import { useWalletModalToggle } from "../../state/application/hooks";
import { Helmet } from "react-helmet";
import EternalFarmsPage from "../EternalFarmsPage";
import EventsHistory from "../EventsHistory";
import { FarmingMyRewards } from "../../components/FarmingMyRewards";
import { FormattedRewardInterface, Reward } from "../../models/interfaces";
import Card from "../../shared/components/Card/Card";
import Menu from "../../components/Menu";
import { useAppSelector } from "../../state/hooks";
import { useContractKit } from "@celo/react-celo";
// import { t, Trans } from "@lingui/macro";

export const InfinityIcon = forwardRef(({ color = "currentColor", size = 18, ...rest }: { color?: string; size: number }, ref: any) => {
    return (
        <svg
            ref={ref}
            width={size}
            height={size}
            viewBox="0 0 18 18"
            fill="none"
            stroke={color}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1}
            xmlns="http://www.w3.org/2000/svg"
            {...rest}
        >
            <path d="M13.2705 6C13.9662 6 14.5974 6.15351 15.1643 6.46053C15.744 6.75526 16.1948 7.16667 16.5169 7.69474C16.839 8.22281 17 8.81842 17 9.48158C17 10.1447 16.8325 10.7465 16.4976 11.2868C16.1755 11.8149 15.7311 12.2325 15.1643 12.5395C14.5974 12.8465 13.9662 13 13.2705 13C12.2271 13 11.3897 12.7789 10.7585 12.3368C10.1272 11.8825 9.5475 11.25 9.01932 10.4395C8.47826 11.25 7.89211 11.8825 7.26087 12.3368C6.62963 12.7789 5.79227 13 4.74879 13C4.04026 13 3.40258 12.8465 2.83575 12.5395C2.26892 12.2325 1.81804 11.8149 1.48309 11.2868C1.16103 10.7465 1 10.1509 1 9.5C1 8.83684 1.16103 8.24123 1.48309 7.71316C1.81804 7.17281 2.26892 6.75526 2.83575 6.46053C3.40258 6.15351 4.04026 6 4.74879 6C5.79227 6 6.62963 6.22719 7.26087 6.68158C7.89211 7.12368 8.47826 7.75 9.01932 8.56053C9.5475 7.75 10.1272 7.12368 10.7585 6.68158C11.3897 6.22719 12.2271 6 13.2705 6ZM4.82609 11.9684C5.41868 11.9684 5.92754 11.864 6.35266 11.6553C6.79066 11.4342 7.15781 11.1518 7.45411 10.8079C7.76328 10.464 8.08535 10.0281 8.42029 9.5C8.08535 8.97193 7.76328 8.53596 7.45411 8.19211C7.15781 7.84825 6.79066 7.57193 6.35266 7.36316C5.92754 7.14211 5.41868 7.03158 4.82609 7.03158C4.05314 7.03158 3.40902 7.27105 2.89372 7.75C2.3913 8.21667 2.1401 8.8 2.1401 9.5C2.1401 10.2 2.3913 10.7895 2.89372 11.2684C3.40902 11.7351 4.05314 11.9684 4.82609 11.9684ZM13.1932 11.9684C13.9662 11.9684 14.6039 11.7351 15.1063 11.2684C15.6087 10.7895 15.8599 10.1939 15.8599 9.48158C15.8599 8.78158 15.6087 8.19825 15.1063 7.73158C14.6039 7.26491 13.9662 7.03158 13.1932 7.03158C12.6006 7.03158 12.0853 7.14211 11.6473 7.36316C11.2222 7.57193 10.8551 7.84825 10.5459 8.19211C10.2496 8.53596 9.93398 8.97193 9.59903 9.5C9.93398 10.0281 10.2496 10.464 10.5459 10.8079C10.8551 11.1518 11.2222 11.4342 11.6473 11.6553C12.0853 11.864 12.6006 11.9684 13.1932 11.9684Z" />
        </svg>
    );
});

InfinityIcon.displayName = "Airplay";

const farmingMenuList = [
    {
        title: `My Farms`,
        icon: <AlignJustify size={18} />,
        link: "farms",
    },
    {
        title: `Infinite Farms`,
        icon: <InfinityIcon size={18} />,
        link: "infinite-farms",
    },
    // {
    //     title: t`Limit Farms`,
    //     icon: <Zap size={18} />,
    //     link: "limit-farms",
    //     marked: true,
    // },
    // {
    //     title: t`Farms History`,
    //     icon: <Calendar size={18} />,
    //     link: "farms-history",
    // },
];

export default function FarmingPage() {
    const { account } = useActiveWeb3React();
    const { path } = useRouteMatch();
    // const toggleWalletModal = useWalletModalToggle();
    const { connect } = useContractKit();

    const hasTransferred = useAppSelector((state) => state.farming.hasTransferred);

    const {
        ethPricesFecthed,
        fetchRewards: { rewardsResult, fetchRewardsFn, rewardsLoading },
        fetchAllEvents: { fetchAllEventsFn, allEvents, allEventsLoading },
        fetchTransferredPositions: { fetchTransferredPositionsFn, transferredPositions, transferredPositionsLoading },
        fetchEternalFarms: { fetchEternalFarmsFn, eternalFarms, eternalFarmsLoading },
        fetchHasTransferredPositions: { fetchHasTransferredPositionsFn, hasTransferredPositions, hasTransferredPositionsLoading },
    } = useFarmingSubgraph() || {};

    const [now, setNow] = useState(Date.now());

    const formattedData = useMemo(() => {
        if (typeof rewardsResult === "string") return [];

        return rewardsResult.filter((el) => Boolean(+el.trueAmount));
    }, [rewardsResult]);

    useEffect(() => {
        const timeNow = setInterval(() => setNow(Date.now()), 1000);
        return () => {
            clearInterval(timeNow);
        };
    }, []);

    return (
        <>
            <Helmet>
                <title>{`Ubeswap — Farming`}</title>
            </Helmet>
            <Card classes={"br-24 p-2 mm_p-1"}>
                <Menu
                    items={farmingMenuList}
                    classes={"fs-125 mb-2"}
                    refreshHandler={() => (account ? fetchTransferredPositionsFn(true) : undefined)}
                    isLoading={transferredPositionsLoading}
                    size={"17px"}
                />
                <Switch>
                    <Route exact path={`${path}`}>
                        <Redirect to={`${path}/${!account ? "infinite-farms" : hasTransferred ? "farms" : "infinite-farms"}`} />
                    </Route>
                    <Route exact path={`${path}/farms`}>
                        <Helmet>
                            <title>{`Ubeswap — Farming • My Farms`}</title>
                        </Helmet>
                        {account ? (
                            <>
                                <FarmingMyRewards data={formattedData as Reward[] & FormattedRewardInterface[]} refreshing={rewardsLoading} fetchHandler={() => fetchRewardsFn(true)} />
                                <FarmingMyFarms
                                    data={transferredPositions}
                                    refreshing={transferredPositionsLoading}
                                    fetchHandler={() => {
                                        fetchTransferredPositionsFn(true);
                                    }}
                                    now={now}
                                />
                            </>
                        ) : (
                            <div className={"f f-ac f-jc f c h-400"}>
                                <AlignJustify size={40} stroke={"white"} />
                                <p className={"mb-1"}>Connect your account to view farms</p>
                                <button className={"btn primary pv-05 ph-2 br-8 b"} onClick={connect}>
                                    Connect Wallet
                                </button>
                            </div>
                        )}
                    </Route>
                    {/* <Route exact path={`${path}/limit-farms`}>
                        <Helmet>
                            <title>{t`Ubeswap — Farming • Limit Farms`}</title>
                        </Helmet>
                        <FarmingEventsPage data={allEvents} refreshing={allEventsLoading} fetchHandler={() => fetchAllEventsFn(true)} now={now} />
                    </Route> */}
                    <Route exact path={`${path}/infinite-farms`}>
                        <Helmet>
                            <title>{`Ubeswap — Farming • Infinite Farms`}</title>
                        </Helmet>

                        <EternalFarmsPage data={eternalFarms} refreshing={eternalFarmsLoading} priceFetched={ethPricesFecthed} fetchHandler={() => fetchEternalFarmsFn(true)} />
                    </Route>
                    {/* <Route exact strict path={`${path}/farms-history`}>
                        <Helmet>
                            <title>{t`Ubeswap — Farming • Farms History history`}</title>
                        </Helmet>
                        <EventsHistory />
                    </Route> */}
                </Switch>
            </Card>
            <SwitchLocaleLink />
        </>
    );
}
