import React, { useEffect, useMemo, useRef } from "react";
import Chart from "./Chart";
import Loader from "../Loader";
import { ChartType } from "../../models/enums";
import { isMobile, isTablet } from "react-device-detect";
import { FeeChart, FeeSubgraph, PoolHourData, PriceRangeChart } from "../../models/interfaces";
import { ChartToken } from "../../models/enums/poolInfoPage";
// import { Trans } from "@lingui/macro";
import { Token } from "@uniswap/sdk-core";
import Toggle from "../Toggle";
import "./index.scss";
import PositionsSelect from "../../components/PoolInfoChartToolbar/PositionsSelect";
import { useContractKit } from "@celo-tools/use-contractkit";

interface FeeChartRangeInputProps {
    fetchedData:
        | {
              data: FeeSubgraph[] | PoolHourData[];
              previousData: FeeSubgraph[] | PoolHourData[];
          }
        | undefined
        | string;
    refreshing: boolean;
    id: string;
    span: number;
    type: number;
    token: number;
    token1: Token | undefined;
    token0: Token | undefined;
    setToken: (a: number) => void;
    positions: {
        closed: PriceRangeChart | null | any;
        opened: PriceRangeChart | null | any;
    };
    selected: string[];
    setSelected: any;
}

export default function FeeChartRangeInput({ fetchedData, refreshing, span, type, token, token1, token0, setToken, positions, selected, setSelected }: FeeChartRangeInputProps) {
    const ref = useRef<HTMLDivElement>(null);

    const { address } = useContractKit();

    const formattedData: FeeChart = useMemo(() => {
        if (!fetchedData || typeof fetchedData === "string")
            return {
                data: [],
                previousData: [],
            };

        if (!fetchedData || !fetchedData.data || fetchedData.data.length === 0)
            return {
                data: [],
                previousData: [],
            };

        const isUntracked = fetchedData.data.some((el) => {
            if ("volumeUSD" in el) {
                return +el.volumeUSD < 1 && +el.untrackedVolumeUSD >= 1;
            }
            return;
        });
        const field =
            type === ChartType.PRICE
                ? token === ChartToken.TOKEN0
                    ? "token0Price"
                    : "token1Price"
                : type === ChartType.TVL
                ? "tvlUSD"
                : type === ChartType.VOLUME
                ? isUntracked
                    ? "untrackedVolumeUSD"
                    : "volumeUSD"
                : "feesUSD";

        if (type === ChartType.FEES) {
            return {
                data: fetchedData.data.map((el) => {
                    if ("fee" in el) {
                        return {
                            timestamp: new Date(+el.timestamp * 1000),
                            value: +el.fee / +el.changesCount / 10000,
                        };
                    }
                    return {
                        timestamp: new Date(),
                        value: 0,
                    };
                }),
                previousData: fetchedData.previousData.map((el) => {
                    if ("fee" in el) {
                        return {
                            timestamp: new Date(+el.timestamp * 1000),
                            value: +el.fee / +el.changesCount / 10000,
                        };
                    }
                    return {
                        timestamp: new Date(),
                        value: 0,
                    };
                }),
            };
        } else {
            return {
                data: fetchedData.data.map((el) => {
                    if ("volumeUSD" in el) {
                        return {
                            timestamp: new Date(el.periodStartUnix * 1000),
                            value: +el[field],
                        };
                    }
                    return {
                        timestamp: new Date(),
                        value: 0,
                    };
                }),
                previousData: fetchedData.previousData.map((el) => {
                    if ("volumeUSD" in el) {
                        return {
                            timestamp: new Date(el.periodStartUnix * 1000),
                            value: +el[field],
                        };
                    }
                    return {
                        timestamp: new Date(),
                        value: 0,
                    };
                }),
            };
        }
    }, [fetchedData, token, address]);

    return (
        <div className={"w-100 fee-chart pt-1 mxs_p-0"} ref={ref}>
            {refreshing ? (
                <div className={"fee-chart__mock-loader"}>
                    <Loader stroke={"white"} size={"25px"} />
                </div>
            ) : (
                <>
                    <div>
                        {type === ChartType.PRICE && (
                            <div className={"fee-chart__price-info"}>
                                <Toggle isActive={!!token} toggle={() => setToken(token === ChartToken.TOKEN0 ? 1 : 0)} checked={token0?.symbol} unchecked={token1?.symbol} />
                            </div>
                        )}
                        {type === ChartType.PRICE && address && (
                            <div className={"fee-chart__toggle"}>
                                <PositionsSelect positions={positions} selected={selected} setSelected={setSelected} />
                            </div>
                        )}
                    </div>
                    <Chart
                        feeData={formattedData}
                        dimensions={{
                            width: isTablet || isMobile ? (ref && ref.current && ref.current.offsetWidth - 40) || 0 : 1000,
                            height: isTablet || isMobile ? 200 : 400,
                            margin: { top: type === ChartType.PRICE ? 50 : 20, right: 20, bottom: isMobile ? 70 : 30, left: isMobile ? 30 : 35 },
                        }}
                        tokens={{ token0: token0?.symbol, token1: token1?.symbol }}
                        isMobile={isMobile}
                        span={span}
                        type={type}
                        token={token}
                        positions={positions}
                        selected={selected}
                    />
                </>
            )}
        </div>
    );
}
