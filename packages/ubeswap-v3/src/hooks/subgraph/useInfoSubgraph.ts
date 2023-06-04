import { useState } from "react";
import { useClients } from "./useClients";
import {
    CHART_FEE_LAST_ENTRY,
    CHART_FEE_LAST_NOT_EMPTY,
    CHART_FEE_POOL_DATA,
    CHART_POOL_DATA,
    CHART_POOL_LAST_ENTRY,
    CHART_POOL_LAST_NOT_EMPTY,
    FETCH_ETERNAL_FARM_FROM_POOL,
    POOLS_FROM_ADDRESSES,
    TOKENS_FROM_ADDRESSES,
    TOP_POOLS,
    TOP_TOKENS,
    TOTAL_STATS,
} from "../../utils/graphql-queries";
import { useBlocksFromTimestamps } from "../blocks";
import { useEthPrices } from "../useEthPrices";
import { useDeltaTimestamps } from "../../utils/queries";
import { formatTokenName, formatTokenSymbol, get2DayChange, getPercentChange } from "../../utils/info";
import {
    FactorySubgraph,
    FeeSubgraph,
    FormattedChartPool,
    FormattedFee,
    FormattedPool,
    FormattedToken,
    FormattedTotalStats,
    HistoryStakingSubgraph,
    LastPoolSubgraph,
    PoolAddressSubgraph,
    PoolSubgraph,
    PriceRangeChart,
    StakeSubgraph,
    SubgraphResponse,
    SubgraphResponseStaking,
    TokenAddressSubgraph,
    TokenInSubgraph,
    TotalStatSubgraph,
    PositionPriceRange,
    EternalFarmingByPool,
} from "../../models/interfaces";
import { fetchEternalFarmAPR, fetchPoolsAPR } from "../../utils/api";
import { farmingClient } from "apollo/client";

import AlgebraConfig from "../../algebra.config";
import { useContractKit } from "@celo-tools/use-contractkit";

function parsePoolsData(tokenData: PoolSubgraph[] | string) {
    if (typeof tokenData === "string") return {};
    return tokenData
        ? tokenData.reduce((accum: { [address: string]: PoolSubgraph }, poolData) => {
              accum[poolData.id] = poolData;
              return accum;
          }, {})
        : {};
}

function parseTokensData(tokenData: TokenInSubgraph[] | string) {
    if (typeof tokenData === "string") return {};
    return tokenData
        ? tokenData.reduce((accum: { [address: string]: TokenInSubgraph }, tokenData) => {
              accum[tokenData.id] = tokenData;
              return accum;
          }, {})
        : {};
}

export function useInfoSubgraph() {
    const { address: account } = useContractKit();
    const { dataClient } = useClients();
    const [t24, t48, tWeek] = useDeltaTimestamps();

    const { blocks, error: blockError } = useBlocksFromTimestamps([t24, t48, tWeek]);
    const [block24, block48, blockWeek] = blocks?.sort((a, b) => +b.timestamp - +a.timestamp) ?? [];

    const ethPrices = useEthPrices();

    const [poolsResult, setPools] = useState<string | null | FormattedPool[]>(null);
    const [poolsLoading, setPoolsLoading] = useState<boolean>(false);

    const [tokensResult, setTokens] = useState<string | null | FormattedToken[]>(null);
    const [tokensLoading, setTokensLoading] = useState<boolean>(false);

    const [feesResult, setFees] = useState<null | string | FormattedFee>(null);
    const [feesLoading, setFeesLoading] = useState<boolean>(false);

    const [chartPoolData, setChartPoolData] = useState<null | string | FormattedChartPool>(null);
    const [chartPoolDataLoading, setChartPoolDataLoading] = useState<boolean>(false);

    const [totalStats, setTotalStats] = useState<null | string | FormattedTotalStats>(null);
    const [totalStatsLoading, setTotalStatsLoading] = useState<boolean>(true);

    const [stakesResult, setStakes] = useState<null | string | SubgraphResponseStaking<FactorySubgraph[], StakeSubgraph[]>>(null);
    const [stakesLoading, setStakesLoading] = useState<boolean>(false);

    const [stakeHistoriesResult, setHistories] = useState<null | HistoryStakingSubgraph[] | string>(null);
    const [historiesLoading, setHistoriesLoading] = useState<boolean>(false);

    const [positionsRange, setPositionsRange] = useState<{ closed: PriceRangeChart | null; opened: PriceRangeChart | null }>({ closed: null, opened: null });

    const addressForCheck = AlgebraConfig.DEFAULT_TOKEN_LIST.filterForScamTokens.tokensForCheck;

    const possibleNames = AlgebraConfig.DEFAULT_TOKEN_LIST.filterForScamTokens.possibleFakeNames;

    async function fetchInfoPools() {
        if (!blocks || blockError || !ethPrices) return;

        try {
            setPoolsLoading(true);

            const {
                data: { pools: topPools },
                error,
            } = await dataClient.query<SubgraphResponse<PoolAddressSubgraph[]>>({
                query: TOP_POOLS,
                fetchPolicy: "network-only",
            });

            if (error) {
                setPools(`failed`);
                return;
            }

            const _poolsAddresses = topPools.map((el) => el.id);

            const {
                data: { pools: rawPools },
                error: _error2,
            } = await dataClient.query<SubgraphResponse<PoolSubgraph[]>>({
                query: POOLS_FROM_ADDRESSES(undefined, _poolsAddresses),
                fetchPolicy: "network-only",
            });

            if (_error2) {
                setPools(`failed`);
                return;
            }

            const pools = rawPools.filter((pool) => {
                const { symbol: token0Symbol, name: token0Name, id: token0Id } = pool.token0;
                const { symbol: token1Symbol, name: token1Name, id: token1Id } = pool.token1;

                if (token0Symbol.toUpperCase() in addressForCheck || possibleNames.some((el) => el.names.includes(token0Name))) {
                    return token0Id.toLowerCase() === addressForCheck[token0Symbol.toUpperCase()];
                }

                if (token1Symbol.toUpperCase() in addressForCheck || possibleNames.some((el) => el.names.includes(token1Name))) {
                    return token1Id.toLowerCase() === addressForCheck[token1Symbol.toUpperCase()];
                }

                return true;
            });

            const poolsAddresses = pools.map((pool) => pool.id);

            const [_block24, _block48, _blockWeek] = [block24, block48, blockWeek].sort((a, b) => +b.timestamp - +a.timestamp);

            const pools24 = await fetchPoolsByTime(_block24.number, poolsAddresses);
            const pools48 = await fetchPoolsByTime(_block48.number, poolsAddresses);
            const poolsWeek = await fetchPoolsByTime(_blockWeek.number, poolsAddresses);
            // const poolsMonth = await fetchPoolsByTime(_blockMonth.number, poolsAddresses)

            const parsedPools = parsePoolsData(pools);
            const parsedPools24 = parsePoolsData(pools24);
            const parsedPools48 = parsePoolsData(pools48);
            const parsedPoolsWeek = parsePoolsData(poolsWeek);
            // const parsedPoolsMonth = parsePoolsData(poolsMonth)

            const aprs = await fetchPoolsAPR();

            const farmAprs = await fetchEternalFarmAPR();

            const farmingAprs = await fetchEternalFarmingsAPRByPool(poolsAddresses);
            const _farmingAprs: { [type: string]: number } = farmingAprs.reduce(
                (acc, el) => ({
                    ...acc,
                    [el.pool]: farmAprs[el.id],
                }),
                {}
            );

            const formatted = poolsAddresses.reduce((accum: { [address: string]: FormattedPool | any }, address) => {
                const current: PoolSubgraph | undefined = parsedPools[address];
                const oneDay: PoolSubgraph | undefined = parsedPools24[address];
                const twoDay: PoolSubgraph | undefined = parsedPools48[address];
                const week: PoolSubgraph | undefined = parsedPoolsWeek[address];
                // const month: PoolSubgraph | undefined = parsedPoolsMonth[address]

                const manageUntrackedVolume = +current.volumeUSD <= 1 ? "volumeUSD" : "volumeUSD";
                const manageUntrackedTVL = +current.totalValueLockedUSD <= 1 ? "totalValueLockedUSD" : "totalValueLockedUSD";

                const [volumeUSD, volumeUSDChange] =
                    current && oneDay && twoDay
                        ? get2DayChange(current[manageUntrackedVolume], oneDay[manageUntrackedVolume], twoDay[manageUntrackedVolume])
                        : current && oneDay
                        ? [parseFloat(current[manageUntrackedVolume]) - parseFloat(oneDay[manageUntrackedVolume]), 0]
                        : current
                        ? [parseFloat(current[manageUntrackedVolume]), 0]
                        : [0, 0];

                const volumeUSDWeek = current && week ? parseFloat(current[manageUntrackedVolume]) - parseFloat(week[manageUntrackedVolume]) : current ? parseFloat(current[manageUntrackedVolume]) : 0;

                // const volumeUSDMonth = current && month ? parseFloat(current[manageUntrackedVolume]) - parseFloat(month[manageUntrackedVolume])
                //     : current ? parseFloat(current[manageUntrackedVolume]) : 0
                const volumeUSDMonth = current ? parseFloat(current[manageUntrackedVolume]) : 0;

                const txCount = current && oneDay ? parseFloat(current.txCount) - parseFloat(oneDay.txCount) : current ? parseFloat(current.txCount) : 0;

                const feesCollected = current && oneDay ? parseFloat(current.feesUSD) - parseFloat(oneDay.feesUSD) : current ? parseFloat(current.feesUSD) : 0;

                const tvlUSD = current ? parseFloat(current[manageUntrackedTVL]) : 0;
                const tvlUSDChange = getPercentChange(current ? current[manageUntrackedTVL] : undefined, oneDay ? oneDay[manageUntrackedTVL] : undefined);
                const aprPercent = aprs[address] ? aprs[address].toFixed(2) : 0;
                const farmingApr = _farmingAprs[address] ? +_farmingAprs[address].toFixed(2) : 0;

                accum[address] = {
                    token0: current.token0,
                    token1: current.token1,
                    fee: current.fee,
                    exists: !!current,
                    address,
                    volumeUSD,
                    volumeUSDChange,
                    volumeUSDWeek,
                    volumeUSDMonth,
                    tvlUSD,
                    txCount,
                    tvlUSDChange,
                    apr: aprPercent,
                    farmingApr,
                    feesCollected,
                };
                return accum;
            }, {});

            setPools(Object.values(formatted));
        } catch (err) {
            console.error("ERROR", err);
            setPools("failed");
            throw new Error("Info pools fetch " + err);
        } finally {
            setPoolsLoading(false);
        }
    }

    async function fetchInfoTokens() {
        if (!blocks || blockError || !ethPrices) return;

        try {
            setTokensLoading(true);

            const {
                data: { tokens: topTokens },
                error,
            } = await dataClient.query<SubgraphResponse<TokenAddressSubgraph[]>>({
                query: TOP_TOKENS,
                fetchPolicy: "network-only",
            });

            if (error) {
                setTokens("failed");
                return;
            }

            const _tokenAddresses: string[] = topTokens.map((el) => el.id);

            const {
                data: { tokens: rawTokens },
                error: _error,
            } = await dataClient.query<SubgraphResponse<TokenInSubgraph[]>>({
                query: TOKENS_FROM_ADDRESSES(undefined, _tokenAddresses),
                fetchPolicy: "network-only",
            });

            if (_error) {
                setTokens("failed");
                return;
            }

            const tokens = rawTokens.filter((token) => {
                if (token.symbol.toUpperCase() in addressForCheck || possibleNames.some((el) => el.names.includes(token.name))) {
                    return token.id.toLowerCase() === addressForCheck[token.symbol.toUpperCase()];
                }

                return true;
            });

            const tokenAddresses = tokens.map((token) => token.id);

            const [_block24, _block48] = [block24, block48].sort((a, b) => +b.timestamp - +a.timestamp);

            const tokens24 = await fetchTokensByTime(_block24.number, tokenAddresses);
            const tokens48 = await fetchTokensByTime(_block48.number, tokenAddresses);
            // const tokensWeek = await fetchTokensByTime(_blockWeek.number, tokenAddresses)

            const parsedTokens = parseTokensData(tokens);
            const parsedTokens24 = parseTokensData(tokens24);
            const parsedTokens48 = parseTokensData(tokens48);
            // const parsedTokensWeek = parseTokensData(tokensWeek)

            const formatted = tokenAddresses.reduce((accum: { [address: string]: FormattedToken | any }, address) => {
                const current: TokenInSubgraph | undefined = parsedTokens[address];
                const oneDay: TokenInSubgraph | undefined = parsedTokens24[address];
                const twoDay: TokenInSubgraph | undefined = parsedTokens48[address];
                // const week: TokenInSubgraph | undefined = parsedTokensWeek[address]

                const manageUntrackedVolume = +current.volumeUSD <= 1 ? "volumeUSD" : "volumeUSD";
                const manageUntrackedTVL = +current.totalValueLockedUSD <= 1 ? "totalValueLockedUSD" : "totalValueLockedUSD";

                const [volumeUSD, volumeUSDChange] =
                    current && oneDay && twoDay
                        ? get2DayChange(current[manageUntrackedVolume], oneDay[manageUntrackedVolume], twoDay[manageUntrackedVolume])
                        : current
                        ? [parseFloat(current[manageUntrackedVolume]), 0]
                        : [0, 0];

                // const volumeUSDWeek = current && week ? parseFloat(current[manageUntrackedVolume]) - parseFloat(week[manageUntrackedVolume]) : current ? parseFloat(current[manageUntrackedVolume]) : 0
                const volumeUSDWeek = current ? parseFloat(current[manageUntrackedVolume]) : 0;
                const tvlUSD = current ? parseFloat(current[manageUntrackedTVL]) : 0;
                const tvlUSDChange = getPercentChange(current ? current[manageUntrackedTVL] : undefined, oneDay ? oneDay[manageUntrackedTVL] : undefined);
                const tvlToken = current ? parseFloat(current[manageUntrackedTVL]) : 0;
                const priceUSD = current ? parseFloat(current.derivedMatic) * ethPrices!.current : 0;
                const priceUSDOneDay = oneDay ? parseFloat(oneDay.derivedMatic) * ethPrices.oneDay : 0;
                // const priceUSDWeek = week ? parseFloat(week.derivedMatic) * ethPrices.week : 0

                const priceUSDChange = priceUSD && priceUSDOneDay ? getPercentChange(priceUSD.toString(), priceUSDOneDay.toString()) : 0;
                // const priceUSDChangeWeek =
                // priceUSD && priceUSDWeek ? getPercentChange(priceUSD.toString(), priceUSDWeek.toString()) : 0
                const txCount = current && oneDay ? parseFloat(current.txCount) - parseFloat(oneDay.txCount) : current ? parseFloat(current.txCount) : 0;
                // const feesUSD =
                //     current && oneDay
                //         ? parseFloat(current.feesUSD) - parseFloat(oneDay.feesUSD)
                //         : current
                //             ? parseFloat(current.feesUSD)
                //             : 0

                accum[address] = {
                    exists: !!current,
                    address,
                    name: current ? formatTokenName(address, current.name) : "",
                    symbol: current ? formatTokenSymbol(address, current.symbol) : "",
                    volumeUSD,
                    volumeUSDChange,
                    // volumeUSDWeek,
                    txCount,
                    tvlUSD,
                    // feesUSD,
                    tvlUSDChange,
                    tvlToken,
                    priceUSD,
                    priceUSDChange,
                    // priceUSDChangeWeek
                };

                return accum;
            }, {});

            setTokens(Object.values(formatted));
        } catch (err) {
            setTokens("failed");
            throw new Error("Info tokens fetching " + err);
        } finally {
            setTokensLoading(false);
        }
    }

    async function fetchTokensByTime(blockNumber: number, tokenAddresses: string[]): Promise<TokenInSubgraph[] | string> {
        try {
            const {
                data: { tokens },
                error: error,
            } = await dataClient.query<SubgraphResponse<TokenInSubgraph[]>>({
                query: TOKENS_FROM_ADDRESSES(blockNumber, tokenAddresses),
                fetchPolicy: "network-only",
            });

            if (error) return `${error.name} ${error.message}`;

            return tokens;
        } catch (err) {
            throw new Error("Tokens fetching by time " + err);
        }
    }

    async function fetchPoolsByTime(blockNumber: number, tokenAddresses: string[]): Promise<PoolSubgraph[] | string> {
        try {
            const {
                data: { pools },
                error,
            } = await dataClient.query<SubgraphResponse<PoolSubgraph[]>>({
                query: POOLS_FROM_ADDRESSES(blockNumber, tokenAddresses),
                fetchPolicy: "network-only",
            });

            if (error) return `${error.name} ${error.message}`;

            return pools;
        } catch (err) {
            throw new Error("Pools by time fetching " + err);
        }
    }

    async function fetchLastEntry(pool: string): Promise<FeeSubgraph[] | string> {
        try {
            const {
                data: { feeHourDatas },
                error,
            } = await dataClient.query<SubgraphResponse<FeeSubgraph[]>>({
                query: CHART_FEE_LAST_ENTRY(),
                fetchPolicy: "network-only",
                variables: { pool },
            });

            if (error) return `${error.name} ${error.message}`;

            return feeHourDatas;
        } catch (err) {
            throw new Error("Fees last failed: " + err);
        }
    }

    async function fetchLastNotEmptyEntry(pool: string, timestamp: string): Promise<FeeSubgraph[] | string> {
        try {
            const {
                data: { feeHourDatas },
                error,
            } = await dataClient.query<SubgraphResponse<FeeSubgraph[]>>({
                query: CHART_FEE_LAST_NOT_EMPTY(),
                fetchPolicy: "network-only",
                variables: { pool, timestamp: Number(timestamp) },
            });
            if (error) return `${error.name} ${error.message}`;

            if (feeHourDatas.length === 0) return [];

            return feeHourDatas;
        } catch (err) {
            throw new Error("Fees last not empty failed:" + err);
        }
    }

    async function fetchPoolLastNotEmptyEntry(pool: string, timestamp: number): Promise<LastPoolSubgraph[] | string> {
        try {
            const {
                data: { poolHourDatas },
                error,
            } = await dataClient.query<SubgraphResponse<LastPoolSubgraph[]>>({
                query: CHART_POOL_LAST_NOT_EMPTY(),
                fetchPolicy: "network-only",
                variables: { pool, timestamp },
            });

            if (error) return `${error.name} ${error.message}`;

            if (poolHourDatas.length === 0) return [];

            return poolHourDatas;
        } catch (err) {
            throw new Error("Pool last not empty failed:" + err);
        }
    }

    async function fetchPoolLastEntry(pool: string): Promise<LastPoolSubgraph[] | string> {
        try {
            const {
                data: { poolHourDatas },
                error,
            } = await dataClient.query<SubgraphResponse<LastPoolSubgraph[]>>({
                query: CHART_POOL_LAST_ENTRY(),
                fetchPolicy: "network-only",
                variables: { pool },
            });

            if (error) return `${error.name} ${error.message}`;

            return poolHourDatas;
        } catch (err) {
            throw new Error("Fees last failed: " + err);
        }
    }

    async function fetchFeePool(pool: string, startTimestamp: number, endTimestamp: number) {
        try {
            setFeesLoading(true);

            const {
                data: { feeHourDatas },
            } = await dataClient.query<SubgraphResponse<FeeSubgraph[]>>({
                query: CHART_FEE_POOL_DATA(),
                fetchPolicy: "network-only",
                variables: { pool, startTimestamp, endTimestamp },
            });

            const _feeHourData = feeHourDatas.length === 0 ? await fetchLastEntry(pool) : feeHourDatas;

            if (typeof _feeHourData === "string") return;

            const previousData = await fetchLastNotEmptyEntry(pool, _feeHourData[0].timestamp);

            if (typeof previousData === "string") return;

            if (_feeHourData.length !== 0) {
                setFees({
                    data: _feeHourData,
                    previousData: previousData || [],
                });
            } else {
                setFees({
                    data: [],
                    previousData: previousData || [],
                });
            }
        } catch (err) {
            setFees("Failed");
        } finally {
            setFeesLoading(false);
        }
    }

    async function fetchChartPoolData(pool: string, startTimestamp: number, endTimestamp: number) {
        try {
            setChartPoolDataLoading(true);

            const {
                data: { poolHourDatas },
                error,
            } = await dataClient.query<SubgraphResponse<LastPoolSubgraph[]>>({
                query: CHART_POOL_DATA(),
                fetchPolicy: "network-only",
                variables: { pool, startTimestamp, endTimestamp },
            });

            if (error) return;

            const _poolHourDatas = poolHourDatas.length === 0 ? await fetchPoolLastEntry(pool) : poolHourDatas;

            if (typeof _poolHourDatas === "string") return;

            const previousData = await fetchPoolLastNotEmptyEntry(pool, _poolHourDatas[0].periodStartUnix);

            if (typeof previousData === "string") return;

            if (_poolHourDatas.length !== 0) {
                setChartPoolData({
                    data: _poolHourDatas,
                    previousData: previousData || [],
                });
            } else {
                setChartPoolData({
                    data: [],
                    previousData: previousData || [],
                });
            }
        } catch (err) {
            setChartPoolData("Chart pool data failed: " + err);
        } finally {
            setChartPoolDataLoading(false);
        }
    }

    async function fetchTotalStats() {
        try {
            setTotalStatsLoading(true);

            const [_block24, _block48, _blockWeek, _blockMonth] = [block24, block48].sort((a, b) => +b.timestamp - +a.timestamp);

            const { data: data, error: error } = await dataClient.query<SubgraphResponse<TotalStatSubgraph[]>>({
                query: TOTAL_STATS(),
                fetchPolicy: "network-only",
            });

            if (error) {
                setTotalStats("Failed");
                return;
            }

            const { data: data24, error: error24 } = await dataClient.query<SubgraphResponse<TotalStatSubgraph[]>>({
                query: TOTAL_STATS(_block24.number),
                fetchPolicy: "network-only",
            });

            if (error24) {
                setTotalStats("Failed");
                return;
            }

            // const { data: dataWeek, error: errorWeek } = await dataClient.query<SubgraphResponse<TotalStatSubgraph[]>>({
            //     query: TOTAL_STATS(_blockWeek.number),
            //     fetchPolicy: 'network-only'
            // })

            // if (errorWeek) {
            //     setTotalStats('Failed')
            //     return
            // }

            // const { data: dataMonth, error: errorMonth } = await dataClient.query<SubgraphResponse<TotalStatSubgraph[]>>({
            //     query: TOTAL_STATS(_blockMonth.number),
            //     fetchPolicy: 'network-only'
            // })

            // if (errorMonth) {
            //     setTotalStats('Failed')
            //     return
            // }

            const stats = data.factories[0];
            const stats24 = data24.factories[0];
            // const statsWeek = dataWeek.factories[0]
            // const statsMonth = dataMonth.factories[0]

            const volumeUSD = stats && stats24 ? parseFloat(stats.totalVolumeUSD) - parseFloat(stats24.totalVolumeUSD) : parseFloat(stats.totalVolumeUSD);

            const txCount = stats && stats24 ? parseFloat(stats.txCount) - parseFloat(stats24.txCount) : stats ? parseFloat(stats.txCount) : 0;

            const feesCollected = stats && stats24 ? parseFloat(stats.totalFeesUSD) - parseFloat(stats24.totalFeesUSD) : stats ? parseFloat(stats.totalFeesUSD) : 0;

            setTotalStats({
                tvlUSD: parseFloat(stats.totalValueLockedUSD),
                volumeUSD,
                txCount,
                feesCollected,
            });
        } catch (err) {
            console.error("total stats failed", err);
            setTotalStats("Failed");
        }

        setTotalStatsLoading(false);
    }

    async function fetchEternalFarmingsAPRByPool(poolAddresses: string[]): Promise<EternalFarmingByPool[]> {
        try {
            const {
                data: { eternalFarmings },
                error,
            } = await farmingClient.query({
                query: FETCH_ETERNAL_FARM_FROM_POOL(poolAddresses),
                fetchPolicy: "network-only",
            });

            return eternalFarmings;
        } catch (err) {
            throw new Error("Eternal fetch error " + err);
        }
    }

    return {
        blocksFetched: blockError ? false : !!ethPrices && !!blocks,
        fetchInfoPools: { poolsResult, poolsLoading, fetchInfoPoolsFn: fetchInfoPools },
        fetchInfoTokens: { tokensResult, tokensLoading, fetchInfoTokensFn: fetchInfoTokens },
        fetchChartFeesData: { feesResult, feesLoading, fetchFeePoolFn: fetchFeePool },
        fetchChartPoolData: { chartPoolData, chartPoolDataLoading, fetchChartPoolDataFn: fetchChartPoolData },
        fetchTotalStats: { totalStats, totalStatsLoading, fetchTotalStatsFn: fetchTotalStats },
    };
}
