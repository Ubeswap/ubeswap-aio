import { useCallback, useEffect, useMemo, useState } from "react";
import { RouteComponentProps } from "react-router";
import FeeChartRangeInput from "../../components/FeeChartRangeInput";
import PoolInfoChartToolbar from "../../components/PoolInfoChartToolbar/PoolInfoChartToolbar";
import { PoolInfoHeader } from "./PoolInfoHeader";
import { useInfoSubgraph } from "../../hooks/subgraph/useInfoSubgraph";
import { useInfoPoolChart } from "../../hooks/useInfoPoolChart";
import dayjs from "dayjs";
import Loader from "../../components/Loader";
import { useInfoTickData } from "../../hooks/subgraph/useInfoTickData";
import LiquidityBarChart from "../../components/LiquidityBarChart";
import { useToken } from "../../hooks/Tokens";
import { ChartSpan, ChartType } from "../../models/enums";
import { ChartToken } from "../../models/enums/poolInfoPage";
import "./index.scss";
import { InfoTotalStats } from "../../components/InfoTotalStats";
import { ArrowLeft } from "react-feather";
import { NavLink } from "react-router-dom";
import Card from "../../shared/components/Card/Card";
import { useContractKit } from "@celo-tools/use-contractkit";
// import { t, Trans } from "@lingui/macro";

interface PoolInfoPageProps {
    totalStats: any;
    fetchTotalStatsFn: any;
    fetchInfoPoolsFn: any;
    totalStatsLoading: any;
    blocksFetched: any;
    poolsResult: any;
}

export default function PoolInfoPage({
    totalStats,
    fetchTotalStatsFn,
    totalStatsLoading,
    fetchInfoPoolsFn,
    poolsResult,
    blocksFetched,
    match: {
        params: { id },
    },
}: PoolInfoPageProps & RouteComponentProps<{ id?: string }>) {
    const { address: account } = useContractKit();

    const {
        fetchPool: { fetchPoolFn, poolResult },
    } = useInfoPoolChart();

    const {
        fetchChartFeesData: { feesResult, feesLoading, fetchFeePoolFn },
        fetchChartPoolData: { chartPoolData, chartPoolDataLoading, fetchChartPoolDataFn },
        // fetchPriceRangePositions: { positionsRange, fetchPriceRangePositionsFn },
    } = useInfoSubgraph();

    const {
        fetchTicksSurroundingPrice: { ticksResult, ticksLoading, fetchTicksSurroundingPriceFn },
    } = useInfoTickData();

    const [span, setSpan] = useState(ChartSpan.DAY);
    const [type, setType] = useState(ChartType.VOLUME);
    const [token, setToken] = useState(ChartToken.TOKEN0);
    const [selected, setSelected] = useState<string[]>([]);

    useEffect(() => {
        setSelected([]);
    }, [account]);

    const startTimestamp = useMemo(() => {
        const day = dayjs();

        switch (span) {
            case ChartSpan.DAY:
                return day.subtract(1, "day").unix();
            case ChartSpan.WEEK:
                return day.subtract(168 + day.hour(), "hour").unix();
            case ChartSpan.MONTH:
                if (day.month() === 2) {
                    return day.subtract(31, "day").unix();
                }
                return day.subtract(30 * 24 + day.hour(), "hour").unix();
        }
    }, [span]);

    const chartTypes = [
        {
            type: ChartType.VOLUME,
            title: `Volume`,
        },
        {
            type: ChartType.TVL,
            title: `TVL`,
        },
        {
            type: ChartType.FEES,
            title: `Pool fee`,
        },
        {
            type: ChartType.LIQUIDITY,
            title: `Liquidity`,
        },
        {
            type: ChartType.PRICE,
            title: `Price`,
        },
    ];

    const chartSpans = [
        {
            type: ChartSpan.DAY,
            title: `Day`,
        },
        {
            type: ChartSpan.WEEK,
            title: `Week`,
        },
        {
            type: ChartSpan.MONTH,
            title: `Month`,
        },
    ];

    useEffect(() => {
        if (!id) return;

        if (type === ChartType.FEES) {
            fetchFeePoolFn(id, startTimestamp, Math.floor(new Date().getTime() / 1000));
        } else if (type === ChartType.LIQUIDITY) {
            fetchTicksSurroundingPriceFn(id);
        } else {
            fetchChartPoolDataFn(id, startTimestamp, Math.floor(new Date().getTime() / 1000));
        }

        // fetchPriceRangePositionsFn(id);
    }, [span, type, account]);

    useEffect(() => {
        if (!id) return;

        fetchPoolFn(id);
    }, [id]);

    const data = useMemo(() => {
        if (type === ChartType.FEES) {
            return feesResult;
        } else if (type === ChartType.LIQUIDITY) {
            return ticksResult;
        } else {
            return chartPoolData;
        }
    }, [feesResult, chartPoolData, ticksResult, account]);

    const refreshing = useMemo(() => {
        if (!feesLoading && !chartPoolDataLoading && !ticksLoading) return false;
        return feesLoading || chartPoolDataLoading || ticksLoading;
    }, [feesLoading, chartPoolDataLoading, ticksLoading]);

    const _token0 = useToken(poolResult?.token0.id);
    const _token1 = useToken(poolResult?.token1.id);

    const [zoom, setZoom] = useState(5);

    const MAX_ZOOM = 10;

    const handleZoomIn = useCallback(() => {
        if (zoom < MAX_ZOOM) {
            setZoom(zoom + 1);
        }
    }, [zoom]);

    const handleZoomOut = useCallback(() => {
        if (zoom > 0) {
            setZoom(zoom - 1);
        }
    }, [zoom]);

    return (
        <div className={"mb-3"}>
            <NavLink className={"f mb-1 c-p hover-op trans-op w-fc"} to={"/info/pools"}>
                <ArrowLeft className={"mr-05"} size={"1rem"} />
                <span>Back to pools table</span>
            </NavLink>
            {poolResult ? (
                <Card classes={"p-2 br-24 mxs_p-1"}>
                    <PoolInfoHeader
                        token0={_token0 ?? undefined}
                        token1={_token1 ?? undefined}
                        fee={poolResult.fee}
                        collectedFees={+poolResult.feesUSD < 1 ? poolResult.untrackedFeesUSD : poolResult.feesUSD}
                    />
                    <InfoTotalStats
                        data={totalStats}
                        refreshHandler={() => {
                            fetchTotalStatsFn();
                            fetchInfoPoolsFn();
                        }}
                        isLoading={totalStatsLoading}
                        blocksFetched={blocksFetched}
                        poolsStat={poolsResult}
                    />
                    <div className={"info-chart-wrapper br-12 ph-1 pb-1 mt-1"}>
                        <div className={"info-chart__toolbar"}>
                            <PoolInfoChartToolbar
                                chartSpans={chartSpans}
                                chartTypes={chartTypes}
                                setType={setType}
                                span={span}
                                type={type}
                                setSpan={setSpan}
                                zoom={zoom}
                                handleZoomIn={handleZoomIn}
                                handleZoomOut={handleZoomOut}
                            />
                        </div>
                        {type === ChartType.LIQUIDITY ? (
                            <LiquidityBarChart
                                //@ts-ignore
                                data={data}
                                token0={poolResult.token0.symbol}
                                token1={poolResult.token1.symbol}
                                refreshing={refreshing}
                                zoom={zoom}
                            />
                        ) : (
                            <FeeChartRangeInput
                                //@ts-ignore
                                fetchedData={data ?? undefined}
                                refreshing={refreshing}
                                id={id || ""}
                                span={span}
                                type={type}
                                token={token}
                                token0={_token0 ?? undefined}
                                token1={_token1 ?? undefined}
                                setToken={setToken}
                                positions={{ closed: [], opened: [] }}
                                selected={selected}
                                setSelected={setSelected}
                            />
                        )}
                    </div>
                </Card>
            ) : (
                <div className={"mock-loader"}>
                    <Loader stroke={"white"} size={"30px"} />
                </div>
            )}
        </div>
    );
}
